ImageFilters = require 'workers/imagefilters'
AR = require 'workers/aruco'
Marker = require 'workers/marker'

module.exports = class Init extends require('workers/worker')
  initialize: ->
    @ready()

    @detector = new AR.Detector 12

    @on 'settings', (settings) ->
      for key of settings
        @settings[key] = settings[key]

    @on 'set', (setting) ->
      @settings[setting.attribute] = setting.value

    @on 'raw-image', (data) ->
      @busy()
      @data = data
      img = data.img

      if data.blend isnt 1
        if @imageData.length > data.blend
          @pimageData = []

        @imageData.push img

        if @imageData.length is data.blend
          img = @averageImageData()
          @imageData.shift()

      if data.brightness isnt 0 or data.contrast isnt 0
        img = ImageFilters.BrightnessContrastGimp img, data.brightness, data.contrast
      if data.sharpen isnt 0
        img = ImageFilters.Sharpen img, data.sharpen

      @send 'filtered-image', img

      @detect img

  detect: (img) ->
    markers = @detector.detect img

    markers = markers.map (marker, index) ->
      new Marker marker.id, marker.corners, index

    @interpret markers

  interpret: (markers) ->
    results = []
    current = markers.filter (marker) ->
      marker.id is 0

    if current.length is 0
      @send 'error', 
        msg: 'No start marker found!'
        markers: markers
      @ready()
    else if current.length > 1
      @send 'error', 
        msg: 'Too many start markers visible'
        markers: markers
      @ready
    else
      current = current[0]
      current.colour = 'magenta'
      current.available = no

      lineStarter = current

      success = yes
      while success
        success = no
        if current.contains @data.mousex, @data.mousey
          current.colour = 'cyan'
          current.highlightExtra = on

        current.radius = current.size * @data.distanceLimit

        # Get markers following current
        candidates = markers.filter (marker) ->
          marker.available and marker.index isnt current.index and current.lookAhead marker.x, marker.y

        if candidates.length isnt 0
          for candidate in candidates
            candidate.distanceFromCurrent = candidate.distanceFrom current.x, current.y

          candidates.sort @sortByDistance

          if candidates[0].distanceFromCurrent <= current.radius
            results.push candidates[0].id
            current = candidates[0]
            current.colour = 'lime'
            current.available = no
            success = yes

        if success is no
          results.push 0
          candidates = markers.filter (marker) ->
            marker.available and marker.index isnt current.index and lineStarter.isAbove marker.x, marker.y

          if candidates.length isnt 0
            for candidate in candidates
              candidate.distanceFromCurrent = lineStarter.distanceAbove candidate.x, candidate.y

            candidates.sort @sortByDistance

            if candidates[0].distanceFromCurrent <= current.radius
              lsSuccess = true
              current = candidates[0]

              while lsSuccess
                lsSuccess = false
                current.radius = current.size * @distanceLimit

                candidates = markers.filter (marker) ->
                  marker.available and marker.index isnt current.index and current.lookBehind marker.x, marker.y

                if candidates.length isnt 0
                  for candidate in candidates
                    candidate.distanceFromCurrent = candidate.distanceFrom current.x, current.y

                  candidates.sort @sortByDistance

                  if candidates[0].distanceFromCurrent <= current.radius
                    lsSuccess = true
                    current = candidates[0]
                else
                  lineStarter = current

              results.push current.id
              current.colour = 'yellow'
              current.available = no
              success = yes

      @send 'success', 
        results: results
        markers: markers

      @ready()

  sortByDistance: (a, b) ->
    if a.distanceFromCurrent < b.distanceFromCurrent
      return -1
    else if a.distanceFromCurrent > b.distanceFromCurrent
      return 1
    else
      return 0

  averageImageData: ->
    data = @imageData
    for i in [0...data[0].data.length]
      v = 0
      for j in [0...data.length]
        v += data[j].data[i]
      v /= data.length
      data[0].data[i] = Math.round v

    return data[0]

  settings: {}
  imageData: []