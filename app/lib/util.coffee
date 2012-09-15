class util extends Backbone.View

  mouse:
    x: 0
    y: 0

  initialize: ->
    window.requestAnimationFrame = window.requestAnimationFrame or window.mozRequestAnimationFrame or 
                              window.webkitRequestAnimationFrame or (callback) -> setTimeout callback, 20

    _ths = @

    doc = $ document

    doc.on 'mousemove', (e) ->
      _ths.mouse.x = e.pageX
      _ths.mouse.y = e.pageY

  animationFrame: ->
    window.Util.trigger 'animationFrame'
    window.requestAnimationFrame Util.animationFrame
    null

  alert: (msg) ->
    # Temporary solution
    alert msg

  isDescendant: (child, parent) ->
    node = child.parentNode
    while node != null
      if node is parent
        return yes
      node = node.parentNode
    return no

window.Util = new util