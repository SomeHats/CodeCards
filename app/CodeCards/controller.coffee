template = require 'CodeCards/templates/controller'
RC = require 'remote/RC'

module.exports = class Controller extends Backbone.View
  initialize: ->
    rc = @rc = new RC.Local el: $ '#local-RC'

    CC = @options.CC

    rc.options.add [
      with: CC
      event: 'toggle-camera'
      label: 'Camera'
      type: 'toggle-button'
      value: true
      true: 'Show'
      false: 'Hide'
      group: 'Camera'
    ,
      with: CC.interpreter
      property: 'brightness'
      label: 'Brightness'
      type: 'range'
      min: -100
      max: 100
      group: 'General'
    ,
      with: CC.interpreter
      property: 'contrast'
      label: 'Contrast'
      type: 'range'
      min: -100
      max: 100
      group: 'Camera'
    ,
      with: CC.interpreter
      property: 'sharpen'
      label: 'Sharpen'
      type: 'range'
      float: true
      min: 0
      max: 5
      group: 'Camera'
    ,
      with: CC.interpreter
      property: 'distanceLimit'
      label: 'Distance Limit'
      type: 'range'
      float: true
      min: 0
      max: 15
      group: 'Camera'
    ]

    @render()

  render: ->
    @$el.html template()
    _ths = @

    open = @$ '.remote'
    connect = @$ '.go'
    cancel = @$ '.cancel'
    pin = @$ 'input'
    status = @$ '.status'

    @rc.on 'status', (msg) ->
      if msg is 'Wrong pin.'
        open.trigger 'click'

      status.html msg

    open.on 'click', ->
      _ths.$el.removeClass 'hide'
      pin.focus()

    cancel.on 'click', -> _ths.$el.addClass 'hide'

    submit = ->
      val = pin.val()
      if val.length is 4 and !isNaN(parseFloat(val)) and isFinite(val)
        _ths.$el.addClass 'hide'
        pin.blur()
        _ths.rc.connect val
      else
        Util.alert 'Sorry, that\s not valid. Please enter the pin shown on the remote.'

    connect.on 'click', -> submit()
    pin.on 'keypress', (e) -> if e.which is 13 then submit()

  send: (event, data) ->
    @rc.send event, data