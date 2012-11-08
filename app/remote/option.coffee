UI = require 'ui/ui'

module.exports = class Option extends Backbone.Model
  initialize: ->
    if !@has 'id'
      @set 'id', @cid

    if (!@has 'value') and (@has 'with') and (@has 'property')
      @set 'value', @get('with')[@get 'property']

    if !@has 'group'
      @set 'group', 'General'

    @on 'remove', ->
      console.log 'remove fired!'

  createView: ->
    @view = UI.createFrom @toJSON()
    if @view
      @view.on 'change', (value) ->
        @set 'value', value+'FORCECHANGE', silent: true
        @set 'value', value
      , @
      return @view
    else
      return false

  getExportable: ->
    val = @toJSON()
    val.with = undefined
    val.view = undefined
    val

  silentUpdate: (val) ->
    @set 'value', val, silent: true
    if @view
      @view.silentUpdate val