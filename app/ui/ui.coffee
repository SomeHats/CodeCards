module.exports = UI =
  Slider: require 'ui/slider'
  Toggle: require 'ui/toggle'
  createFrom: (model) ->
    el = null
    switch model.type
      when 'range'
        el = new @Slider model

      when 'toggle-button'
        el = new @Toggle model

    el