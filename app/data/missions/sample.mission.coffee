module.exports =

  # language: which language definitions are needed for your mission? Give them
  #           in the form name: version
  language:
    robot: 0

  # initialize: a function to be called when setting up your mission on screen.
  #             The function is passed a single DOM element. Put any HTML inside
  #             this element, but try not to modify the element itself.
  initialize: (el) ->
    _ths = @

    template = require 'data/missions/templates/sample'
    $el = $ el

    $el.addClass 'sample'
    $el.html template()

    @canvas = $el.find 'canvas'
    @ctx = @canvas[0].getContext '2d'
    @width = 640
    @height = 480
    @size = 32

    @animator.clear = -> _ths.drawScene()
    @reset()

    @animator.start()

  # reset: This function should return the mission to its initial state.
  reset: ->
    @score = 0
    @remaining = 100
    @updateScore()

    @displayMap = Util.clone @map

    @animator.reset()
    @drawRobot x: 2, y: 2, rot: 0

  # run: This function is called when it is triggered by the remote. It is 
  #      passed a single string, which is made from reading the IDs from the 
  #      user's card and looking them up in the language you specified above.
  run: (str) ->
    @reset()

    _ths = @
    gameMap = Util.clone @map
    displayMap = @displayMap = Util.clone @map

    str = """
      if (robot.touch() !== tea) {
        if (robot.touch(left) === tea) {
          robot.turn(left)
        } else if (robot.touch(right) === tea) {
          robot.turn(right)
        }
      }
      if (robot.look() === wall) {
        if (robot.look(left) === tea) {
          robot.turn(left)
        } else if (robot.look(right) === tea) {
          robot.turn(right)
        }
      }
      if (robot.touch() === wall) {
        robot.turn(back)
      }
      robot.move(forward)
    """
    # Set up the environment for our game.
    empty = 0
    wall = 1
    tea = 2
    forward = 0
    back = 2
    right = 1
    left = 3

    animator = @animator

    robot =
      look: (direction = forward) ->
        tile = empty
        direction = (@direction + direction) % 4
        change = x: @pos.x, y: @pos.y
        while tile is empty
          switch direction
            when 0 then change = x: change.x + 1, y: change.y
            when 1 then change = x: change.x,     y: change.y + 1
            when 2 then change = x: change.x - 1, y: change.y
            when 3 then change = x: change.x,     y: change.y - 1

          tile = if gameMap[change.y] is undefined or gameMap[change.y][change.x] is undefined
            wall
          else
            gameMap[change.y][change.x]

        tile

      move: (direction = forward) ->
        direction = (@direction + direction) % 4

        switch direction
          when 0 then change = x: @pos.x + 1, y: @pos.y
          when 1 then change = x: @pos.x,     y: @pos.y + 1
          when 2 then change = x: @pos.x - 1, y: @pos.y
          when 3 then change = x: @pos.x,     y: @pos.y - 1

        if gameMap[change.y] isnt undefined and 
          gameMap[change.y][change.x] isnt undefined and
          gameMap[change.y][change.x] isnt 1
            @pos.x = change.x
            @pos.y = change.y
            animator.animate
              robot: change

            if gameMap[change.y][change.x] is tea
              gameMap[change.y][change.x] = empty
              animator.callback ->
                displayMap[change.y][change.x] = empty
                _ths.score++
                _ths.updateScore()


      touch: (direction = forward) ->
        direction = (@direction + direction) % 4
        switch direction
          when 0 then change = x: @pos.x + 1, y: @pos.y
          when 1 then change = x: @pos.x,     y: @pos.y + 1
          when 2 then change = x: @pos.x - 1, y: @pos.y
          when 3 then change = x: @pos.x,     y: @pos.y - 1

        return if gameMap[change.y] is undefined or gameMap[change.y][change.x] is undefined
          wall
        else
          gameMap[change.y][change.x]

      turn: (direction) ->
        direction = (@direction + direction) % 4
        animator.animate
          robot: rot: direction
        , 10
        @direction = direction

      direction: 0
      pos:
        x: 2
        y: 2

    animator.register 'robot',
      x: robot.pos.x
      y: robot.pos.y
      rot: 0
      draw: (geom) -> _ths.drawRobot geom

    # I feel dirty.
    eval "var fn = function () {\n #{str} \n}"

    for i in [0...@remaining]
      fn()
      animator.callback ->
        _ths.remaining--
        _ths.updateScore()

  # Other functions and objects, used with the three above
  animator:
    queue: []
    actors: {}
    running: no
    animate: (change, duration = 5) ->
      item = {}
      item.progress = 0
      item.type = 'animate'
      item.duration = duration
      item.change = change
      @queue.push item
      if (!@running)
        @startQueue()

    callback: (fn, ctx = @) ->
      item = type: 'callback', callback: fn, context: ctx
      @queue.push item
      if (!@running)
        @startQueue()

    register: (name, properties) ->
      @actors[name] = properties

    startQueue: ->
      if !@running and @queue.length isnt 0
        @running = yes
    
    start: ->
      queue = @queue
      Util.on 'animationFrame', ->
        if @running and queue.length isnt 0
          @clear()
          current = queue[0]

          if current.type is 'animate'
            for name of current.change
              actor = @actors[name]

              for property of current.change[name]
                remain = current.change[name][property] - actor[property]
                step = remain / current.duration
                actor[property] += step
              
            current.duration -= 1
            if current.duration is 0
              queue.shift()

          if current.type is 'callback'
            current.callback()
            queue.shift()

          @drawActors()
      , @

    drawActors: ->
      actors = @actors
      for name of actors
        actors[name].draw actors[name]

    reset: ->
      while @queue.length
        @queue.shift()
      @actors = {}
      @clear()
      @drawActors()

  drawRobot: (geom) ->
    size = @size
    ctx = @ctx

    x = geom.x
    y = geom.y
    rot = geom.rot

    ctx.fillStyle = 'blue'
    ctx.fillRect x * size + 1, y * size + 1, size - 1, size - 1

    ctx.strokeStyle = 'lime'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo (x + 0.5) * size, (y + 0.5) * size

    switch rot
      when 0 then ctx.lineTo (x + 1) * size, (y + 0.5) * size
      when 1 then ctx.lineTo (x + 0.5) * size, (y + 1) * size
      when 2 then ctx.lineTo x * size, (y + 0.5) * size
      when 3 then ctx.lineTo (x + 0.5) * size, y * size

    ctx.stroke()
    ctx.lineWidth = 1

  drawScene: ->
    width = @width
    height = @height
    size = @size
    ctx = @ctx
    m = @displayMap or @map


    ctx.fillStyle = 'white'
    ctx.fillRect 0, 0, width, height

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    x = y = 0
    for x in [0..width/size]
      ctx.moveTo x * size + 0.5, 0
      ctx.lineTo x * size + 0.5, height

    for y in [0..height/size]
      ctx.moveTo 0, y * size + 0.5
      ctx.lineTo width, y * size + 0.5

    ctx.stroke()

    for y in [0...m.length]
      for x in [0...m[y].length]
        if m[y][x]
          if m[y][x] is 1
            ctx.fillStyle = 'orange'
          if m[y][x] is 2
            ctx.fillStyle = 'lime'
          if m[y][x] isnt 3
            ctx.fillRect x*size + 1, y * size + 1, size-1, size-1

  updateScore: ->
    $('#score').text "Score: #{@score}"
    $('#remain').text "Remaining: #{@remaining}"

  map:[
    [2,2,2,0,0,0,0,1,2,2,2,2,1,0,0,0,0,2,2,2],
    [2,2,0,0,0,0,0,1,0,2,2,0,1,0,0,0,0,0,2,2],
    [2,0,0,0,2,0,0,1,0,2,2,0,1,0,0,2,0,0,0,2],
    [0,0,0,0,2,2,0,0,0,0,0,0,0,0,2,2,0,0,0,0],
    [0,0,0,0,2,2,2,0,0,0,0,0,0,2,2,2,0,0,0,0],
    [0,0,0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0,0,0],
    [2,2,2,0,0,0,0,0,0,2,2,0,0,0,0,0,0,2,2,2],
    [2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2],
    [2,0,0,0,0,2,2,0,0,2,2,0,0,2,2,0,0,0,0,2],
    [0,0,0,0,0,1,0,2,2,0,0,2,2,0,1,0,0,0,0,0],
    [0,2,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,2,0],
    [0,2,0,2,0,1,0,0,1,1,1,1,0,0,1,0,2,0,2,0],
    [0,2,0,2,0,1,2,0,0,0,0,0,0,2,1,0,2,0,2,0],
    [0,0,0,2,0,1,2,2,0,0,0,0,2,2,1,0,2,0,0,0],
    [0,0,0,0,0,1,2,2,2,0,0,2,2,2,1,0,0,0,0,0]]