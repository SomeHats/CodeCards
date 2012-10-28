Language = require 'CodeCards/language'

module.exports = class Mission extends Backbone.View
  initialize: (name) ->
    @m = m =
      view: '2up'
      interpreter: 'linear'
      continuous: no

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

    if m.view is '2up'
      $('#mainview').removeClass 'view-fullscreen'
    else
      $('#mainview').addClass 'view-fullscreen'

    m.initialize $('#mission')[0]

    language = @language = new Language m.language

  run: (data) ->
    @m.run data

  reset: ->
    @m.reset()

  accepted:
    view: ['2up', 'fullscreen']
    interpreter: ['linear']
