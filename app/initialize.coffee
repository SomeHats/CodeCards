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

    @router.on 'route:root', -> _this.startLoader()

    @router.on 'route:main', -> _this.startMain()

    Backbone.history.start()

  startLoader: ->
    @loader = new Loader el: @cont

  startMain: ->
    @main = new Main el: @cont