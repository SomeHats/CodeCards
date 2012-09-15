class Highlighter
  drawCorners: (markers) ->
    ctx = @context

    for marker in markers
      corners = marker.corners

      if marker.highlightExtra
        @drawLookahead marker
        @drawRadius marker

      ctx.strokeStyle = marker.colour

      ctx.lineWidth = 3

      ctx.beginPath()

      @trace corners

      ctx.stroke()
      ctx.closePath()

      ctx.strokeStyle = 'cyan'
      ctx.strokeRect corners[0].x - 2, corners[0].y - 2, 4, 4

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

  drawRadius: (marker) ->
    ctx = @context
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 1

    ctx.beginPath()

    if marker.radius
      ctx.arc marker.x, marker.y, marker.radius, 0, Math.PI * 2, false

    ctx.stroke()
    ctx.closePath()

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

  graphLine: (m, c, x) ->
    ctx = @context
    if m is Infinity or m is -Infinity
      ctx.moveTo x, 0
      ctx.lineTo x, @height
    else
      ctx.moveTo 0, c
      ctx.lineTo @width, m * @width + c

  trace: (points) ->
    l = points.length
    ctx = @context

    ctx.moveTo points[0].x, points[0].y

    ctx.lineTo points[i % l].x, points[i % l].y for i in [1..l]

  width: 640
  height: 480

module.exports = new Highlighter