module.exports =

  # language: which language definitions are needed for your mission? Give them
  #           in the form name: version
  language:
    robot: 0

  # initialize: a function to be called when setting up your mission on screen.
  #             The function is passed a single DOM element. Put any HTML inside
  #             this element, but try not to modify the element itself.
  initialize: (el) ->
    template = require 'data/missions/templates/sample'
    $el = $ el

    $el.html template()
    