Mission = require 'CodeCards/mission'

module.exports = class MissionControl extends Backbone.Model
	initialize: ->
		_ths = @

		@resources =
			missions: {}
			languages: []

		@selector = new Mission 'selector'

		@on 'new-resources', (data) ->
			for name of data.missions
				Util.loadJS data.missions[name].root + data.missions[name].source

			for lang in data.languages
				Util.loadJS lang

			@selector.run data.missions
		, @

		@on 'select-mission', (name) ->
			@mission = new Mission name
		, @

		window.define = 
			mission: (name, data) ->
				def = {}
				def["data/missions/#{name}.mission"] = (exports, require, module) ->
					module.exports = data

				window.require.define def

			language: (data) ->
				def = {}
				def["data/languages/#{data.name}.lang"] = (exports, require, module) ->
					module.exports = data

				window.require.define def

			resources: (data) ->
				for name of data.missions
					if _ths.resources.missions[name]
						delete data.missions[name]
					else
					  data.missions[name].root = data.root

				data.languages = data.languages.map (name) ->
					return data.root + name

				if data.missions
					_.extend _ths.resources.missions, data.missions

				if data.languages
					_ths.resources.languages.concat data.languages

				_ths.trigger 'new-resources', data

		@loadResources()

	loadResources: ->
		for host in @hosts
			Util.loadJS host + 'CodeCards-data.js'

	hosts: ["http://localhost:3000/", "http://codecards.decoded.co/mission-repo/"]