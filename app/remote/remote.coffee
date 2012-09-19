UI = require 'ui/ui'

template = require 'remote/template'

module.exports = class Remote extends Backbone.View
  initialize: ->
    @connected = false
    _ths = @

    socket = io.connect 'http://' + window.location.host, 'force new connection':true
    socket.on 'connect', ->
      @connected = true
    socket.on 'error', (e) ->
      Util.alert 'Could not connect to remote server.'
      router.navigate '/', trigger: on

    socket.on 'client', (data) ->
      _ths.trigger data.event, data.data

    @on 'join', @connectionEstablished

    @socket = socket

  connectionEstablished: ->
    pin = @$ '.pin'

    pin.animate {
      opacity: 0
      translateY: '200px'
    }, {
      easing: 'ease-in',
      duration: 300
      complete: ->
        pin.css 'display', 'none'
    }

    @$('.hide').removeClass 'hide'

    navItems = @$ 'nav li'
    pages = @$ 'section'
    navItems.on 'click', ->
      el = $ @
      if ! el.hasClass 'active'
        navItems.filter('.active').removeClass 'active'
        el.addClass 'active'
        pages.filter('.active').removeClass 'active'
        pages.filter('#' + el.attr 'title').addClass 'active'



  render: (callback= (-> null), ctx = @) ->
    socket = @socket
    _ths = @
    socket.emit 'new remote'
    socket.on 'accept', (pin) ->
      _ths.$el.html template pin: pin

      _ths.setupUI()

      setTimeout ->
        _ths.$('.pin').animate {
          opacity: 1
          translateY: '0px'
        }, {
          easing: 'ease'
          complete: -> callback.apply ctx
        }
      , 25

  unrender: (callback= (-> null), ctx = @) ->
    @socket.disconnect()
    @$('.pin').animate {
      opacity: 0
      translateY: '200px'
    }, {
      easing: 'ease-in'
      duration: 300
      complete: -> callback.apply ctx
    }

  setupUI: ->
    _ths = @
    socket = @socket

    # Sliders
    sliders = @$ '.slider'
    sliders.each ->
      el = $ @
      slider = new UI.Slider el: @
      slider.on 'change', (value) ->
        socket.emit 'remote', 
          event: 'change-setting'
          data:
            concerns: el.data 'concerns' or null
            setting: el.attr 'id'
            value: parseFloat value

    # Toggle buttons
    toggles = @$ '.toggle'
    toggles.each ->
      el = $ @
      toggle = new UI.Toggle el: @
      toggle.on 'change', (value) ->
        socket.emit 'remote',
          event: 'change-setting'
          data:
            concerns: el.data 'concerns' or null
            setting: el.attr 'id'
            value: value

    # Code Preview
    result = @$ '#result'
    code = @$ '#preview'

    # Performance stats
    fps = @$ '#fps'
    canvas = fps.find 'canvas'
    ctx = canvas[0].getContext '2d'
    ctx.strokeStyle = 'black'
    counter = fps.find 'span'
    lastWidth = fps.width()
    canvas.attr 'width', lastWidth
    stats = []
    max = 10
    for i in [0..lastWidth]
      stats[i] = 0

    @on 'tick', (data) ->
      # Code Preview
      if data.status is 'error'
        result.html 'Error: ' + data.message
        code.html ''
      else if data.status is 'success'
        result.html 'Code Preview:'
        code.html data.code
      else
        result.html 'Connection problem'
        code.html 'Please wait...'

      # Performance Stats
      n = data.fps
      max = if max < n then n else max
      width = fps.width()

      stats.push n

      if width isnt 0
        counter.html n.toFixed(2) + ' fps'
        if width isnt lastWidth
          lastWidth = width
          canvas.attr 'width', width

        stats.push n

        while stats.length > width
          stats.shift()

        ctx.clearRect 0, 0, width, 100

        ctx.beginPath()
        factor = max / 100
        for i in [0..width]
          ctx.moveTo i, 100
          ctx.lineTo i, 100 - (stats[i] / factor)

        ctx.stroke()

  name: 'remote'