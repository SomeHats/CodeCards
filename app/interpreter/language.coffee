module.exports = class Language
  constructor: (lang) ->
    @words = 0:
      word: "\n"
      print: "Start ->"

    for key of lang
      try
        language = require 'data/languages/' + key + '.lang'
      catch e
        console.log 'Language definition ' + key + ' not found :('

      if lang[key] isnt '*' and language.version isnt lang[key]
        console.log 'Wrong language version for ' + key, language.version, lang[key]
      else
        words = language.words

        if language.extends
          language = new Language language.extends

        @merge @words, language.words
        @merge @words, words

  merge: (target, source) ->
    for key of source
      target[key] = source[key]

  build: (source) ->
    out = ""
    words = @words

    for item in source
      word = words[item]
      if typeof word is 'string'
        out += word
      else
        out += word.word

    out