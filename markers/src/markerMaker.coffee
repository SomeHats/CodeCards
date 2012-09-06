init = ->
	id = new Slider 'id'
	size = new Slider 'size'

	canvas = document.querySelector 'canvas'
	ctx = canvas.getContext '2d'

	redraw = ->
		canvas.setAttribute 'width', size.value
		canvas.setAttribute 'height', size.value

		marker = getMarker id.value

		ctx.fillStyle = 'black'
		ctx.fillRect 0, 0, size.value, size.value

		ctx.fillStyle = 'white'

		unit = size.value / 7

		for y in [0..4]
			for x in [0..4]
				if marker[y][x]
					ctx.fillRect unit + unit * x, unit + unit * y, unit, unit

	id.onUpdate = redraw
	size.onUpdate = redraw

	redraw()

getMarker = (id) ->
	id = parseInt id
	id = ('0000000000' + id.toString 2).slice -10

	out = []

	for i in [0..4]
		slice = id.slice i * 2, (i+1) * 2
		console.log slice
		switch slice
			when '00'
				out.push [1, 0, 0, 0, 0]
			when '01'
				out.push [1, 0, 1, 1, 1]
			when '10'
				out.push [0, 1, 0, 0, 1]
			when '11'
				out.push [0, 1, 1, 1, 0]

	out

class Slider
	constructor: (@id) ->
		@rangeEl = document.getElementById @id
		@numEl = document.getElementById @id + '-txt'

		@copyAttr 'min'
		@copyAttr 'max'
		@copyAttr 'value'
		@copyAttr 'step'

		@rangeEl.addEventListener 'change', withContext(@changeFromRange, @), false
		@numEl.addEventListener 'change', withContext(@changeFromNum, @), false
		@numEl.addEventListener 'click', withContext(@changeFromNum, @), false

		@update()

	update: ->
		@value = @rangeEl.value
		@onUpdate()

	onUpdate: ->
		null

	changeFromRange: (e, context)->
		context.numEl.value = context.rangeEl.value
		context.update()

	changeFromNum: (e, context) ->
		context.rangeEl.value = context.numEl.value
		context.update()


	copyAttr: (attr) ->
		@numEl.setAttribute attr, @rangeEl.getAttribute attr

withContext = (handler, context) ->
	(e) ->
		handler e, context

document.addEventListener 'DOMContentLoaded', init, false