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

  clone: (obj) ->
    # From http://stackoverflow.com/questions/728360/copying-an-object-in-javascript
    # Handle the 3 simple types, and null or undefined
    if null is obj or "object" isnt typeof obj then return obj

    # Handle Date - not needed, so removed

    # Handle Array
    if obj instanceof Array
      copy = []
      copy = for item in obj
        @clone item
      return copy

    # Handle Object
    if obj instanceof Object
      copy = {};
      for attr of obj
        if obj.hasOwnProperty attr
          copy[attr] = @clone obj[attr]

      return copy;

    throw new Error("Unable to copy obj! Its type isn't supported.");

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

  loadJS: (src) ->
    el = document.createElement 'script'
    el.type = 'text/javascript'
    el.onload = ->
      console.log "Loaded script: #{src}"
    el.src = src 

    window.document.body.appendChild el

window.Util = new util