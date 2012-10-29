template = require 'ui/templates/toggle'

module.exports = class Toggle extends Backbone.View
  initialize: ->
    _ths = @

    o = @options
    el = @$el

    @model = new Backbone.Model
      label: o.label or el.data 'label' or 'Label'
      value: if o.value or parseInt el.data 'value' or true then true else false
      true: o.true or el.data 'true' or 'True'
      false: o.false or el.data 'false' or 'False'

    @o = @model.toJSON()

    @model.on 'change', -> 
      _ths.update()
      _ths.trigger 'change', _ths.o.value

    @model.trigger 'change'

    @render()

  silentUpdate: (val) ->
    @model.set 'value', val, silent: true
    @update()

  update: ->
    @o = @model.toJSON()
    @o.text = if @o.value then @o.true else @o.false
    @$('button').text @o.text

  render: ->
    _ths = @
    model = @o
    @$el.html template model
    @$el.addClass 'toggle'

    button = @$ 'button'
    button.on 'click', ->
      value = ! _ths.model.get 'value'
      button.text _ths.model.get if value then 'true' else 'false'
      _ths.model.set 'value', value