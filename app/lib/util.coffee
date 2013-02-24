#### /lib/Util
# Basic utility function used all over CodeCards

class util extends Backbone.View

  # Util always contains the current mouse / pointer coordinates. This is for the 
  # use of CodeCards missions, but also for lib/highlighter
  mouse:
    x: 0
    y: 0

  # Normalize rAF. Set mouse coordinates
  initialize: ->
    window.requestAnimationFrame = window.requestAnimationFrame or window.mozRequestAnimationFrame or 
                              window.webkitRequestAnimationFrame or (callback) -> setTimeout callback, 20

    _ths = @

    doc = $ document

    doc.on 'mousemove', (e) ->
      _ths.mouse.x = e.pageX
      _ths.mouse.y = e.pageY

  # Fire an animationFrame event on window.Util, and request a new frame.
  # This allows multiple modules to benefit from rAF via Util.on "animationFrame"
  animationFrame: ->
    window.Util.trigger 'animationFrame'
    window.requestAnimationFrame Util.animationFrame
    null

  # Clone an object. This has now been implemented in many browsers, but this way is still
  # for some reason faster.
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

  # This should be replaced with a more integrated solution for alerting the user,
  # but has been left in so I can easily replace it in the future
  alert: (msg) ->
    # Temporary solution
    alert msg

  # Check an element is a descendant of another element
  isDescendant: (child, parent) ->
    node = child.parentNode
    while node != null
      if node is parent
        return yes
      node = node.parentNode
    return no

  # Load and arbitrary javascript file. This function is in needs to return a promise
  # or accept a callback, and needs better error detection.
  loadJS: (src) ->
    el = document.createElement 'script'
    el.type = 'text/javascript'
    el.onload = ->
      console.log "Loaded script: #{src}"
    el.src = src 

    window.document.body.appendChild el

# Make the Util object available globally. CodeCards only uses about 4 global variables.
# This is one because its functions are required by practically every other module.
window.Util = new util