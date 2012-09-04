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
      $('#alert').html 'Success! ' + code
      code = js_beautify code
      $code.html code

      #Prism.highlightElement $code[0], false

    gui = new dat.GUI
    gui.add(@interpreter, 'blend', 1, 30).step 1
    gui.add @interpreter, 'brightness', -100, 100
    gui.add @interpreter, 'contrast', -100, 100
    gui.add(@interpreter, 'sharpen', 0, 10).setValue 0
    gui.add @interpreter, 'distanceLimit', 1, 30
