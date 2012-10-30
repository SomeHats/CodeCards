Language = require 'CodeCards/language'

module.exports = class Mission extends Backbone.View
  initialize: (name) ->
    @m = m =
      view: '2up'
      interpreter: 'linear'
      continuous: no

    controller = App.codeCards.controller

    _.extend m, require "data/missions/#{name}.mission"

    if typeof m.initialize isnt 'function'
      throw new TypeError "mission.initialize should be a function not #{typeof m.initialize}."

    if typeof m.language isnt 'object'
      throw new TypeError "mission.language should be an object not #{typeof m.language}."

    if typeof m.reset isnt 'function'
      throw new TypeError "mission.reset should be a function not #{typeof m.reset}."

    if typeof m.run isnt 'function'
      throw new TypeError "mission.run should be a function not #{typeof m.run}."

    if _.indexOf(@accepted.view, m.view) is -1
      throw new RangeError "mission.view should be #{@accepted.view.join ' or '}, not #{m.view}."

    if _.indexOf(@accepted.interpreter, m.interpreter) is -1
      throw new RangeError "mission.interpreter should be #{@accepted.interpreter.join ' or '}, not #{m.interpreter}."

    if typeof m.continuous isnt 'boolean'
      throw new TypeError "mission.continuous should be boolean not #{typeof m.continuous}."

    if !m.continuous
      controller.rc.options.add
        with: App.codeCards
        property: 'play'
        event: 'change:play'
        label: 'Mission'
        type: 'toggle-button'
        true: 'Play!'
        false: 'Reset'
        value: true

    if m.view is '2up'
      $('#mainview').removeClass 'view-fullscreen'
      controller.rc.options.add
        with: @
        event: 'fullscreen'
        label: 'Fullscreen mode'
        type: 'toggle-button'
        true: 'Turn off'
        false: 'Turn on'
        value: false

      @on 'fullscreen', (fs) ->
        if fs then $('#mainview').addClass 'view-fullscreen' else $('#mainview').removeClass 'view-fullscreen'

    else
      $('#mainview').addClass 'view-fullscreen'

    m.initialize
      rc: controller.rc
      el: $('#mission')[0]

    language = @language = new Language m.language

  run: (data) ->
    @m.run data

  reset: ->
    @m.reset()

  accepted:
    view: ['2up', 'fullscreen']
    interpreter: ['linear']
