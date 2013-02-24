#### /ui/Button
# A basic button element

# Load the HTML template for the button
template = require 'ui/templates/button'

module.exports = class Toggle extends Backbone.View
  initialize: ->
    _ths = @

    o = @options
    el = @$el

    # Create a model to hold all the data associated with the button
    @model = new Backbone.Model
      label: o.label or el.data 'label' or 'Label'
      value: o.value or el.data 'value' or 'value'
      text: o.text or el.data 'text' or 'Go'
      description: o.description or false

    @o = @model.toJSON()

    # Data binding - make sure that when the model changes, the rest of the
    # world is told and the view reflects the changes
    @model.on 'change', -> 
      _ths.update()
      _ths.trigger 'change', _ths.o.value

    @model.trigger 'change'

    @render()

  # Update the model without triggering any events or view redraws
  silentUpdate: (val) ->
    @update()

  # Update o and reflect the changes in the DOM 
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