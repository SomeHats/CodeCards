# Javascript with some of the syntax replaced.

module.exports =
  name: 'friendly.js'
  version: 0
  extends:
    'js': 0
  words:
    38:
      word: ' === '
      print: 'is'
    39:
      word: ' !== '
      print: "isn't"

    44:
      word: ' && '
      print: 'and'
    45:
      word: ' || '
      print: 'or'
    46:
      word: ' ! '
      print: 'not'

  replace: [
    replace: "{{methods}} *?{{not arguments}}"
    with: "$1()"
  ,
    replace: "{{methods}} *?{{arguments}}"
    with: "$1($2)"
  ]