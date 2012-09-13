Slider = require 'remote/slider'

template = require 'remote/templates/remote'

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
    socket = @socket

    sliders = @$ '.slider'
    sliders.each ->
      el = $ @
      slider = new Slider el: @
      slider.on 'change', (value) ->
        socket.emit 'remote', 
          event: 'change-setting'
          data:
            concerns: el.data 'concerns'
            setting: el.attr 'id'
            value: parseFloat value


  name: 'remote'