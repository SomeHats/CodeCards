module.exports = class Language
  constructor: (lang, process = yes) ->
    @words = 0:
      word: "\n"
      print: "Start ->"

    @replace = []
    @format = []

    if typeof lang is 'string'
      l = lang
      lang = {}
      lang[l] = "*"

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

        # Get local replaces
        if language.replace
          @replace = @replace.concat(language.replace or [])

        # Get local formatting
        if language.format
          if typeof language.format is 'string'
            @format.push language.format
          else if typeof language.format is 'object'
            @format = @format.concat language.format
          else
            throw new TypeError "format can only be string or array, not #{typeof language.format}"

        # Extend language
        if language.extends
          language = new Language language.extends, no

          # Extended replaces
          @replace = @replace.concat language.replace or []

          # Extended formatting
          @format = @format.concat language.format

        @merge @words, language.words
        @merge @words, words

    if process
      @buildGroups()
      @buildReplacers()

  merge: (target, source) ->
    for key of source
      target[key] = source[key]

  build: (source) ->
    tag = 'div'
    out = ""
    words = @words

    for item in source
      out += @getWord item

    # Replace anything that needs to be
    for replace in @replace
      out = out.replace replace.replace, replace.with

    # Run any formatters that need to be
    for format in @format
      if @formatters[format]
        out = @formatters[format] out

    # Error check according to the rules in the language
    lineNo = 0
    errors = []
    eList = {}

    addError = (msg) ->
      eList[lineNo] = true
      errors.push "#{lineNo}: #{msg}"

    for i in [0..source.length]
      if source[i] is 0
        lineNo += 1
      else
        word = words[source[i]]
        if word and word.follows
          # Word must follow whatever's specified
          err = no
          if typeof word.follows is 'number' and source[i-1] isnt word.follows
            # Follow a specific word
            addError "\"#{@getWord(source[i]).trim()}\" must follow \"#{@getWord(word.follows).trim()}\""

          else if typeof word.follows is 'string' and
          (typeof words[source[i-1]].group is 'undefined' or words[source[i-1]].group isnt word.follows)
            # Follow a group
            addError "\"#{@getWord(source[i]).trim()}\" can't follow \"#{@getWord(source[i-1]).trim()}\""

    # Split lines into separate HTML tags
    html = ""
    lineNo = 0
    lineList = out.split("\n")
    for line in lineList
      lineNo++
      css = if eList[lineNo] then 'line error' else 'line'
      html += "<#{tag} class=\"#{css}\" data-line=\"#{lineNo}\">#{line}</#{tag}>"

    return string: out, html: html, errors: errors

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

    null


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

  formatters:
    js_beautify: js_beautify