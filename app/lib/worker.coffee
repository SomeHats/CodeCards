#### /lib/Worker
# tiny abstraction layer for Web Workers

module.exports = class WebWorker extends Backbone.Model
  initialize: ->
    # All workers are loaded from one workers.js script
    worker = @worker = new Worker '/javascripts/workers.js'

    _ths = @

    # Messaged from the workers appear to other modules as Backbone events
    worker.onmessage = (e) ->
      _ths.trigger e.data.event, e.data.data

    # workers.js includes the common.js wrapper. The required module is loaded
    # on the start event. Once a module has been loaded by the start event, no 
    # other modules can be loaded.
    @send 'start', 'workers/' + @get 'name'

    # Set a flag saying whether the worker is ready - ie common.js has loaded 
    # the requested module.
    @on 'WW_READY', (r) ->
      _ths.ready = r

  # Send events & data to the worker.
  send: (event, data)->
    @worker.postMessage
      event: event
      data: data

  ready: no