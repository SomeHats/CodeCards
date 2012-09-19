Interpreter = require 'interpreter'
data = require 'data/test'

Remote = require 'interpreter/remote'
Stats = require 'interpreter/stats'

template = require 'templates/main'

module.exports = class App extends Backbone.View
  start: ->
    @interpreter = new Interpreter el: @$ '#canvas'

    $code = $ 'code'
    _ths = @

    @interpreter.on 'error', (error) ->
      _ths.stats.tick()
      $('#alert').html 'Error: ' + error
      _ths.remote.send 'tick',
        fps: _ths.stats.fps
        interval: _ths.stats.interval
        status: 'error'
        message: error

    @interpreter.on 'success', (results)->
      _ths.stats.tick()
      code = ""
      code += data[result] for result in results
      $('#alert').html 'Success! ' + code
      code = js_beautify code
      $code.html code
      _ths.remote.send 'tick',
        fps: _ths.stats.fps
        interval: _ths.stats.interval
        status: 'success'
        code: code

  setupRemote: ->
    _ths = @
    remote = @remote = new Remote el: @$ '.pin-entry'

    ## Receiving
    # Settings
    remote.on 'change-setting', (data) ->
      _ths[data.concerns][data.setting] = data.value

  interact: ->
    sec = @$ 'section'
    toggler = @$ '.toggler'

    toggler.on 'click', ->
      sec.toggleClass 'extended'
      
  render: (callback= (-> null), ctx = @) ->
    _ths = @
    @$el.html template()

    @stats = new Stats

    @interact()

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