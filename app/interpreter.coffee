UserMedia = require 'interpreter/usermedia'
HighLighter = require 'interpreter/highlighter'

WebWorker = require 'lib/worker'

module.exports = class Interpreter extends Backbone.View
  imageData: []
  blend: 3
  contrast: 0
  brightness: 0
  sharpen: 0
  distanceLimit: 4.5

  initialize: ->
    _ths = @

    @render()

    @UserMedia = new UserMedia {el: $ '<canvas>'}
    @UserMedia.p = @

    worker = @worker = new WebWorker name: 'init'

    worker.on 'log', (data) -> console.log data

    worker.send 'start', 'workers/init'

    @UserMedia.on 'imageData', ->
      if worker.ready
        data = 
          img: @UserMedia.imageData
          blend: @blend
          contrast: @contrast
          brightness: @brightness
          sharpen: @sharpen
          distanceLimit: @distanceLimit
          mousex: Util.mouse.x
          mousey: Util.mouse.y

        worker.send 'raw-image', data
    , @

    worker.on 'filtered-image', (img) ->
      @imgData = img
      console.log @ctx.putImageData img, 0, 0
    , @

    worker.on 'error', (data) ->
      @trigger 'error', data.msg
      @draw data.markers
    , @

    worker.on 'success', (data) ->
      @trigger 'success', data.results
      @draw data.markers
    , @

    worker.on 'pause', ->
      @UserMedia.paused = true
    , @

  set: (attribute, value) ->
    @[attribute] = value
    @worker.send 'set',
      attribute: attribute
      value: value

  render: ->
    HighLighter.context = @ctx = @el.getContext '2d'

  draw: (markers) ->
    @ctx.putImageData @imgData, 0, 0
    HighLighter.drawCorners markers
    HighLighter.drawIDs markers

  pause: ->
    @UserMedia.paused = yes

  unpause: ->
    @UserMedia.paused = no