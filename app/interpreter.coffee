UserMedia = require 'interpreter/usermedia'

module.exports = class Interpreter extends Backbone.View
  initialize: ->
    @UserMedia = new UserMedia {el: @el}
    @UserMedia.p = @

    @UserMedia.on 'imageData', @detect

  detect: ->
    @p.markers = @p.detector.detect @imageData
    
    @p.highlight.apply @p
    @p.interpret.apply @p

  highlight: ->
    # To Do

  interpret: ->
    # To Do

  detector: new AR.Detector 15