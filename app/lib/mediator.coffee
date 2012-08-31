class Mediator
  events: {}

  getCallbacksFor: (keyString) ->
    keys = keyString.split ':'
    callbacks = []

    getFrom = (events) ->
      key = keys.shift()
      if key
        if !events[key]
          events[key] = []

        callbacks.push events[key]
        getFrom events[key]

    getFrom @events

    callbacks

  on: (keys, callback) ->
    self = @
    bind = (key, callback) ->
      callbacks = self.getCallbacksFor key
      callbacks[callbacks.length - 1].push callback

    if typeof keys is 'object' and keys instanceof Object
      bind name, keys[name] for name of keys
    else if typeof keys is 'string' or keys instanceof String
      bind keys, callback

  trigger: (keyString, data) ->
    callbacks = @getCallbacksFor keyString
    for callback in callbacks
      for call in callback
        call data

module.exports = new Mediator