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

	// Initialize sets up everything we'll need later in out mission. Here, we 
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