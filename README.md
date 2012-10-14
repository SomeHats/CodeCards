CodeCards
=========

I need to rewrite this readme
-----------------------------
CodeCards interprets the placement of physical objects to create (java|coffee)script programs.

## Requires:
* Node.JS
* Brunch.io
* A browser that supports getUserMedia
* A web-cam
* Some physical objects to track (try visiting https://somehats.github.com/CodeCards/markers/ on your phone)

## To run:
* `brunch watch --server`
* Visit http://localhost:3333/

Writing 'missions' for CodeCards
--------------------------------
CodeCards missions are activities that can be run using data from the CodeCards interpreter as an input. CodeCards missions can be defined through files in the /app/data/missions/ directory, and should be named `name.mission.coffee`. A really basic CodeCards mission might look like this:

```coffeescript
# app/data/missions/mymission.mission.coffee

module.exports =
  # List the languages needed for your mission and their versions.
  language:
    javascript: '*'

  initialize: (el) ->
    # Set up your mission

  reset: ->
    # Reset your mission

  run: (data) ->
    # Do something cool with whatever you get from the CodeCards interpreter
```