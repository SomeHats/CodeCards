eventSplitter = /\s+/

module.exports = class Worker
  constructor: (slf) ->
    _ths = @
    slf.onmessage = (e) ->
      _ths.trigger e.event, e.data

    @send = (event, data) ->
      slf.postMessage
        event: event
        data: data

    @initialize()

  initialize: -> null

# Backbone.Events converted into coffeescript

  # Bind one or more space separated events, `events`, to a `callback`
  # function. Passing `"all"` will bind the callback to all events fired.
  on: (events, callback, context) ->
    return this  unless callback
    events = events.split(eventSplitter)
    calls = @_callbacks or (@_callbacks = {})
    while event = events.shift()
      list = calls[event] or (calls[event] = [])
      list.push callback, context
    this

  
  # Remove one or many callbacks. If `context` is null, removes all callbacks
  # with that function. If `callback` is null, removes all callbacks for the
  # event. If `events` is null, removes all bound callbacks for all events.
  off: (events, callback, context) ->
    # _.keys from underscore.js
    _.keys = Object.keys or (obj) ->
      throw new TypeError("Invalid object")  if obj isnt Object(obj)
      keys = []
      for key of obj
        keys[keys.length] = key  if _.has(obj, key)
      keys

    # No events, or removing *all* events.
    return this  unless calls = @_callbacks
    unless events or callback or context
      delete @_callbacks

      return this
    events = (if events then events.split(eventSplitter) else _.keys(calls))
    
    # Loop through the callback list, splicing where appropriate.
    while event = events.shift()
      if not (list = calls[event]) or not (callback or context)
        delete calls[event]

        continue
      i = list.length - 2
      while i >= 0
        list.splice i, 2  unless callback and list[i] isnt callback or context and list[i + 1] isnt context
        i -= 2
    this

  
  # Trigger one or many events, firing all bound callbacks. Callbacks are
  # passed the same arguments as `trigger` is, apart from the event name
  # (unless you're listening on `"all"`, which will cause your callback to
  # receive the true name of the event as the first argument).
  trigger: (events) ->
    return this unless calls = @_callbacks
    rest = []
    events = events.split(eventSplitter)
    
    # Fill up `rest` with the callback arguments.  Since we're only copying
    # the tail of `arguments`, a loop is much faster than Array#slice.
    i = 1
    length = arguments_.length

    while i < length
      rest[i - 1] = arguments_[i]
      i++
    
    # For each event, walk through the list of callbacks twice, first to
    # trigger the event, then to trigger any `"all"` callbacks.
    while event = events.shift()
      
      # Copy callback lists to prevent modification.
      all = all.slice()  if all = calls.all
      list = list.slice()  if list = calls[event]
      
      # Execute event callbacks.
      if list
        i = 0
        length = list.length

        while i < length
          list[i].apply list[i + 1] or this, rest
          i += 2
      
      # Execute "all" callbacks.
      if all
        args = [event].concat(rest)
        i = 0
        length = all.length

        while i < length
          all[i].apply all[i + 1] or this, args
          i += 2
    this