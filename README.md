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

Writing 'missions' for CodeCards
--------------------------------

## You will need:

* Node.JS
* Serve
* Some physical objects to track (try visiting http://somehats.github.com/CodeCards/markers/ on your phone to download and print markers)

## A bit of background:

CodeCards missions are any type of game or activity that use data from the CodeCards interpreter as an input. 

When CodeCards loads it looks in the /mission-repo/ for missions. Missions are defined in CodeCards-data.js, with the files for each mission in a subdirectoy. But CodeCards also looks for missions at http://localhost:3000. So you can develop missions locally, and run them from the working version of CodeCards at http://codecards.decoded.co. Neat right?

So let's get set up:

`git clone https://github.com/SomeHats/CodeCards.git`

We recommend installing serve to get a quick server up and running

`npm install -g serve`

Navigate to mission-repo directory and run:

`serve`

You should now have a server running on port 3000. CodeCards will look for missions at this URL on init. You are now ready to create your mission!

## Three steps

There are three steps to defining a CodeCards mission:

* Add your mission to CodeCards-data.js
* Create the language; choose what strings or symbols relate to each card
* Create your mission directory 

Within your main mission file in your mission directory, you need to make sure you cover the following: 

```javascript
// Tell CodeCards about your mission and give it a name
define.mission("sample", {

	// We want the cards to be interpretted as text.
	interpreter: "text",

	// The language tells CodeCards which word (or letter, in this case) each
	// card corresponds to. Use a built in one, or make your own.
	language: "alphabet",

	// We want to run our mission every time new data from the camera is ready,
	// rather than only when the user presses play.
	continuous: true,

	// A CodeCards mission needs 3 functions - initialize, reset and run - they 
	// are called in that order.

	// Initialize sets up everything we'll need later in our mission. Here, we 
	// just save the element in the DOM we're given.
	initialize: function(mission) {
		this.el = mission.el;
	},

	// Reset is called whenever the mission needs to be ready to do something
	// new, like immediatly after initialize.
	reset: function() {
		this.el.innerHTML = "<h1>Spell &quot;cat&quot;<h1>";
	},

	// Run takes one argument - the data from CodeCards in the format requested.
	// From here, you can do whatever you want with it.
	run: function(spelling) {
		// Sometimes it's useful to reset the mission every time you run it.
		this.reset();

		// As you can see, this mission does very little of interest.
		if (spelling.trim() === 'cat') {
			this.el.innerHTML += "<h2>Correct!</h2>"
		} else {
			this.el.innerHTML += "<h2>No, not " + spelling + "!</h2>"
		}
	}
});
```

That's it! Happy coding :)


Hacking CodeCards core:
-----------------------
Documentation coming soon.