#### /Initialize
# set up the app and load all dependencies 

# Basic utilities
require 'lib/util'

# URL router
Router = require 'router'

# Landing page
Home = require 'home'

# The actual CodeCards app
CodeCards = require 'CodeCards/CodeCards'

# The remote control part of the app
Remote = require 'remote'

module.exports = class App extends Backbone.View

  initialize: ->

    # Start up an abstracted requestAnimationFrame loop. This lets modules
    # subscribe to animation frame events with Util.on "animationFrame"
    window.Util.animationFrame()

    # Fetch standard DOM elements
    @cont = $ '#container'
    @$body = $ document.body
    
    # Set up the router and Backbone.history
    router = new Router
    _ths = @

    router.on 'route:root', -> _ths.start Home, 'home'
    router.on 'route:codecards', -> _ths.start CodeCards, 'codeCards'
    router.on 'route:remote', -> _ths.start Remote, 'remote'

    Backbone.history.start()

    window.router = router

  # Load up view with class "page". This will be either Home, CodeCards or Remote.
  start: (page, name) ->
    @$body.addClass 'transitioning'
    window.scrollTo 0, 0
    @unrenderCurrent ->
      @[name] = new page el: @cont
      @current = @[name]
      @renderCurrent()

  # When ready, actually attach the new view to the DOM
  renderCurrent: ->
    @cont.addClass @current.name
    _ths = @
    @current.render ->
      _ths.$body.removeClass 'transitioning'

  # Remove the last view from the DOM
  unrenderCurrent: (callback= -> null) ->
    @current.unrender ->
      @cont.removeClass @current.name
      @cont.html ''
      callback.apply @
    , @

  # Blank temporary functions which can be called when adding the first view to the App.
  current:
    unrender: (callback= (-> null), ctx=@) -> callback.apply ctx
    render: (callback= (-> null), ctx=@) -> callback.apply ctx
    name: ''