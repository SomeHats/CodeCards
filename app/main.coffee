Interpreter = require 'interpreter'
data = require 'data/test'

Remote = require 'interpreter/remote'

template = require 'templates/main'

module.exports = class App extends Backbone.View
  initialize: ->
    stats = new Stats
    stats.setMode 0

    @$el.append stats.domElement

    @stats = stats

  start: ->
    @interpreter = new Interpreter el: @$ '#canvas'

    $code = $ 'code'
    _ths = @

    @interpreter.on 'error', (error) ->
      _ths.stats.end()
      _ths.stats.begin()
      $('#alert').html 'Error: ' + error

    @interpreter.on 'success', (results)->
      _ths.stats.end()
      _ths.stats.begin()
      code = ""
      code += data[result] for result in results
      $('#alert').html 'Success! ' + code
      code = js_beautify code
      $code.html code

    gui = new dat.GUI autoPlace: false
    gui.add(@interpreter, 'blend', 1, 30).step 16
    gui.add @interpreter, 'brightness', -100, 100
    gui.add @interpreter, 'contrast', -100, 100
    gui.add(@interpreter, 'sharpen', 0, 10).setValue 0
    gui.add @interpreter, 'distanceLimit', 1, 30
    @$el.append gui.domElement

  setupRemote: ->
    _ths = @
    remote = @remote = new Remote el: @$ '.pin-entry'

    # Settings
    remote.on 'change-setting', (data) ->
      _ths[data.concerns][data.setting] = data.value
      
  render: (callback= (-> null), ctx = @) ->
    _ths = @
    @$el.html template()

    @setupRemote()

    nav = @$ 'nav'
    setTimeout ->
      nav.animate {
        opacity: 1
        translateY: '0px'
      }, {
        easing: 'ease-out'
        duration: 250
        complete: -> callback.apply ctx
      }

      _ths.start()
    , 25

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