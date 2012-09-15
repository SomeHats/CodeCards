UserMedia = require 'interpreter/usermedia'


module.exports = class Interpreter extends Backbone.View
  initialize: ->
    _ths = @

    @render()

    @UserMedia = new UserMedia {el: $ 'canvas'}
    @UserMedia.p = @

    #@UserMedia.on 'imageData', @detect

    worker = @worker = new Worker '/javascripts/workers.js'
    worker.onmessage = (e) ->
      _ths.trigger 'worker-' + e.data.event, e.data.data

    worker.send = (event, data) ->
      @postMessage
        event: event
        data: data

    @on 'worker-log', (data) -> console.log data

    @worker.send 'start', 'workers/init'

  render: ->
    #HighLighter.context = @ctx = @el.getContext '2d'
