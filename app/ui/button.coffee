template = require 'ui/templates/button'

module.exports = class Toggle extends Backbone.View
  initialize: ->
    _ths = @

    o = @options
    el = @$el

    @model = new Backbone.Model
      label: o.label or el.data 'label' or 'Label'
      value: o.value or el.data 'value' or 'value'
      text: o.text or el.data 'text' or 'Go'
      description: o.description or false

    @o = @model.toJSON()

    @model.on 'change', -> 
      _ths.update()
      _ths.trigger 'change', _ths.o.value

    @model.trigger 'change'

    @render()

  silentUpdate: (val) ->
    @update()

  update: ->
    @o = @model.toJSON()
    @$('button').text @o.button

  render: ->
    _ths = @
    model = @model.toJSON()
    @$el.addClass 'button'
    @$el.html template model

    button = @$ 'button'
    button.on 'click', ->
      _ths.model.trigger 'change'