Option = require 'remote/option'

template = require 'remote/template'

module.exports = {}

class RC extends Backbone.View
  initialize: ->
    @groups = {}
    _ths = @

    if @type is 'local'
      @render no

    @options = new Backbone.Collection
    @options.model = Option

    @options.getExportable = ->
      @map (val) ->
        val.getExportable()

    @options.on 'add', (added) ->
      id = added.attributes.id
      model = @where(id: id)[0]
      group = model.get 'group'

      view = model.createView()

      if view
        if !_ths.groups[group]
          _ths.createGroup group

        _ths.groups[group].append view.el

    @options.on 'change', (change) ->
      @send 'update', change.getExportable()

      if @type is 'local'
        @update change.toJSON()
    , @

    @on 'client-update remote-update', (update) ->
      model = @options.where id: update.id
      model[0].silentUpdate update.value
      if @type is 'local'
        @update @options.where(id: update.id)[0].toJSON()

  update: (obj) ->
    if typeof obj.property isnt 'undefined'
      obj.with[obj.property] = obj.value

    if typeof obj.event isnt 'undefined'
      obj.with.trigger obj.event, obj.value

    if typeof obj.callback is 'function'
      if typeof obj.with isnt 'undefined'
        obj.callback.apply obj.with, [obj.value]
      else
        obj.callback obj.value

  createGroup: (name) ->
    safeName = name.toLowerCase().replace ' ', '-'

    li = $('<li></li>').text(name).attr 
      title: safeName
      class: "RC-group-bu-#{safeName}"

    li.appendTo @$ 'nav ul'

    el = $('<section></section>').attr 'id', safeName
    el.append $('<h2></h2>').text name

    el.appendTo @$ '#groups'

    @groups[name] = el

    @setupNavBehaviour()

    if _.keys(@groups).length is 1
      li.trigger 'click'

  render: (pin) ->
    @$el.html template pin: pin
    @createGroup 'General'

  setupNavBehaviour: ->
    navItems = @$ 'nav li'
    pages = @$ 'section'

    navItems.off 'click'

    navItems.on 'click', ->
      el = $ @
      if ! el.hasClass 'active'
        navItems.filter('.active').removeClass 'active'
        el.addClass 'active'
        pages.filter('.active').removeClass 'active'
        pages.filter('#' + el.attr 'title').addClass 'active'

  showGroup: (name) ->
    navItems = @$ 'nav li'
    pages = @$ 'section'

    safeName = name.toLowerCase().replace ' ', '-'

    el = navItems.filter ".RC-group-bu-#{safeName}"
    navItems.filter('.active').removeClass 'active'
    el.addClass 'active'
    pages.filter('.active').removeClass 'active'
    pages.filter('#' + el.attr 'title').addClass 'active'

  clearGroup: (name) ->
    @options.remove @options.where group: name

  send: -> null

module.exports.Local = class Local extends RC
  connect: (pin) ->
    _ths = @

    @trigger 'status', 'Connecting...'

    socket = io.connect "http://#{window.location.host}", 'force new connection': yes

    socket.on 'error', (e) ->
      _ths.trigger 'status', 'Could not connect.'
      Util.alert 'Could note establish a connection :('

    socket.on 'deny', ->
      _ths.trigger 'status', 'Wrong pin.'
      Util.alert 'There wasn\'t a remote with that pin online. Are you sure it was correct?'

    socket.on 'accept', ->
      _ths.trigger 'status', 'Connected: ' + pin

      _ths.send = (event, data) ->
        socket.emit 'client',
          event: event
          data: data

    socket.emit 'new client',
      pin: pin,
      options: _ths.options.getExportable()

    socket.on 'remote', (data) ->
      _ths.trigger "remote-#{data.event}", data.data

  type: 'local'

module.exports.Remote = class Remote extends RC
  connect: ->
    @connected = false
    @hasPin = no
    _ths = @

    socket = io.connect 'http://' + window.location.host, 'force new connection': true

    socket.on 'connect', ->
      @connected = true

    socket.on 'error', ->
      Util.alert 'Could not connect to remote server'
      router.navigate '/', trigger: on

    socket.on 'client', (data) ->
      _ths.trigger "client-#{data.event}", data.data

    @on 'client-join', (data) ->
      @options.add data.options

    @send = (event, data) ->
      socket.emit 'remote',
        event: event
        data: data

    socket.emit 'new remote'
    socket.on 'accept', (pin) ->
      _ths.pin = pin
      _ths.trigger 'pin', pin
      _ths.hasPin = yes

  type: 'remote'