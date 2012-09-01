Interpreter = require 'interpreter'
require 'lib/util'

data = require 'data/test'

module.exports = class App extends Backbone.View
  initialize: ->
    window.Util.animationFrame()
    @interpreter = new Interpreter el: $ 'canvas'

    $code = $ 'code'

    @interpreter.on 'error', (error) ->
      $('#alert').html 'Error: ' + error

    @interpreter.on 'success', (results)->
      code = ""
      code += data[result] for result in results
      code = js_beautify code
      $('#alert').html 'Success!'
      $code.html code

      Prism.highlightElement $code[0], false
