template = require 'interpreter/templates/remote'

module.exports = class Remote extends Backbone.View
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
        _ths.connect val
      else
        Util.alert 'Sorry, that\s not valid. Please enter the pin shown on the remote.'

    connect.on 'click', -> submit()
    pin.on 'keypress', (e) -> if e.which is 13 then submit()

  connect: (pin) ->
    console.log pin