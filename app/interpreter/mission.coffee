Language = require 'interpreter/language'

module.exports = class Mission extends Backbone.View
  initialize: (name) ->
    @m = require "data/missions/#{name}.mission"

    @m.initialize $('#mission')[0]

    language = @language = new Language Mission.language

  run: (data) ->
    @m.run data

  reset: ->
    @m.reset()
