template = require 'remote/templates/slider'

module.exports = class Slider extends Backbone.View
  initialize: ->
    _ths = @

    o = @options

    @model = new Backbone.Model
      label: o.label or 'Label'
      max: o.max or 100
      min: o.min or 0
      value: o.value or 50

    @o = @model.toJSON()

    @model.on 'change', -> _ths.o = @toJSON()

    @model.on 'change:value', -> _ths.update()

    @render()

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

  update: ->
    o = @o
    @thumb.css 'left', ((@model.get('value') - o.min) / (o.max - o.min)) * 100 + '%'
    @input.val @model.get 'value'

  setValue: (v) ->
    o = @o
    value = o.min + v * (o.max - o.min)
    @model.set 'value', Math.round value

  setFromCoord: (x) ->
    left = @track.offset().left
    min = left + 19
    max = @track.width() - 10
    if x < min
      v = 0
    else if x > max
      v = 1
    else
      v = (x - min) / (max - min)

    @setValue v