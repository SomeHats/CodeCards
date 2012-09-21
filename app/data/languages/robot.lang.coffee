module.exports = 
  name: "robot"
  version: 0
  extends: 
    "js.math": 0

  words:
    # Start from 500 to give plenty room to other language files

    # The robot object
    500:  "robot" # This is our robot. He's called Alan. Obviously.
    
    # robot methods
    501:  ".look("  # Alan can look straight in one direction, and report what
                    # he can see. He can't tell how far away it is though.

    504:  ".touch(" # Alan can reach out in a direction to touch what is in the
                    # adjacent tile, and report back what it is.

    502:  ".move("  # Alan can move one step at a time, forwards or backwards
    503:  ".turn("  # Alan can turn left(-90), right(90), or backwards (180)

    # Directions
    510:  "forward"
    511:  "back"
    512:  "left"
    513:  "right"

    # Objects in the robot's world
    520:  "empty"   # Empty space
    521:  "wall"    # Alan can't pass through these.
    522:  "cake"    # Alan loves to eat cake. When Alan enters a tile with cake
                    # in it, he eats it and you gain a point. Try to get Alan
                    # as much cake as you can.