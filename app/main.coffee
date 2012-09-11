Interpreter = require 'interpreter'
data = require 'data/test'

Remote = require 'interpreter/remote'

template = require 'templates/main'

module.exports = class App extends Backbone.View
  initialize: ->
    stats = new Stats
    stats.setMode 0

    @$el.append stats.domElement

  start: ->
    @interpreter = new Interpreter el: @$ '#canvas'

    $code = $ 'code'

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

    gui = new dat.GUI autoPlace: false
    gui.add(@interpreter, 'blend', 1, 30).step 16
    gui.add @interpreter, 'brightness', -100, 100
    gui.add @interpreter, 'contrast', -100, 100
    gui.add(@interpreter, 'sharpen', 0, 10).setValue 0
    gui.add @interpreter, 'distanceLimit', 1, 30
    @$el.append gui.domElement

  render: (callback= (-> null), ctx = @) ->
    _this = @
    @$el.html template()

    remote = new Remote el: @$ '.pin-entry'

    nav = @$ 'nav'
    nav.animate {
      opacity: 1
      translateY: '0px'
    }, {
      easing: 'ease-out'
      duration: 250
      complete: -> callback.apply ctx
    }

    @start()

  unrender: (callback= (-> null), ctx = @) ->
    nav = @$ 'nav'
    nav.animate {
      opacity: 0
      translateY: '70px'
    }, {
      easing: 'ease-in'
      duration: 250
      complete: -> callback.apply ctx
    }

  name: 'main'