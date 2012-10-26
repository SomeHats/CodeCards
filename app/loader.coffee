template = require 'templates/loader'

module.exports = class Loader extends Backbone.View
  initialize: ->

  render: (callback= (-> null), ctx = @) ->
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
        if index is 1
          $(this).animate {
            opacity: 1
            translateY: '0px'
          }, {
            easing: 'ease'
            delay: index * 150 + 100
            complete: -> callback.apply ctx
          }
        else
          $(this).animate {
            opacity: 1
            translateY: '0px'
          }, {
            easing: 'ease'
            delay: index * 150 + 100
          }
    , 25

  unrender: (callback= (-> null), ctx = @) ->
    header = @$ 'header'
    icons = @$ '.icon'
    header.animate {
      opacity: 0
      translateY: '-200px'
    }, {
      duration: 300
      easing: 'ease-in'
    }

    icons.each (index) ->
        if index is 1
          $(this).animate {
            opacity: 0
            translateY: '150px'
          }, {
            easing: 'ease-in'
            delay: index * 150
            duration: 300
            complete: -> callback.apply ctx
          }
        else
          $(this).animate {
            opacity: 0
            translateY: '150px'
          }, {
            easing: 'ease-in'
            delay: index * 150
            duration: 300
          }

  name: 'loader'