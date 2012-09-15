module.exports = class Stats extends Backbone.Model
  last: 0
  fps: 20
  interval: 50

  tick: ->
    last = @last
    if last is 0
      @last = Date.now()
      return
    else
      current = Date.now()
      interval = @interval = current - last
      @fps = 1000 / interval
      @trigger 'tick'
      @last = current