class util extends Backbone.View

  mouse:
    x: 0
    y: 0

  constructor: ->
    window.requestAnimationFrame = window.requestAnimationFrame or window.mozRequestAnimationFrame or 
                              window.webkitRequestAnimationFrame or (callback) -> setTimeout callback, 20

    self = @

    $(document).on 'mousemove', (e) ->
      self.mouse.x = e.pageX
      self.mouse.y = e.pageY

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

window.Util = new util