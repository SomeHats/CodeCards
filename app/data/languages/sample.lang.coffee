# Sample language definition for CodeCards

module.exports = 
  # name: an alpha-numeric string with no spaces.
  name: 'sample'

  # version: a positive integer. This must be incremented every time the order
  #          of the language is changed.
  version: 3

  # extends: (optional) An object, where the keys are the names of languages to 
  #          extend and the values are the versions of those languages. This 
  #          will pre-populate the language with the data from these files. 
  extends:
    'js': 1

  # lang: the language definition object. The key is the ID of the marker it 
  #       corresponds to, and the value is an object containing details of the
  #       word. These values will overwrite the ones from the 'extends' object.
  #       ID 0 is reserved for the "start" marker.

  words:
    # Words can be defined as either strings or objects. If they are strings, 
    # then that string is displayed and interpreted, with no error checking.
    1: "hello "

    # Defining words with an object is far more versatile.
    2:
      # word: the string that corresponds to the given ID
      word: "world "

      # display: (optional) The html that is displayed when the code is shown on
      #          screen. If this value isn't defined, the value of word will be 
      #          used.
      display: "<strong>world </strong>"

      # group: (optional) A string that groups similar words together. Useful
      #        for error checking. If an array of strings is given, the word 
      #        joins multiple groups.
      group: "example group"

      # before: (optional) An array of integers or strings that define the words
      #         which can immediately precede this word. Any other preceding 
      #         word will result in an error. Strings correspond to group names,
      #         and integers correspond to individual IDs. In this example, only
      #         1 ("hello") may come before this word. 
      before: [1]

      # after: (optional) An array of integers or strings, exactly the same as 
      #        "before". The only difference is that (unsurprisingly) these
      #        values correspond to words allowed after this one. In this
      #        example, any words in "example group" are allowed after this word
      #        as well as ID 1.
      after: ["example group", 1]

      # In both of the above settings, ID 0 corresponds to both the start marker
      # and a new line. When the settings from above are combined, error 
      # works as follows:
      # 
      # [0, 1, 2] -> "hello world " -> No error
      # [0, 1, 1] -> "hello hello " -> No error
      # [0, 2, 1] -> "world hello " -> Error: "world " cannot follow newline
      # [0, 1, 2, 2] -> "hello world world " -> Error: "world " cannot follow 
      #                                         "world "
      # [0, 1, 2, 1] -> "hello world hello " -> No error
