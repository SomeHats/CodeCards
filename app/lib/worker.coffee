module.exports = class WebWorker extends Backbone.Model
  initialize: ->
    worker = @worker = new Worker '/javascripts/workers.js'

    _ths = @

    worker.onmessage = (e) ->
      _ths.trigger e.data.event, e.data.data

    @send 'start', 'workers/' + @get 'name'

    @on 'WW_READY', (r) ->
      _ths.ready = r

  send: (event, data)->
    @worker.postMessage
      event: event
      data: data

  ready: no