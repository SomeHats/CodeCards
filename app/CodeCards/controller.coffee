template = require 'CodeCards/templates/controller'

module.exports = class Controller extends Backbone.View
  initialize: ->
    @render()

  render: ->
    @$el.html template()
    _ths = @

    open = @$ '.remote'
    connect = @$ '.go'
    cancel = @$ '.cancel'
    pin = @$ 'input'

    open.on 'click', ->
      _ths.$el.removeClass 'hide'
      pin.focus()

    cancel.on 'click', -> _ths.$el.addClass 'hide'

    submit = ->
      val = pin.val()
      if val.length is 4 and !isNaN(parseFloat(val)) and isFinite(val)
        _ths.$el.addClass 'hide'
        pin.blur()
        _ths.connect val
      else
        Util.alert 'Sorry, that\s not valid. Please enter the pin shown on the remote.'

    connect.on 'click', -> submit()
    pin.on 'keypress', (e) -> if e.which is 13 then submit()

  connect: (pin) ->
    _ths = @

    status = @$ '.status'
    status.html 'Connecting...'

    socket = io.connect 'http://' + window.location.host, 'force new connection':true

    socket.on 'error', (e) ->
      status.html 'Could not connect.'
      Util.alert 'Could not establish connection :('
      console.log e

    socket.on 'deny', ->
      status.html 'Wrong pin.'
      Util.alert 'There wasn\'t a remote with that pin online. Are you sure it was correct?'
      _ths.$('.remote').trigger 'click'

    socket.on 'accept', ->
      status.html 'Connected: ' + pin

      socket.emit 'client', 
        event: 'join'
        data: pin
      socket.on 'remote', (data) ->
        _ths.trigger data.event, data.data

      _ths.send = (event, data) ->
        socket.emit 'client',
          event: event
          data: data

    socket.emit 'new client', pin

  send: (event, data) -> null