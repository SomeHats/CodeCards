define.resources({
	root: "http://localhost:3000",
	missions: {
		"sample": {
			name: "Sample",
			description: "A sample CodeCards mission. Learn to spell the word 'cat'.",
			source: "/sample/sample.mission.js"
		},

		"fox": {
			name: "Fox",
			description: "Help Fox get as much cake as possible with your awesome programming skills!",
			source: "/fox/fox.mission.js",
			style: "/fox/fox.css",
			template: "/fox/fox.hbs"
		}
	},
	languages: ["/languages/alphabet.js"]
});