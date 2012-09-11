UserMedia = require 'interpreter/usermedia'
HighLighter = require 'interpreter/highlighter'

Marker = require 'interpreter/marker'

module.exports = class Interpreter extends Backbone.View
  imageData: []
  blend: 3
  contrast: 0
  brightness: 0
  sharpen: 1.5
  distanceLimit: 4.5

  initialize: ->
    @render()

    @UserMedia = new UserMedia {el: $ '<canvas>'}
    @UserMedia.p = @

    @UserMedia.on 'imageData', @detect

  render: ->
    HighLighter.context = @ctx = @el.getContext '2d'

  pause: ->
    @UserMedia.paused = yes

  unpause: ->
    @UserMedia.paused = no

  detect: ->
    if @p.imageData.length > @p.blend
      @p.imageData = []

    @p.imageData.push @imageData

    if @p.imageData.length is @p.blend
      data = if @p.blend is 1 then @p.imageData[0] else @p.averageImageData()
      @p.imageData.shift()

      if @p.brightness isnt 0 or @p.contrast isnt 0
        data = ImageFilters.BrightnessContrastGimp data, @p.brightness, @p.contrast
      if @p.sharpen isnt 0
        data = ImageFilters.Sharpen data, @p.sharpen

      @p.ctx.putImageData data, 0, 0

      @p.markers = @p.detector.detect data

      @p.markers = @p.markers.map (marker, index) ->
        new Marker marker.id, marker.corners, index

      @p.interpret()#.apply @p
      @p.highlight()#.apply @p

  highlight: ->
    HighLighter.drawCorners @markers
    HighLighter.drawIDs @markers

  interpret: ->
    results = []
    markers = @markers
    current = markers.filter (marker) ->
      marker.id is 0

    if current.length is 0
      @trigger 'error', 'No start marker found!'
    else if current.length > 1
      @trigger 'error', 'Too many start markers visible'
    else
      current = current[0]
      current.colour = 'magenta'
      current.available = no

      lineStarter = current

      success = yes
      while success
        success = no
        if current.contains Util.mouse.x, Util.mouse.y
          current.colour = 'cyan'
          current.highlightExtra = on

        current.radius = current.size * @distanceLimit

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

      @trigger 'success', results

  averageImageData: ->
    data = @imageData
    for i in [0...data[0].data.length]
      v = 0
      for j in [0...data.length]
        v += data[j].data[i]
      v /= data.length
      data[0].data[i] = Math.round v

    return data[0]

  sortByDistance: (a, b) ->
    if a.distanceFromCurrent < b.distanceFromCurrent
      return -1
    else if a.distanceFromCurrent > b.distanceFromCurrent
      return 1
    else
      return 0

  detector: new AR.Detector 15