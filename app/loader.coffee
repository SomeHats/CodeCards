template = require 'templates/loader'

module.exports = class Loader extends Backbone.View
  initialize: ->
    @render()

  render: ->
    @$el.addClass 'loader'
    @$el.html template()
    
    header = @$ 'header'
    icons = @$ '.icon'

    setTimeout ->
      header.animate {
        opacity: 1
        translateY: '0px'
      }, {
        easing: 'ease'
      }

      icons.each (index) ->
        $(this).animate {
          opacity: 1
          translateY: '0px'
        }, {
          easing: 'ease'
          delay: index * 150 + 100
        }

    , 25

  unrender: ->
    @$el.removeClass 'loader'