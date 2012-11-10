CodeCards
=========

CodeCards is a visual programming tool that makes learning to code physical, collaborative, and fun. You play the game on a glass-topped table, and watch the result of your code onscreen. You get feedback on your code in real time, as the table teaches you core programming concepts. In a nutshell, CodeCards interprets the placement of physical objects to create (Java|Coffee)script programs.

Current Status
--------------
CodeCards is currently in development, but we are looking forward to getting them into classrooms soon. 

Open Source
-----------
We are inviting the wider community to work with us on CodeCards, designing games and hacking on the platform...

This is the platform that’s actually a platform :) 

## Requires:
* Node.JS
* Brunch.io
* A browser that supports getUserMedia
* A web-cam
* Some physical objects to track (try visiting http://somehats.github.com/CodeCards/markers/ on your phone)

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