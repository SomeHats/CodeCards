Interpreter = require 'CodeCards/interpreter'

Controller = require 'CodeCards/controller'
Stats = require 'lib/stats'

Mission = require 'CodeCards/mission'

template = require 'templates/CodeCards'
codeTemplate = require 'CodeCards/templates/code'

Handlebars.registerHelper 'safe', (html) ->
  return new Handlebars.SafeString(html)

module.exports = class CodeCards extends Backbone.View
  start: ->
    $code = $ '#code>div'
    _ths = @

    # The interpreter object is responsible for retrieving and processing a stream from
    # the user's webcam.
    @interpreter = new Interpreter el: @$ '#canvas'

    # Error is a string describing what went wrong. TODO: error objects,
    # with types and all that stuff.
    @interpreter.on 'error', (error) ->
      if _ths.play
        # Hacky displaying of error message
        $('#code-status').html 'Error: ' + error

        # Update stats
        _ths.stats.tick()

        # Send stats and error data to the remote control
        _ths.controller.send 'tick',
          fps: _ths.stats.fps
          interval: _ths.stats.interval
          status: 'error'
          message: error

    # The results object is an array of IDs, ordered according to where they should come
    # in a string
    @interpreter.on 'success', (results)->
      if _ths.play
        # Show a hacky success message
        $('#code-status').html 'Running...'

        # Update stats
        _ths.stats.tick()

        # Build the results into a string, according to the language file
        code = mission.language.build results
        
        # Render the code and errors
        $code.html codeTemplate code

        # Send stats and code to the remote control
        _ths.controller.send 'tick',
          fps: _ths.stats.fps
          interval: _ths.stats.interval
          status: 'success'
          code: code.html

        # Tell the world
        _ths.code = code.string
        _ths.trigger 'code', code.string

    # Load up the mission. TODO:- missions other than sample
    @mission = mission = new Mission 'fox'

    @setupController()

    # Run the mission when needed
    @on 'change:play', ->
      @interpreter.UserMedia.paused = !@play

      if !@play
        $('#mainview').addClass 'view-fullscreen'
        @mission.run(@code)
        $('#alert').html 'Paused.'
      else
        $('#mainview').removeClass 'view-fullscreen'
        @mission.reset()

  setupController: ->
    _ths = @
    controller = @controller = new Controller el: @$('.pin-entry'), CC: @

  interact: ->
    sec = @$ 'section'
    toggler = @$ '.toggler'

    toggler.on 'click', ->
      sec.toggleClass 'extended'

    @on 'toggle-camera', (val) ->
      if !val
        sec.addClass 'extended'
      else
        sec.removeClass 'extended'

    canCont = @$ '#camview .cnvs'
    camView = @$ '#camview'
    canCont.on 'click', ->
      camView.toggleClass 'hide-cnvs'

      
  render: (callback= (-> null), ctx = @) ->
    _ths = @
    @$el.html template()

    @stats = new Stats

    @interact()

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