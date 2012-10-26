module.exports = 
  name: "fox"
  version: 0
  extends: 
    "friendly.js": 0

  words:
    # Start from 500 to give plenty room to other language files

    # The fox object
    #================
    500:  
      word: "fox" # The players fox character. The fox is called Fox. Obviously.
      img: "http://i.imgur.com/yQTeT.png"
    
    # Fox's methods
    #===============

    # Fox can look straight in one direction, and report what
    # he can see. He can't tell how far away it is though.
    501:
      word: ".look("
      print: "look" 

    # Fox can reach out in a direction to touch what is in the
    # adjacent tile, and report back what it is.
    504:  
      word: ".touch(" 
      print: "touch"

    # Fox can move one step at a time, forwards or backwards
    502:
      word: ".move("
      print: "move"

    # Fox can turn left(-90), right(90), or backwards (180)
    503:
      word: ".turn("
      print: "turn" 

    # Directions. Directions are relative to Fox.
    #=============================================
    510:  "forward"
    511:  "back"
    512:  "left"
    513:  "right"

    # Objects in the fox's world
    #============================
    520:  "empty"   # Empty space
    521:  
      word: "wall"  # Fox can't pass through these.
      img: "http://i.imgur.com/CtDV3.png"
    522:  
      word: "cake"  # Fox loves to eat cake. When Fox enters a tile with cake
      img: "http://i.imgur.com/oUI2s.png" # in it, he eats it and you gain a
                    # point. Try to get Fox as much cake as you can.

    # Goblin
    525:            # Goblin chases Fox because he's jealous of Fox's glorious 
      word:"goblin" # ginger hair. Watch out for him!
      img: "http://i.imgur.com/Tv4Kg.png"