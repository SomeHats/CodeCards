module.exports = class Language
  constructor: (lang, process = yes) ->
    @words = 0:
      word: "\n"
      print: "Start ->"

    @replace = []

    for key of lang
      # Do we have the correct language file?
      try
        language = require 'data/languages/' + key + '.lang'
      catch e
        console.log 'Language definition ' + key + ' not found :('

      if lang[key] isnt '*' and language.version isnt lang[key]
        console.log 'Wrong language version for ' + key, language.version, lang[key]
      else
        # Success. We've found the correct language file

        words = language.words
        if language.replace
          @replace = @replace.concat(language.replace or [])

        if language.extends
          language = new Language language.extends, no
          @replace = @replace.concat(language.replace or [])

        @merge @words, language.words
        @merge @words, words

    if process
      @buildGroups()
      @buildReplacers()

  merge: (target, source) ->
    for key of source
      target[key] = source[key]

  build: (source) ->
    out = ""
    words = @words

    for item in source
      out += @getWord item

    @process out

  process: (str) ->
    for replace in @replace
      str = str.replace replace.replace, replace.with
    str

  getWord: (key) ->
    word = @words[key]

    if typeof word is 'string' then return word

    if typeof word is 'object'
      out = word.word or word.display or word.print or false
      if out is false
        throw new ReferenceError "Can't find a suitable property to return on word #{key}"
      out

  buildGroups: ->
    groups = {}
    words = @words

    for key of words
      # Does the word have a group?
      if words[key].group
        if typeof words[key].group isnt 'string'
          throw new TypeError "Group name must be string, not #{typeof words[key].group} in #{key}."
        else
          # Multiple groups are aloud
          for group in words[key].group.split ' '
            if !groups[group]
              # Create the group
              groups[group] = []

            groups[group].push key

    @groups = groups

  buildReplacers: ->
    @setupHandlebars()
    
    groups = @groups
    data = {}

    # Get all the groups together
    for name of groups
      group = []
      for key in groups[name]
        group.push @regexEscape @getWord key

      data[name] = "(#{group.join '|'})"

    for replace in @replace
      if typeof replace isnt 'object'
        throw new TypeError "Replace should be object, not #{typeof replace}."
      else
        template = Handlebars.compile replace.replace
        replace.replace = new RegExp template(data), "g"

    console.log @replace


  setupHandlebars: ->
    Handlebars.registerHelper 'not', (str) ->
      "(?!#{str})"

  regexEscape: (str) ->
    str = str.replace '\\', '\\\\'
    str = str.replace '.', '\\.'
    str = str.replace '+', '\\+'
    str = str.replace '*', '\\*'
    str = str.replace '?', '\\?'
    str = str.replace '^', '\\^'
    str = str.replace '$', '\\$'
    str = str.replace '[', '\\['
    str = str.replace ']', '\\]'
    str = str.replace '(', '\\('
    str = str.replace ')', '\\)'
    str = str.replace '|', '\\|'
    str = str.replace '{', '\\}'
    str = str.replace '}', '\\}'
    str = str.replace '/', '\\/'
    str = str.replace '\'', '\\\''
    str = str.replace '#', '\\#'