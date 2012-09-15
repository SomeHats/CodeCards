module.exports = class Init extends require('workers/worker')
  initialize: ->
    @send 'log', 'All\'s well!'