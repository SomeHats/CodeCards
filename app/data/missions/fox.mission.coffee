module.exports =
  view: 'fullscreen'

  # language: which language definitions are needed for your mission? Give them
  #           in the form name: version
  language: 
    fox: 0

  # initialize: a function to be called when setting up your mission on screen.
  #             The function is passed a single DOM element. Put any HTML inside
  #             this element, but try not to modify the element itself.
  initialize: (el) ->
    _ths = @

    template = require 'data/missions/templates/sample'
    $el = $ el

    $el.addClass 'sample'
    $el.html template()

    ff = $el.find '.ff'
    ff.on 'load', ->
      _ths.reset()
    @sprite.player.image = ff[0]

    cake = $el.find '.cake'
    cake.on 'load', ->
      _ths.reset()
    @sprite.cake.image = cake[0]


    @canvas = $el.find 'canvas'
    @ctx = @canvas[0].getContext '2d'
    @width = 640
    @height = 480
    @size = 32

    @animator.clear = -> _ths.drawScene()
    Util.on 'animationFrame', -> _ths.animator.tick()
    @reset()

  # reset: This function should return the mission to its initial state.
  reset: ->
    @score = 0
    @remaining = 100
    @updateScore()

    @displayMap = Util.clone @map

    @animator.reset()
    @drawPlayer x: 2, y: 2, rot: 1

  # run: This function is called when it is triggered by the remote. It is 
  #      passed a single string, which is made from reading the IDs from the 
  #      user's card and looking them up in the language you specified above.
  run: (str) ->
    @reset()

    _ths = @
    gameMap = Util.clone @map
    displayMap = @displayMap = Util.clone @map

    # Set up the environment for our game.
    empty = 0
    wall = 1
    cake = 2
    forward = 0
    back = 2
    right = 1
    left = 3

    animator = @animator

    fox = player =
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

        change = x: @pos.x, y: @pos.y

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
            animator.animate 'player', 200, change

            if gameMap[change.y][change.x] is cake
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
        animator.animate 'player', 200, rot: direction
        @direction = direction

      direction: 0
      pos:
        x: 2
        y: 2

    animator.register 'player',
      x: player.pos.x
      y: player.pos.y
      rot: 0
      draw: (geom) -> _ths.drawPlayer geom

    # I feel dirty.
    success = yes
    try
      eval "var fn = function () {\n #{str} \n}"
    catch e
      Util.alert 'Error: ' + e.message
      success = no
      
    if success
      for i in [0...@remaining]
        fn()
        animator.callback ->
          _ths.remaining--
          _ths.updateScore()

  # Other functions and objects, used with the three above
  animator: new Animator false

  drawPlayer: (geom) ->
    size = @size
    ctx = @ctx
    sprite = @sprite.player

    x = geom.x
    y = geom.y
    rot = Math.round geom.rot

    sprite.current = ['right', 'down', 'left', 'up'][rot % 4];

    if (sprite.stage += 0.2) >= sprite[sprite.current].length
      sprite.stage = 0

    ctx.drawImage sprite.image,
      Math.floor(sprite.stage) * sprite.tile,
      sprite[sprite.current].row * sprite.tile,
      sprite.tile, sprite.tile,
      x * size, y * size,
      size, size
    

  drawScene: ->
    width = @width
    height = @height
    size = @size
    ctx = @ctx
    m = @displayMap or @map
    cakeSprite = @sprite.cake
    size = @size

    if (cakeSprite.stage += 0.2) >= cakeSprite[cakeSprite.current].length
      cakeSprite.stage = 0

    ctx.fillStyle = 'white'
    ctx.fillRect 0, 0, width, height

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
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
            ctx.fillRect x*size + 1, y * size + 1, size, size
          if m[y][x] is 2
            ctx.drawImage cakeSprite.image,
              Math.floor(cakeSprite.stage) * cakeSprite.tile,
              cakeSprite[cakeSprite.current].row * cakeSprite.tile,
              cakeSprite.tile, cakeSprite.tile,
              x * size, y * size,
              size, size
    null

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

  sprite:
    player:
      right:
        row: 0
        length: 4

      left: 
        row: 1
        length: 4

      up: 
        row: 2
        length: 8

      down: 
        row: 3
        length: 4

      current: 'down'
      stage: 0
      tile: 32

    cake:
      cake:
        row: 0
        length: 3

      current: 'cake'
      stage: 0
      tile: 32