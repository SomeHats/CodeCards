#### /CodeCards/Interpreter
# The interpreter module is responsible for fetching the image data from
# the UserMedia module and converting it into a string of code. Most of 
# the heavy lifting is done within a web worker.

UserMedia = require 'lib/usermedia'
HighLighter = require 'lib/highlighter'

WebWorker = require 'lib/worker'

module.exports = class Interpreter extends Backbone.View
  imageData: []
  contrast: 0
  brightness: 0
  sharpen: 0
  distanceLimit: 4.5

  initialize: ->
    _ths = @

    @render()
    # Get the webcam stream
    @UserMedia = new UserMedia {el: $ '<canvas>'}
    @UserMedia.p = @

    # Load the web worker
    worker = @worker = new WebWorker name: 'init'

    worker.on 'log', (data) -> console.log data

    worker.send 'start', 'workers/init'

    # When there's imageData ready, send it to the worker to be processed
    @UserMedia.on 'imageData', ->
      if worker.ready
        data = 
          img: @UserMedia.imageData
          blend: 1
          contrast: @contrast
          brightness: @brightness
          sharpen: @sharpen
          distanceLimit: @distanceLimit
          mousex: Util.mouse.x
          mousey: Util.mouse.y

        worker.send 'raw-image', data
    , @

    # Event bindings from the worker
    worker.on 'filtered-image', (img) ->
      @imgData = img
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

  # Set up the highlighter
  render: ->
    HighLighter.context = @ctx = @el.getContext '2d'

  # Highlight stuff when needed
  draw: (markers) ->
    @ctx.putImageData @imgData, 0, 0
    HighLighter.drawCorners markers
    HighLighter.drawIDs markers

  pause: ->
    @UserMedia.paused = yes

  unpause: ->
    @UserMedia.paused = no