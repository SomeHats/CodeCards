class Highlighter
  drawCorners: (markers) ->
    ctx = @context

    ctx.lineWidth = 3

    for marker in markers
      corners = marker.corners

      ctx.strokeStyle = 'red'
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

  trace: (points) ->
    l = points.length
    ctx = @context

    ctx.moveTo points[0].x, points[0].y

    ctx.lineTo points[i % l].x, points[i % l].y for i in [1..l]

module.exports = new Highlighter