UserMedia = require 'interpreter/usermedia'
HighLighter = require 'interpreter/highlighter'

Marker = require 'interpreter/marker'

module.exports = class Interpreter extends Backbone.View
  imageData: []

  initialize: ->
    @UserMedia = new UserMedia {el: $ '<canvas>'}
    @UserMedia.p = @

    HighLighter.context = @ctx = @el.getContext '2d'

    @UserMedia.on 'imageData', @detect

    @blend = 10

  detect: ->
    @p.imageData.push @imageData
    if @p.imageData.length is @p.blend
      data = @p.averageImageData()
      console.log data
      @p.imageData = []
      @p.ctx.putImageData data, 0, 0

      @p.markers = @p.detector.detect data

      @p.markers = @p.markers.map (marker, index) ->
        new Marker marker.id, marker.corners, index

      @p.interpret.apply @p
      @p.highlight.apply @p

  highlight: ->
    HighLighter.drawCorners @markers
    HighLighter.drawIDs @markers
    #HighLighter.drawGuides @markers

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

        # Get markers following current
        candidates = markers.filter (marker) ->
          marker.available and marker.index isnt current.index and current.lookAhead marker.x, marker.y

        if candidates.length is 0
          current = lineStarter
          results.push 0
          candidates = markers.filter (marker) ->
            marker.available and marker.index isnt current.index and current.isAbove marker.x, marker.y

        if candidates.length isnt 0
          for candidate in candidates
            candidate.distanceFromCurrent = candidate.distanceFrom current.x, current.y

          candidates.sort (a, b) ->
            if a.distanceFromCurrent < b.distanceFromCurrent
              return -1
            else if a.distanceFromCurrent > b.distanceFromCurrent
              return 1
            else
              return 0

          results.push candidates[0].id
          current = candidates[0]
          current.colour = 'lime'
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

  detector: new AR.Detector 15