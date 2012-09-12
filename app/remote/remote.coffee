template = require 'remote/templates/remote'

module.exports = class Remote extends Backbone.View
  initialize: ->
    @connected = false
    _ths = @

    socket = io.connect 'http://' + window.location.host, 'force new connection':true
    socket.on 'connect', ->
      @connected = true
    socket.on 'error', (e) ->
      Util.alert 'Could not connect to remote server.'
      router.navigate '/', trigger: on

    socket.on 'client', (data) ->
      alert data

    window.socket = @socket = socket

  render: (callback= (-> null), ctx = @) ->
    socket = @socket
    _ths = @
    socket.emit 'new remote'
    socket.on 'accept', (pin) ->
      _ths.$el.html template pin: pin

      setTimeout ->
        _ths.$('.pin').animate {
          opacity: 1
          translateY: '0px'
        }, {
          easing: 'ease'
          complete: -> callback.apply ctx
        }
      , 25

  unrender: (callback= (-> null), ctx = @) ->
    @socket.disconnect()
    @$('.pin').animate {
      opacity: 0
      translateY: '200px'
    }, {
      easing: 'ease-in'
      duration: 300
      complete: -> callback.apply ctx
    }

  name: 'remote'