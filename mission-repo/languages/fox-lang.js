define.language({
  name: "fox",
  version: 0,
  "extends": {
    "friendly.js": 0
  },
  words: {
    500: {
      word: "fox",
      img: "http://i.imgur.com/mIkYE.png",
      group: "objects"
    },
    501: {
      word: ".look",
      print: "look",
      group: "methods",
      follows: 500
    },
    504: {
      word: ".touch",
      print: "touch",
      group: "methods",
      follows: 500
    },
    502: {
      word: ".move",
      print: "move",
      group: "methods",
      follows: 500
    },
    503: {
      word: ".turn",
      print: "turn",
      group: "methods",
      follows: 500
    },
    510: {
      word: "forward",
      group: "arguments",
      follows: "methods"
    },
    511: {
      word: "back",
      group: "arguments",
      follows: "methods"
    },
    512: {
      word: "left",
      group: "arguments",
      follows: "methods"
    },
    513: {
      word: "right",
      group: "arguments",
      follows: "methods"
    },
    520: {
      word: "empty",
      group: "objects"
    },
    521: {
      word: "wall",
      img: "http://i.imgur.com/3nZae.png",
      group: "objects"
    },
    522: {
      word: "cake",
      img: "http://i.imgur.com/uS9s8.png",
      group: "objects"
    },
    525: {
      word: "goblin",
      img: "http://i.imgur.com/g3Mix.png",
      group: "objects"
    }
  }
});