#### /Home
# DOM bindings for the landing page

# Load the HTML template
template = require 'templates/home'

module.exports = class Loader extends Backbone.View
  initialize: ->

  # Render the view. Callback is the function to be called when the view
  # transition is finished.
  render: (callback= (-> null), ctx = @) ->

    # Insert the HTML from the template into the DOM
    @$el.html template()
    
    header = @$ 'header'
    icons = @$ '.icon'

    # Transition the view into visibility. setTimeout is used to avoid issues with
    # setting styles on DOM elements before they have been painted not causeing 
    # CSS3 transitions.
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

  # Get rid of the view. This function is only responsible for transitioning 
  # the view to its hidden state, not completely removing it from the DOM.
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