Interpreter = require 'interpreter'

Remote = require 'interpreter/remote'
Stats = require 'interpreter/stats'

Mission = require 'interpreter/mission'

template = require 'templates/main'

module.exports = class App extends Backbone.View
  start: ->
    $code = $ 'code'
    _ths = @

    # The interpreter object is responsible for retrieving and processing a stream from
    # the user's webcam.
    @interpreter = new Interpreter el: @$ '#canvas'

    # Error is a string describing what went wrong. TODO: error objects,
    # with types and all that stuff.
    @interpreter.on 'error', (error) ->
      if _ths.play
        # Hacky displaying of error message
        $('#alert').html 'Error: ' + error

        # Update stats
        _ths.stats.tick()

        # Send stats and error data to the remote control
        _ths.remote.send 'tick',
          fps: _ths.stats.fps
          interval: _ths.stats.interval
          status: 'error'
          message: error

    # The results object is an array of IDs, ordered according to where they should come
    # in a string
    @interpreter.on 'success', (results)->
      if _ths.play
        # Show a hacky success message
        $('#alert').html 'Running...'

        # Update stats
        _ths.stats.tick()

        # Composite the results into a string, according to the language file
        code = ""
        code += language.words[result] for result in results
        
        # Make it look nice and render it to the page
        code = js_beautify code
        $code.html code

        # Send stats and code to the remote control
        _ths.remote.send 'tick',
          fps: _ths.stats.fps
          interval: _ths.stats.interval
          status: 'success'
          code: code

        # Tell the world
        _ths.code = code
        _ths.trigger 'code', code

    # Load up the mission. TODO:- missions other than sample
    @mission = mission = new Mission 'sample'

    # Run the mission when needed
    @on 'change:play', ->
      @interpreter.UserMedia.paused = !@play

      if !@play
        @code = 'robot.move();if(robot.touch()===wall){robot.turn(back);}'
        @mission.run(@code)
        $('#alert').html 'Paused.'
      else
        @mission.reset()

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