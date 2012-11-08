module.exports = UI =
  Slider: require 'ui/slider'
  Toggle: require 'ui/toggle'
  Button: require 'ui/button'
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