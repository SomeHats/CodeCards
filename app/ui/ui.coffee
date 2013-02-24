#### /ui/UI
#UI widget class. Mainly for remote control

# Basically everything in the ui folder needs refactoring. It's not very
# DRY at all.

module.exports = UI =
  Slider: require 'ui/slider'
  Toggle: require 'ui/toggle'
  Button: require 'ui/button'

  # Create a UI element view from an instance of the corresponding model
  createFrom: (model) ->
    el = null
    switch model.type
      when 'range'
        el = new @Slider model

      when 'toggle-button'
        el = new @Toggle model

      when 'button'
        el = new @Button model

    el