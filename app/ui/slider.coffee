template = require 'ui/templates/slider'

module.exports = class Slider extends Backbone.View
  tagName: "div"
  className: "slider"
  initialize: ->
    _ths = @

    o = @options
    el = @$el

    @model = new Backbone.Model
      label: if typeof o.label isnt undefined then o.label else el.data 'label' or 'Label'
      max: if typeof o.max isnt undefined then o.max else parseFloat el.data 'max' or 100
      min: if typeof o.min isnt undefined then o.min else parseFloat el.data 'min' or 0
      value: if typeof o.value isnt undefined then o.value else parseFloat el.data 'value' or 50
      float: o.float or el.data 'float' or no

    @o = @model.toJSON()

    @model.on 'change', -> _ths.o = @toJSON()

    @model.on 'change:value', -> _ths.update()

    @render()

  silentUpdate: (val) ->
    @model.set 'value', val, silent: true
    @o = @model.toJSON()
    @update false

  render: ->
    model = @model.toJSON()
    @$el.html template model
    @$el.addClass 'slider'

    track = @track = @$ '.track'
    input = @input = @$ 'input'
    @thumb = @$ '.thumb'
    doc = $ document

    @update()

    _ths = @

    # Handle mouse input
    track.on 'mousedown', (e) ->
      e.preventDefault()
      start = Date.now()

      _ths.setFromCoord e.pageX

      doc.on 'mousemove.slider' + start, (e) ->
        e.preventDefault()
        _ths.setFromCoord e.pageX

      doc.one 'mouseup', (e) ->
        e.preventDefault()
        doc.off 'mousemove.slider' + start

        _ths.setFromCoord e.pageX

    # Handle touch input
    track.on 'touchstart', (e) ->
      e.preventDefault()
      touch = e.changedTouches[0]
      tracking = touch.identifier

      _ths.setFromCoord touch.pageX

      doc.on 'touchmove.slider' + tracking, (e) ->
        touches = e.changedTouches
        for touch in e.changedTouches
          if touch.identifier is tracking then _ths.setFromCoord touch.pageX

      doc.one 'touchend', (e) ->
        touches = e.changedTouches
        for touch in e.changedTouches
          if touch.identifier is tracking
            _ths.setFromCoord touch.pageX
            doc.off 'touchmove.slider' + tracking

  update: (tellTheWord = true) ->
    o = @o
    v = @model.get 'value'
    @thumb.css 'left', ((v - o.min) / (o.max - o.min)) * 100 + '%'
    @input.val v
    if tellTheWord then @trigger 'change', v

  setValue: (v) ->
    o = @o
    value = o.min + v * (o.max - o.min)
    @model.set 'value', if o.float then value.toFixed 2 else Math.round value

  setFromCoord: (x) ->
    left = @track.offset().left
    min = left + 19
    max = left + @track.width() - 19
    if x < min
      v = 0
    else if x > max
      v = 1
    else
      v = (x - min) / (max - min)

    @setValue v