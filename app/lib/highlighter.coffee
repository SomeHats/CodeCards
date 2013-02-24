#### /lib/Highlighter
# Draw debuging data from the interpreter to the canvas

class Highlighter
  # Draw a set of markers to the canvas
  drawCorners: (markers) ->
    ctx = @context

    for marker in markers
      corners = marker.corners

      # Draw the marker lookahead region (the area in which other markers will
      # be interpreted as directly following the current one) and the radius
      # (the region that other markers have to be within to associate with the 
      # current one). This extra information is only drawn if highlightExtra is
      # true - usually because the pointer is over that marker.
      if marker.highlightExtra
        @drawLookahead marker
        @drawRadius marker

      ctx.strokeStyle = marker.colour

      ctx.lineWidth = 3

      ctx.beginPath()

      # Draw the corners
      @trace corners

      ctx.stroke()
      ctx.closePath()

      ctx.strokeStyle = 'cyan'
      ctx.strokeRect corners[0].x - 2, corners[0].y - 2, 4, 4

  # Draw little ID numbers near each marker
  drawIDs: (markers) ->
    ctx = @context

    ctx.strokeStyle = "green"
    ctx.lineWidth = 1

    for marker in markers
      x = Infinity
      y = Infinity

      for corner in marker.corners
        x = Math.min x, corner.x
        y = Math.min y, corner.y

      ctx.strokeText marker.id, x, y

  # Draw a circle round the marker with radius marker.radius
  drawRadius: (marker) ->
    ctx = @context
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 1

    ctx.beginPath()

    if marker.radius
      ctx.arc marker.x, marker.y, marker.radius, 0, Math.PI * 2, false

    ctx.stroke()
    ctx.closePath()

  # Draw the lookahead region
  drawLookahead: (marker) ->
    ctx = @context
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 1

    ctx.beginPath()

    @graphLine marker.geom[0].m, marker.geom[0].c, marker.corners[0].x
    @graphLine marker.geom[2].m, marker.geom[2].c, marker.corners[2].x
    @graphLine marker.geom[3].m, marker.geom[3].c, marker.corners[3].x

    ctx.stroke()
    ctx.closePath()

  # Draw a straight line of form y = mx + c. The c argument is needed when
  # the gradient, m, is infinite.
  graphLine: (m, c, x) ->
    ctx = @context
    if m is Infinity or m is -Infinity
      ctx.moveTo x, 0
      ctx.lineTo x, @height
    else
      ctx.moveTo 0, c
      ctx.lineTo @width, m * @width + c

  # Draw a line connected an array of points in order.
  trace: (points) ->
    l = points.length
    ctx = @context

    ctx.moveTo points[0].x, points[0].y

    ctx.lineTo points[i % l].x, points[i % l].y for i in [1..l]

  width: 640
  height: 480

# Export an instance of Highlighter, rather than the class itself. This
# isn't particularly good practice, but theres only ever going to be one
# instance of this class.
module.exports = new Highlighter