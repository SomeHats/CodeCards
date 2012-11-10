module.exports = 
	view: 'fullscreen'
	interpreter: 'none'

	initialize: (mission) ->
		el = @el = $ mission.el
		@rc = mission.rc
		@data = {}

	reset: ->
		# Hacky. In a rush. To Do: make less hacky.
		@el.html """
<span style="font-size: 4.5em;" class="logo" href="#">
  <h3 class="decoded">Decoded</h3>
  <h1><span>{</span>code<span>}</span>cards</h1>
</span>
		"""

		window.App.codeCards.trigger 'toggle-camera', false
		@rc.showGroup 'Missions'

	run: (missions) ->
		for name of missions
			mission = missions[name]
			@rc.options.add
				with: window.App.codeCards.mission
				event: 'select-mission'
				label: mission.name
				description: mission.description
				text: "Load #{mission.name}"
				type: "button"
				value: name
				group: 'Missions'

		window.App.codeCards.trigger 'toggle-camera', false
		@rc.showGroup 'Missions'