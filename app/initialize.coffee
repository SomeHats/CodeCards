Interpreter = require 'interpreter'
require 'lib/util'

module.exports = class App extends Backbone.View
  initialize: ->
    window.Util.animationFrame()
    @interpreter = new Interpreter el: $ 'canvas'

    @interpreter.on 'error', (error) ->
      $('#alert').html 'Error: ' + error

    @interpreter.on 'success', (result)->
      $('#alert').html 'Success: ' + result.toString()
