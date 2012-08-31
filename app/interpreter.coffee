UserMedia = require 'interpreter/usermedia'
HighLighter = require 'interpreter/highlighter'

module.exports = class Interpreter extends Backbone.View
  initialize: ->
    @UserMedia = new UserMedia {el: @el}
    @UserMedia.p = @

    HighLighter.context = @el.getContext '2d'

    @UserMedia.on 'imageData', @detect

  detect: ->
    @p.markers = @p.detector.detect @imageData
    
    @p.highlight.apply @p
    @p.interpret.apply @p

  highlight: ->
    HighLighter.drawCorners @markers
    HighLighter.drawIDs @markers

  interpret: ->
    # To Do

  detector: new AR.Detector 15