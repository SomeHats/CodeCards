require 'lib/util'
Router = require 'router'

Loader = require 'loader'
Main = require 'main'
Remote = require 'remote/remote'

module.exports = class App extends Backbone.View
  initialize: ->
    window.Util.animationFrame()

    @cont = $ '#container'
    @$body = $ document.body
    
    router = new Router
    _this = @

    router.on 'route:root', -> _this.start(Loader)
    router.on 'route:main', -> _this.start(Main)
    router.on 'route:remote', -> _this.start(Remote)

    Backbone.history.start()

    window.router = router

  start: (page) ->
    @$body.addClass 'transitioning'
    window.scrollTo 0, 0
    @unrenderCurrent ->
      @current = new page el: @cont
      @renderCurrent()

  renderCurrent: ->
    @cont.addClass @current.name
    _this = @
    @current.render ->
      _this.$body.removeClass 'transitioning'

  unrenderCurrent: (callback= -> null) ->
    @current.unrender ->
      @cont.removeClass @current.name
      @cont.html ''
      callback.apply @
    , @

  current:
    unrender: (callback= (-> null), ctx=@) -> callback.apply ctx
    render: (callback= (-> null), ctx=@) -> callback.apply ctx
    name: ''