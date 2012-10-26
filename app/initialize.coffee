require 'lib/util'
Router = require 'router'

Home = require 'home'
CodeCards = require 'CodeCards/CodeCards'
Remote = require 'remote/remote'

module.exports = class App extends Backbone.View
  initialize: ->
    window.Util.animationFrame()

    @cont = $ '#container'
    @$body = $ document.body
    
    router = new Router
    _ths = @

    router.on 'route:root', -> _ths.start Home, 'home'
    router.on 'route:codecards', -> _ths.start CodeCards, 'codeCards'
    router.on 'route:remote', -> _ths.start Remote, 'remote'

    Backbone.history.start()

    window.router = router

  start: (page, name) ->
    @$body.addClass 'transitioning'
    window.scrollTo 0, 0
    @unrenderCurrent ->
      @[name] = new page el: @cont
      @current = @[name]
      @renderCurrent()

  renderCurrent: ->
    @cont.addClass @current.name
    _ths = @
    @current.render ->
      _ths.$body.removeClass 'transitioning'

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