# Javascript with some of the syntax replaced.

# Friendly.js lets javascript be used with a much more natural looking syntax.
# Friendly.js only allows functions with 1 or 0 arguments. To use friendly.js in
# your mission, add it in your extends and give all functions group "methods" and
# all arguments group "arguments".

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