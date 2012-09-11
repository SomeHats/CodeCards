Interpreter = require 'interpreter'
data = require 'data/test'

template = require 'templates/main'

module.exports = class App extends Backbone.View
  initialize: ->
    @render()

    @$ 'canvas'

    @interpreter = new Interpreter el: @$ '#canvas'

    $code = $ 'code'

    stats = new Stats
    stats.setMode 0
    document.body.appendChild stats.domElement

    @interpreter.on 'error', (error) ->
      stats.end()
      stats.begin()
      $('#alert').html 'Error: ' + error

    @interpreter.on 'success', (results)->
      stats.end()
      stats.begin()
      code = ""
      code += data[result] for result in results
      $('#alert').html 'Success! ' + code
      code = js_beautify code
      $code.html code

      #Prism.highlightElement $code[0], false

    window.inte = @interpreter

    gui = new dat.GUI
    gui.add(@interpreter, 'blend', 1, 30).step 1
    gui.add @interpreter, 'brightness', -100, 100
    gui.add @interpreter, 'contrast', -100, 100
    gui.add(@interpreter, 'sharpen', 0, 10).setValue 0
    gui.add @interpreter, 'distanceLimit', 1, 30

  render: ->
    @$el.html template()