module.exports = class Marker extends AR.Marker
  constructor: (@id, @corners, @index=1024) ->

    @geom = []

    for i in [0..3]
      @x += @corners[i].x
      @y += @corners[i].y

      @geom[i] = {}
      @geom[i].m = (@corners[i].y - @corners[(i+1) % 4].y) / (@corners[i].x - @corners[(i+1) % 4].x)
      @geom[i].c = @corners[i].y - @geom[i].m * @corners[i].x

    @x /= 4
    @y /= 4

    @size = Math.sqrt Math.pow(@corners[0].x - @corners[2].x, 2) + Math.pow(@corners[0].y - @corners[2].y, 2)
    @size+= Math.sqrt Math.pow(@corners[1].x - @corners[3].x, 2) + Math.pow(@corners[1].y - @corners[3].y, 2)
    @size /= 2

    @colour = 'red'
    @available = yes

  distanceFrom: (x, y) ->
    Math.sqrt Math.pow(x - @x, 2) + Math.pow(y - @y, 2)

  contains: (x, y) ->
    @pointInPolygon @corners, x, y

  lookAhead: (x, y) ->
    if ! @lookAheadPoints
      p = Util.clone @corners
      g = @geom

      if g[0].m is Infinity or g[0].m is -Infinity
        p[1] = if p[0].y < p[1].y then 480 else 0
      else if p[0].x < p[1].x
        p[1].x = 640
        p[1].y = g[0].m * 640 + g[0].c
      else
        p[1].x = 0
        p[1].y = g[0].c

      if g[2].m is Infinity or g[2].m is -Infinity
        p[2] = if p[3].y < p[2].y then 480 else 0
      else if p[3].x < p[2].x
        p[2].x = 640
        p[2].y = g[2].m * 640 + g[2].c
      else
        p[2].x = 0
        p[2].y = g[2].c

      @lookAheadPoints = p

    @pointInPolygon @lookAheadPoints, x, y

  isAbove: (x, y) ->
    if ! @isAbovePoints
      p = Util.clone @corners
      g = @geom

      if g[0].m is Infinity or g[0].m is -Infinity
        if p[0].y < p[1].y
          p[0].y = p[3].y = 0
          p[1].y = p[2].y = 480
          p[2].x = p[3].x = 640
        else
          p[0].y = p[3].y = 480
          p[1].y = p[2].y = p[2].x = p[3].x = 0

      else if p[0].x < p[1].x
        p[0].x = p[3].x = p[3].y = p[2].y = 0
        p[0].y = g[0].c
        p[1].x = p[2].x = 640
        p[1].y = g[0].m * 640 + g[0].c
      else
        p[0].x = p[3].x = 640
        p[0].y = g[0].m * 640 + g[0].c
        p[3].y = 480
        p[1].x = p[2].x = 0
        p[1].y = g[0].c
        p[2].y = 480

      @isAbovePoints = p

    @pointInPolygon @isAbovePoints, x, y

  pointInPolygon: (p, x, y) ->
    # Point in polygon by ray-casting.
    # See http://en.wikipedia.org/wiki/Point_in_polygon
    c = no
    for i in [(p.length-1)..0]
      j = (i+1) % p.length

      if ((((p[i].y <= y) and (y < p[j].y)) or
          ((p[j].y <= y) and (y < p[i].y))) and
          (x < (p[j].x - p[i].x) * (y - p[i].y) / (p[j].y - p[i].y) + p[i].x))

        c = !c

    c

  x: 0
  y: 0