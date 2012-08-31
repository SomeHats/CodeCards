class util extends Backbone.View
  constructor: ->
    window.requestAnimationFrame = window.requestAnimationFrame or window.mozRequestAnimationFrame or 
                              window.webkitRequestAnimationFrame


  animationFrame: ->
    window.Util.trigger 'animationFrame'
    window.requestAnimationFrame Util.animationFrame
    null

window.Util = new util