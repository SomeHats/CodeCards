module.exports =

  # language: which language definitions are needed for your mission? Give them
  #           in the form name: version
  language: 
    fox: 0

  # initialize: a function to be called when setting up your mission on screen.
  #             The function is passed a single DOM element. Put any HTML inside
  #             this element, but try not to modify the element itself.
  initialize: (mission) ->
    _ths = @

    template = require 'data/missions/templates/sample'
    $el = $ mission.el

    $el.addClass 'sample'
    $el.html template()

    ###mission.rc.options.add
      with: @
      callback: @toggleGoblin
      label: "Goblin"
      type: 'toggle-button'
      value: @goblin
      true: "Turn off Goblin"
      false: "Turn on Goblin"###

    mission.rc.options.add
      with: @
      callback: @toggleMap
      label: "Map"
      type: 'toggle-button'
      value: @isMaze
      true: "Cakes"
      false: "Maze"

    getSprite = (name) ->
      el = $el.find ".#{name}"
      el.on 'load', ->
        _ths.reset()
      _ths.sprite[name].image = el[0]

    getSprite name for name in ['player', 'cake', 'wall', 'bg', 'goblin']

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

    @displayMap = Util.clone if @isMaze then @maze else @map

    @animator.reset()
    if @isMaze
      @drawSprite {x: 1, y: 1, rot: 1}, 'player'
    else
      @drawSprite {x: 2, y: 2, rot: 1}, 'player'

    if @goblin then @drawSprite {x: 17, y: 12, rot: 1}, 'goblin'

  # run: This function is called when it is triggered by the remote. It is 
  #      passed a single string, which is made from reading the IDs from the 
  #      user's card and looking them up in the language you specified above.
  run: (str) ->
    @reset()

    _ths = @
    gameMap = Util.clone if @isMaze then @maze else @map
    displayMap = @displayMap = Util.clone if @isMaze then @maze else @map

    animator = @animator

    # Set up the environment for our game.
    empty = 0
    wall = 1
    cake = 2
    forward = 0
    back = 2
    right = 1
    left = 3

    characters = []

    class Character
      constructor: (@name, @pos, @direction = 0, @player = no) ->
        characters.push @
        @

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

          for char in characters
            if change.x is char.pos.x and change.y is char.pos.y
              tile = char.name

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
            animator.animate @name, 200, change

            if @player and gameMap[change.y][change.x] is cake
              gameMap[change.y][change.x] = empty
              animator.callback @name, ->
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
        animator.animate @name, 1, rot: direction
        @direction = direction

    ps = if @isMaze then 1 else 2
    fox = player = new Character 'player', {x: ps, y: ps}, 0, yes
    goblin = new Character 'goblin', {x: 17, y: 2}, 2

    animator.register 'player',
      x: player.pos.x
      y: player.pos.y
      rot: 0
      draw: (geom) -> _ths.drawSprite geom, 'player'


    if @goblin then animator.register 'goblin',
      x: 17
      y: 2
      rot: 0
      draw: (geom) -> _ths.drawSprite geom, 'goblin'

    moveGoblin = ->
      lookGoblin()
      goblin.move()
      lookGoblin()

    lookGoblin = ->
      if goblin.look(left) is 'player'
        goblin.turn left
      if goblin.look(right) is 'player'
        goblin.turn right
      if goblin.touch() is wall
        str = "#{goblin.direction} #{goblin.pos.x < player.pos.x} #{goblin.pos.y < player.pos.y}"
        switch str
          when "0 true false", "0 false false", "1 true true", "1 true false", "2 true true", "2 false true", "3 false true", "3 false false"
            goblin.turn left
          else
            goblin.turn right


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
        if @goblin then moveGoblin()

        animator.callback 'player', ->
          _ths.remaining--
          _ths.updateScore()

  # Other functions and objects, used with the three above
  animator: new Animator false

  drawSprite: (geom, name) ->
    size = @size
    ctx = @ctx
    sprite = @sprite[name]

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
    wallSprite = @sprite.wall
    bgSprite = @sprite.bg
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
        ctx.drawImage bgSprite.image, x * size, y * size
        if m[y][x]
          if m[y][x] is 1
            ctx.drawImage wallSprite.image, x * size, y * size
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

  toggleGoblin: (val) ->
    @goblin = val
    @reset()

  toggleMap: (val) ->
    @isMaze = val
    @reset()

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

  maze:[
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,0,1,0,1,1,0,1,0,1,1,1,1,1],
    [1,0,0,2,1,0,0,0,1,2,2,1,0,0,0,1,2,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1],
    [1,0,2,1,2,0,1,0,0,0,0,0,0,1,0,2,1,2,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,2,1,0,1,0,1,2,2,1,0,1,0,1,2,1,0,1],
    [1,0,1,0,1,0,1,0,1,1,1,1,0,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,0,1],
    [1,1,0,1,1,1,1,0,1,1,0,1,0,1,1,1,1,0,1,1],
    [1,2,0,2,1,2,0,0,2,1,0,0,0,0,2,1,2,0,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]

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

    goblin:
      right:
        row: 0
        length: 3

      left: 
        row: 1
        length: 3

      up: 
        row: 2
        length: 4

      down: 
        row: 3
        length: 4

      current: 'left'
      stage: 0
      tile: 32

    cake:
      cake:
        row: 0
        length: 3

      current: 'cake'
      stage: 0
      tile: 32

    wall:
      tile: 32

    bg:
      tile: 32

  goblin: no
  isMaze: yes