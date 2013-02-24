#### /lib/Usermedia
# backboneify and normalise the getUserMedia API

module.exports = class UserMedia extends Backbone.View
  initialize: ->
    _ths = @

    # Success - the browser and user have granted access to the webcam
    success = (stream) ->
      video = document.createElement 'video'
      video.autoplay = on

      console.log stream

      # Attach the webcam stream to a video object
      if navigator.mozGetUserMedia
        video.mozSrcObject = stream
      else
        vendorURL = window.URL or window.webkitURL
        video.src = vendorURL.createObjectURL stream

      # Play the stream
      video.play();

      $(document.body).append video  
      _ths.ctx = ctx = _ths.el.getContext '2d'

      # On each animation frame (~60 times a second)
      Util.on 'animationFrame', ->
        if !_ths.paused
          # Check the video has a new frame ready
          if video.readyState is video.HAVE_ENOUGH_DATA
            # Draw the video frame to the canvas is the canvas is ready,
            # and trigger an imageData event.
            if _ths.el.isSetUp
              ctx.drawImage video, 0, 0, video.videoWidth, video.videoHeight
              _ths.imageData = _ths.ctx.getImageData 0, 0, _ths.el.width, _ths.el.height

              _ths.trigger 'imageData'

            # If the canvas isn't ready, check that the video has loaded
            # (video.videoWidth is 0 until the stream has loaded) and 
            # prepare the canvas.
            else if video.videoWidth
              _ths.el.setAttribute 'width', video.videoWidth
              _ths.el.setAttribute 'height', video.videoHeight
              _ths.el.width = video.videoWidth
              _ths.el.height = video.videoHeight
              _ths.el.isSetUp = true

    # Either browser doesn't have the new getUserMedia API or the user has
    # not granted webcam access
    error = ->
      console.log 'User Media denied :('
    
    # Ask the browser for a webcam stream. Currently supported by Firefox, 
    # Chrome, and Opera.   
    if navigator.getUserMedia
      navigator.getUserMedia {video: true}, success, error
    else if navigator.mozGetUserMedia
      navigator.mozGetUserMedia {video: true}, success, error
    else if navigator.webkitGetUserMedia 
      navigator.webkitGetUserMedia {video: true}, success, error
    else
      error()

  paused: false