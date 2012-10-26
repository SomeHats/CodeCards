module.exports = 
  name: "fox"
  version: 0
  extends: 
    "js.math": 0

  words:
    # Start from 500 to give plenty room to other language files

    # The fox object
    500:  "fox" # The players fox character. The fox is called Fox. Obviously.
    
    # fox methods
    501:  ".look("  # Fox can look straight in one direction, and report what
                    # he can see. He can't tell how far away it is though.

    504:  ".touch(" # Fox can reach out in a direction to touch what is in the
                    # adjacent tile, and report back what it is.

    502:  ".move("  # Fox can move one step at a time, forwards or backwards
    503:  ".turn("  # Fox can turn left(-90), right(90), or backwards (180)

    # Directions
    510:  "forward"
    511:  "back"
    512:  "left"
    513:  "right"

    # Objects in the fox's world
    520:  "empty"   # Empty space
    521:  "wall"    # Fox can't pass through these.
    522:  "cake"    # Fox loves to eat cake. When Fox enters a tile with cake
                    # in it, he eats it and you gain a point. Try to get Fox
                    # as much cake as you can.