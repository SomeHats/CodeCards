module.exports = 
  name: "fox"
  version: 0
  extends: 
    "friendly.js": 0

  words:
    # Start from 500 to give plenty room to other language files

    # The fox object
    #================

    # The player's fox character. The fox is called Fox. Obviously.
    500:  
      word: "fox"
      img: "http://i.imgur.com/mIkYE.png"
      group: "objects"
    
    # Fox's methods
    #===============

    # Fox can look straight in one direction, and report what
    # he can see. He can't tell how far away it is though.
    501:
      word: ".look"
      print: "look"
      group: "methods"
      follows: 500

    # Fox can reach out in a direction to touch what is in the
    # adjacent tile, and report back what it is.
    504:  
      word: ".touch" 
      print: "touch"
      group: "methods"
      follows: 500

    # Fox can move one step at a time, forwards or backwards
    502:
      word: ".move"
      print: "move"
      group: "methods"
      follows: 500

    # Fox can turn left(-90), right(90), or backwards (180)
    503:
      word: ".turn"
      print: "turn"
      group: "methods"
      follows: 500

    # Directions. Directions are relative to Fox.
    #=============================================
    510:
      word: "forward"
      group: "arguments"
      follows: "methods"
    511:
      word: "back"
      group: "arguments"
      follows: "methods"
    512:
      word: "left"
      group: "arguments"
      follows: "methods"
    513:
      word: "right"
      group: "arguments"
      follows: "methods"

    # Objects in the fox's world
    #============================

    # Empty space
    520:
      word: "empty"
      group: "objects"

    # Walls. Fox can't pass through these.
    521:  
      word: "wall"
      img: "http://i.imgur.com/3nZae.png"
      group: "objects"

    # Fox loves to eat cake. When Fox enters a tile with cake in it, he eats 
    # it and you gain a point. Try to get Fox as much cake as you can.
    522:  
      word: "cake"  
      img: "http://i.imgur.com/uS9s8.png" 
      group: "objects"

    # Goblin. Goblin chases Fox because he's jealous of Fox's glorious 
    # ginger hair. Watch out for him!
    525:
      word:"goblin" 
      img: "http://i.imgur.com/g3Mix.png"
      group: "objects"