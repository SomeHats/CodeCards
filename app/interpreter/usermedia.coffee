module.exports = class UserMedia extends Backbone.View
  initialize: ->
    self = @

    success = (stream) ->
      video = document.createElement 'video'
      video.autoplay = on

      if window.webkitURL and window.webkitURL.createObjectURL
        video.src = window.webkitURL.createObjectURL stream
      else
        video.src = stream

      self.ctx = ctx = self.el.getContext '2d'

      Util.on 'animationFrame', ->
        if !self.paused
          if video.readyState is video.HAVE_ENOUGH_DATA
            ctx.drawImage video, 0, 0, video.videoWidth, video.videoHeight
            if self.el.isSetUp
              self.ctx.drawImage video, 0, 0, video.videoWidth, video.videoHeight
              self.imageData = self.ctx.getImageData 0, 0, self.el.width, self.el.height

              self.trigger 'imageData'

            else if video.videoWidth
              self.el.setAttribute 'width', video.videoWidth
              self.el.setAttribute 'height', video.videoHeight
              self.el.width = video.videoWidth
              self.el.height = video.videoHeight
              self.el.isSetUp = true

    error = ->
      console.log 'User Media denied :('
      console.log @
      console.log self
    
    if navigator.getUserMedia
      navigator.getUserMedia {video: true}, success, error
    else if navigator.mozGetUserMedia
      navigator.mozGetUserMedia {video: true}, success, error
    else if navigator.webkitGetUserMedia 
      navigator.webkitGetUserMedia {video: true}, success, error
    else
      error()

  paused: false