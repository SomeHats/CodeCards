require 'lib/util'
Router = require 'router'

Loader = require 'loader'
Main = require 'main'

module.exports = class App extends Backbone.View
  initialize: ->
    window.Util.animationFrame()

    @cont = $ '#container'
    
    @router = new Router
    _this = @

    @router.on 'route:root', -> _this.start(Loader)

    @router.on 'route:main', -> _this.start(Main)

    Backbone.history.start()

  start: (page) ->
    @unrenderCurrent ->
      @current = new page el: @cont
      @renderCurrent()

  renderCurrent: ->
    @cont.addClass @current.name
    @current.render()

  unrenderCurrent: (callback= -> null) ->
    @current.unrender ->
      @cont.removeClass @current.name
      @cont.html ''
      callback.apply @
    , @

  startMain: ->
    @main = new Main el: @cont

  current:
    unrender: (callback= (-> null), ctx=@) -> callback.apply ctx
    render: (callback= (-> null), ctx=@) -> callback.apply ctx
    name: ''