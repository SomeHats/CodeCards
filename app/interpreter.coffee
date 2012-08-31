UserMedia = require 'interpreter/usermedia'
HighLighter = require 'interpreter/highlighter'

Marker = require 'interpreter/marker'

module.exports = class Interpreter extends Backbone.View
  initialize: ->
    @UserMedia = new UserMedia {el: @el}
    @UserMedia.p = @

    HighLighter.context = @el.getContext '2d'

    @UserMedia.on 'imageData', @detect

  detect: ->
    @p.markers = @p.detector.detect @imageData

    @p.markers = @p.markers.map (marker, index) ->
      new Marker marker.id, marker.corners, index

    @p.interpret.apply @p
    @p.highlight.apply @p

  highlight: ->
    HighLighter.drawCorners @markers
    HighLighter.drawIDs @markers
    #HighLighter.drawGuides @markers

  interpret: ->
    result = []
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

      success = yes
      while success
        success = no
        if current.contains Util.mouse.x, Util.mouse.y
          current.colour = 'cyan'
          current.highlightExtra = on

        # Get markers following current
        candidates = markers.filter (marker) ->
          marker.index isnt current.index and current.lookAhead marker.x, marker.y

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

          result.push candidates[0].id
          current = candidates[0]
          current.colour = 'lime'
          success = yes

      @trigger 'success', [result]


  detector: new AR.Detector 15