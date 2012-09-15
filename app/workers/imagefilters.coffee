#Copyright (c) 2010 Mario Klingemann

# I (J. Dytrych) have taken a subset of these function, and modified them to not 
# depend on canvas.

ImageFilters = {}
ImageFilters.utils =
  clamp: (value) ->
    (if value > 255 then 255 else (if value < 0 then 0 else value))

  buildMap: (f) ->
    m = []
    k = 0
    v = undefined

    while k < 256
      m[k] = (if (v = f(k)) > 255 then 255 else (if v < 0 then 0 else v | 0))
      k += 1
    m

  applyMap: (src, map) ->
    i = 0
    l = src.length

    while i < l
      src[i] = map[src[i]]
      src[i + 1] = map[src[i + 1]]
      src[i + 2] = map[src[i + 2]]
      src[i + 3] = src[i + 3]
      i += 4

  mapRGB: (src, func) ->
    @applyMap src, @buildMap(func)

  getPixelIndex: (x, y, width, height, edge) ->
    if x < 0 or x >= width or y < 0 or y >= height
      switch edge
        when 1 # clamp
          x = (if x < 0 then 0 else (if x >= width then width - 1 else x))
          y = (if y < 0 then 0 else (if y >= height then height - 1 else y))
        when 2 # wrap
          x = (if (x %= width) < 0 then x + width else x)
          y = (if (y %= height) < 0 then y + height else y)
        else # transparent
          return null
    (y * width + x) << 2

  getPixel: (src, x, y, width, height, edge) ->
    if x < 0 or x >= width or y < 0 or y >= height
      switch edge
        when 1 # clamp
          x = (if x < 0 then 0 else (if x >= width then width - 1 else x))
          y = (if y < 0 then 0 else (if y >= height then height - 1 else y))
        when 2 # wrap
          x = (if (x %= width) < 0 then x + width else x)
          y = (if (y %= height) < 0 then y + height else y)
        else # transparent
          return 0
    i = (y * width + x) << 2
    
    # ARGB
    src[i + 3] << 24 | src[i] << 16 | src[i + 1] << 8 | src[i + 2]

  getPixelByIndex: (src, i) ->
    src[i + 3] << 24 | src[i] << 16 | src[i + 1] << 8 | src[i + 2]

  ###
  @param r 0 <= n <= 255
  @param g 0 <= n <= 255
  @param b 0 <= n <= 255
  @return Array(h, s, l)
  ###
  rgbToHsl: (r, g, b) ->
    r /= 255
    g /= 255
    b /= 255
    
    #        var max = Math.max(r, g, b),
    #            min = Math.min(r, g, b),
    max = (if (r > g) then (if (r > b) then r else b) else (if (g > b) then g else b))
    min = (if (r < g) then (if (r < b) then r else b) else (if (g < b) then g else b))
    chroma = max - min
    h = 0
    s = 0
    
    # Lightness
    l = (min + max) / 2
    if chroma isnt 0
      
      # Hue
      if r is max
        h = (g - b) / chroma + ((if (g < b) then 6 else 0))
      else if g is max
        h = (b - r) / chroma + 2
      else
        h = (r - g) / chroma + 4
      h /= 6
      
      # Saturation
      s = (if (l > 0.5) then chroma / (2 - max - min) else chroma / (max + min))
    [h, s, l]

  
  ###
  @param h 0.0 <= n <= 1.0
  @param s 0.0 <= n <= 1.0
  @param l 0.0 <= n <= 1.0
  @return Array(r, g, b)
  ###
  hslToRgb: (h, s, l) ->
    m1 = undefined
    m2 = undefined
    hue = undefined
    r = undefined
    g = undefined
    b = undefined
    rgb = []
    if s is 0
      r = g = b = l * 255 + 0.5 | 0
      rgb = [r, g, b]
    else
      if l <= 0.5
        m2 = l * (s + 1)
      else
        m2 = l + s - l * s
      m1 = l * 2 - m2
      hue = h + 1 / 3
      tmp = undefined
      i = 0

      while i < 3
        if hue < 0
          hue += 1
        else hue -= 1  if hue > 1
        if 6 * hue < 1
          tmp = m1 + (m2 - m1) * hue * 6
        else if 2 * hue < 1
          tmp = m2
        else if 3 * hue < 2
          tmp = m1 + (m2 - m1) * (2 / 3 - hue) * 6
        else
          tmp = m1
        rgb[i] = tmp * 255 + 0.5 | 0
        hue -= 1 / 3
        i += 1
    rgb

ImageFilters.ConvolutionFilter = (srcImageData, matrixX, matrixY, matrix, divisor, bias, preserveAlpha, clamp, color, alpha) ->
  srcPixels = srcImageData.data
  srcWidth = srcImageData.width
  srcHeight = srcImageData.height
  srcLength = srcPixels.length
  divisor = divisor or 1
  bias = bias or 0
  
  # default true
  (preserveAlpha isnt false) and (preserveAlpha = true)
  (clamp isnt false) and (clamp = true)
  color = color or 0
  alpha = alpha or 0
  index = 0
  rows = matrixX >> 1
  cols = matrixY >> 1
  clampR = color >> 16 & 0xFF
  clampG = color >> 8 & 0xFF
  clampB = color & 0xFF
  clampA = alpha * 0xFF
  y = 0

  while y < srcHeight
    x = 0

    while x < srcWidth
      r = 0
      g = 0
      b = 0
      a = 0
      replace = false
      mIndex = 0
      v = undefined
      row = -rows

      while row <= rows
        rowIndex = y + row
        offset = undefined
        if 0 <= rowIndex and rowIndex < srcHeight
          offset = rowIndex * srcWidth
        else if clamp
          offset = y * srcWidth
        else
          replace = true
        col = -cols

        while col <= cols
          m = matrix[mIndex++]
          if m isnt 0
            colIndex = x + col
            unless 0 <= colIndex and colIndex < srcWidth
              if clamp
                colIndex = x
              else
                replace = true
            if replace
              r += m * clampR
              g += m * clampG
              b += m * clampB
              a += m * clampA
            else
              p = (offset + colIndex) << 2
              r += m * srcPixels[p]
              g += m * srcPixels[p + 1]
              b += m * srcPixels[p + 2]
              a += m * srcPixels[p + 3]
          col += 1
        row += 1
      srcPixels[index] = (if (v = r / divisor + bias) > 255 then 255 else (if v < 0 then 0 else v | 0))
      srcPixels[index + 1] = (if (v = g / divisor + bias) > 255 then 255 else (if v < 0 then 0 else v | 0))
      srcPixels[index + 2] = (if (v = b / divisor + bias) > 255 then 255 else (if v < 0 then 0 else v | 0))
      srcPixels[index + 3] = (if preserveAlpha then srcPixels[index + 3] else (if (v = a / divisor + bias) > 255 then 255 else (if v < 0 then 0 else v | 0)))
      x += 1
      index += 4
    y += 1
  srcImageData

#
#Copyright (c) 2010 Mario Klingemann
#
#Permission is hereby granted, free of charge, to any person
#obtaining a copy of this software and associated documentation
#files (the "Software"), to deal in the Software without
#restriction, including without limitation the rights to use,
#copy, modify, merge, publish, distribute, sublicense, and/or sell
#copies of the Software, and to permit persons to whom the
#Software is furnished to do so, subject to the following
#conditions:
#
#The above copyright notice and this permission notice shall be
#included in all copies or substantial portions of the Software.
#
#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
#EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
#OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
#NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
#HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
#WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
#FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
#OTHER DEALINGS IN THE SOFTWARE.
#


###
GIMP algorithm modified. pretty close to fireworks
@param brightness -100 <= n <= 100
@param contrast -100 <= n <= 100
###
ImageFilters.BrightnessContrastGimp = (srcImageData, brightness, contrast) ->
  srcPixels = srcImageData.data
  srcWidth = srcImageData.width
  srcHeight = srcImageData.height
  srcLength = srcPixels.length
  p4 = Math.PI / 4
  
  # fix to -1 <= n <= 1
  brightness /= 100
  
  # fix to -99 <= n <= 99
  contrast *= 0.99
  
  # fix to -1 < n < 1
  contrast /= 100
  
  # apply GIMP formula
  contrast = Math.tan((contrast + 1) * p4)
  
  # get the average color
  avg = 0
  i = 0

  while i < srcLength
    avg += (srcPixels[i] * 19595 + srcPixels[i + 1] * 38470 + srcPixels[i + 2] * 7471) >> 16
    i += 4
  avg = avg / (srcLength / 4)
  @utils.mapRGB srcPixels, (value) ->
    if brightness < 0
      value = value * (1 + brightness)
    else value = value + ((255 - value) * brightness)  if brightness > 0
    
    #value += brightness;
    value = (value - avg) * contrast + avg  if contrast isnt 0
    value + 0.5 | 0

  srcImageData

###
@param factor 1 <= n
###
ImageFilters.Sharpen = (srcImageData, factor) ->
  
  #Convolution formula from VIGRA
  @ConvolutionFilter srcImageData, 3, 3, [-factor / 16, -factor / 8, -factor / 16, -factor / 8, factor * 0.75 + 1, -factor / 8, -factor / 16, -factor / 8, -factor / 16]

module.exports = ImageFilters