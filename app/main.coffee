Interpreter = require 'interpreter'

Remote = require 'interpreter/remote'
Stats = require 'interpreter/stats'

# Temporary solution:
Mission = require 'data/missions/sample.mission'
Language = require 'interpreter/language'

template = require 'templates/main'

module.exports = class App extends Backbone.View
  start: ->
    @interpreter = new Interpreter el: @$ '#canvas'

    @mission = Mission

    Mission.initialize $('#mission')[0]
    language =  @language = new Language Mission.language
    @on 'change:play', ->
      @interpreter.UserMedia.paused = !@play

      if !@play
        Mission.run(@code)
        $('#alert').html 'Paused.'
      else
        Mission.reset()

    $code = $ 'code'
    _ths = @

    @interpreter.on 'error', (error) ->
      if _ths.play
        _ths.stats.tick()
        $('#alert').html 'Error: ' + error
        _ths.remote.send 'tick',
          fps: _ths.stats.fps
          interval: _ths.stats.interval
          status: 'error'
          message: error

    @interpreter.on 'success', (results)->
      if _ths.play
        _ths.stats.tick()
        code = ""
        code += language.words[result] for result in results
        $('#alert').html 'Running...'
        code = js_beautify code
        $code.html code
        _ths.remote.send 'tick',
          fps: _ths.stats.fps
          interval: _ths.stats.interval
          status: 'success'
          code: code

        _ths.code = code

  setupRemote: ->
    _ths = @
    remote = @remote = new Remote el: @$ '.pin-entry'

    ## Receiving
    # Settings
    remote.on 'change-setting', (data) ->
      if data.concerns
        _ths[data.concerns][data.setting] = data.value
        _ths[data.concerns].trigger 'change:' + data.setting
      else
        _ths[data.setting] = data.value
        _ths.trigger 'change:' + data.setting

  interact: ->
    sec = @$ 'section'
    toggler = @$ '.toggler'

    toggler.on 'click', ->
      sec.toggleClass 'extended'

    @on 'change:expandcamera', ->
      if @expandcamera
        sec.addClass 'extended'
      else
        sec.removeClass 'extended'
      
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

  play: true
  code: "Util.alert('No code available.');"