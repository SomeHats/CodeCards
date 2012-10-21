#
#Copyright (c) 2011 Juan Mellado
#
#Permission is hereby granted, free of charge, to any person obtaining a copy
#of this software and associated documentation files (the "Software"), to deal
#in the Software without restriction, including without limitation the rights
#to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#copies of the Software, and to permit persons to whom the Software is
#furnished to do so, subject to the following conditions:
#
#The above copyright notice and this permission notice shall be included in
#all copies or substantial portions of the Software.
#
#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
#AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
#THE SOFTWARE.
#

#
#References:
#- "OpenCV: Open Computer Vision Library"
#  http://sourceforge.net/projects/opencvlibrary/
#- "Stack Blur: Fast But Goodlooking"
#  http://incubator.quasimondo.com/processing/fast_blur_deluxe.php
#
CV = CV or {}
CV.Image = (width, height, data) ->
  @width = width or 0
  @height = height or 0
  @data = data or []
  @

CV.grayscale = (imageSrc, imageDst) ->
  src = imageSrc.data
  dst = imageDst.data
  len = src.length
  i = 0
  j = 0
  while i < len
    dst[j++] = (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114 + 0.5) & 0xff
    i += 4
  imageDst.width = imageSrc.width
  imageDst.height = imageSrc.height
  imageDst

CV.threshold = (imageSrc, imageDst, threshold) ->
  src = imageSrc.data
  dst = imageDst.data
  len = src.length
  tab = []
  i = undefined
  i = 0
  while i < 256
    tab[i] = (if i <= threshold then 0 else 255)
    ++i
  i = 0
  while i < len
    dst[i] = tab[src[i]]
    ++i
  imageDst.width = imageSrc.width
  imageDst.height = imageSrc.height
  imageDst

CV.adaptiveThreshold = (imageSrc, imageDst, kernelSize, threshold) ->
  src = imageSrc.data
  dst = imageDst.data
  len = src.length
  tab = []
  i = undefined
  CV.stackBoxBlur imageSrc, imageDst, kernelSize
  i = 0
  while i < 768
    tab[i] = (if (i - 255 <= -threshold) then 255 else 0)
    ++i
  i = 0
  while i < len
    dst[i] = tab[src[i] - dst[i] + 255]
    ++i
  imageDst.width = imageSrc.width
  imageDst.height = imageSrc.height
  imageDst

CV.otsu = (imageSrc) ->
  src = imageSrc.data
  len = src.length
  hist = []
  threshold = 0
  sum = 0
  sumB = 0
  wB = 0
  wF = 0
  max = 0
  mu = undefined
  between = undefined
  i = undefined
  i = 0
  while i < 256
    hist[i] = 0
    ++i
  i = 0
  while i < len
    hist[src[i]]++
    ++i
  i = 0
  while i < 256
    sum += hist[i] * i
    ++i
  i = 0
  while i < 256
    wB += hist[i]
    if 0 isnt wB
      wF = len - wB
      break  if 0 is wF
      sumB += hist[i] * i
      mu = (sumB / wB) - ((sum - sumB) / wF)
      between = wB * wF * mu * mu
      if between > max
        max = between
        threshold = i
    ++i
  threshold

CV.stackBoxBlurMult = [1, 171, 205, 293, 57, 373, 79, 137, 241, 27, 391, 357, 41, 19, 283, 265]
CV.stackBoxBlurShift = [0, 9, 10, 11, 9, 12, 10, 11, 12, 9, 13, 13, 10, 9, 13, 13]
CV.BlurStack = ->
  @color = 0
  @next = null

CV.stackBoxBlur = (imageSrc, imageDst, kernelSize) ->
  src = imageSrc.data
  dst = imageDst.data
  height = imageSrc.height
  width = imageSrc.width
  heightMinus1 = height - 1
  widthMinus1 = width - 1
  size = kernelSize + kernelSize + 1
  radius = kernelSize + 1
  mult = CV.stackBoxBlurMult[kernelSize]
  shift = CV.stackBoxBlurShift[kernelSize]
  stack = undefined
  stackStart = undefined
  color = undefined
  sum = undefined
  pos = undefined
  start = undefined
  p = undefined
  x = undefined
  y = undefined
  i = undefined
  stack = stackStart = new CV.BlurStack()
  i = 1
  while i < size
    stack = stack.next = new CV.BlurStack()
    ++i
  stack.next = stackStart
  pos = 0
  y = 0
  while y < height
    start = pos
    color = src[pos]
    sum = radius * color
    stack = stackStart
    i = 0
    while i < radius
      stack.color = color
      stack = stack.next
      ++i
    i = 1
    while i < radius
      stack.color = src[pos + i]
      sum += stack.color
      stack = stack.next
      ++i
    stack = stackStart
    x = 0
    while x < width
      dst[pos++] = (sum * mult) >>> shift
      p = x + radius
      p = start + ((if p < widthMinus1 then p else widthMinus1))
      sum -= stack.color - src[p]
      stack.color = src[p]
      stack = stack.next
      ++x
    ++y
  x = 0
  while x < width
    pos = x
    start = pos + width
    color = dst[pos]
    sum = radius * color
    stack = stackStart
    i = 0
    while i < radius
      stack.color = color
      stack = stack.next
      ++i
    i = 1
    while i < radius
      stack.color = dst[start]
      sum += stack.color
      stack = stack.next
      start += width
      ++i
    stack = stackStart
    y = 0
    while y < height
      dst[pos] = (sum * mult) >>> shift
      p = y + radius
      p = x + (((if p < heightMinus1 then p else heightMinus1)) * width)
      sum -= stack.color - dst[p]
      stack.color = dst[p]
      stack = stack.next
      pos += width
      ++y
    ++x
  imageDst

CV.gaussianBlur = (imageSrc, imageDst, imageMean, kernelSize) ->
  kernel = CV.gaussianKernel(kernelSize)
  imageDst.width = imageSrc.width
  imageDst.height = imageSrc.height
  imageMean.width = imageSrc.width
  imageMean.height = imageSrc.height
  CV.gaussianBlurFilter imageSrc, imageMean, kernel, true
  CV.gaussianBlurFilter imageMean, imageDst, kernel, false
  imageDst

CV.gaussianBlurFilter = (imageSrc, imageDst, kernel, horizontal) ->
  src = imageSrc.data
  dst = imageDst.data
  height = imageSrc.height
  width = imageSrc.width
  pos = 0
  limit = kernel.length >> 1
  cur = undefined
  value = undefined
  i = undefined
  j = undefined
  k = undefined
  i = 0
  while i < height
    j = 0
    while j < width
      value = 0.0
      k = -limit
      while k <= limit
        if horizontal
          cur = pos + k
          if j + k < 0
            cur = pos
          else cur = pos  if j + k >= width
        else
          cur = pos + (k * width)
          if i + k < 0
            cur = pos
          else cur = pos  if i + k >= height
        value += kernel[limit + k] * src[cur]
        ++k
      dst[pos++] = (if horizontal then value else (value + 0.5) & 0xff)
      ++j
    ++i
  imageDst

CV.gaussianKernel = (kernelSize) ->
  tab = [[1], [0.25, 0.5, 0.25], [0.0625, 0.25, 0.375, 0.25, 0.0625], [0.03125, 0.109375, 0.21875, 0.28125, 0.21875, 0.109375, 0.03125]]
  kernel = []
  center = undefined
  sigma = undefined
  scale2X = undefined
  sum = undefined
  x = undefined
  i = undefined
  if (kernelSize <= 7) and (kernelSize % 2 is 1)
    kernel = tab[kernelSize >> 1]
  else
    center = (kernelSize - 1.0) * 0.5
    sigma = 0.8 + (0.3 * (center - 1.0))
    scale2X = -0.5 / (sigma * sigma)
    sum = 0.0
    i = 0
    while i < kernelSize
      x = i - center
      sum += kernel[i] = Math.exp(scale2X * x * x)
      ++i
    sum = 1 / sum
    i = 0
    while i < kernelSize
      kernel[i] *= sum
      ++i
  kernel

CV.findContours = (imageSrc, binary) ->
  width = imageSrc.width
  height = imageSrc.height
  contours = []
  src = undefined
  deltas = undefined
  pos = undefined
  pix = undefined
  nbd = undefined
  outer = undefined
  hole = undefined
  i = undefined
  j = undefined
  src = CV.binaryBorder(imageSrc, binary)
  deltas = CV.neighborhoodDeltas(width + 2)
  pos = width + 3
  nbd = 1
  i = 0
  while i < height
    j = 0
    while j < width
      pix = src[pos]
      if 0 isnt pix
        outer = hole = false
        if 1 is pix and 0 is src[pos - 1]
          outer = true
        else hole = true  if pix >= 1 and 0 is src[pos + 1]
        if outer or hole
          ++nbd
          contours.push CV.borderFollowing(src, pos, nbd,
            x: j
            y: i
          , hole, deltas)
      ++j
      ++pos
    ++i
    pos += 2
  contours

CV.borderFollowing = (src, pos, nbd, point, hole, deltas) ->
  contour = []
  pos1 = undefined
  pos3 = undefined
  pos4 = undefined
  s = undefined
  s_end = undefined
  s_prev = undefined
  contour.hole = hole
  s = s_end = (if hole then 0 else 4)
  loop
    s = (s - 1) & 7
    pos1 = pos + deltas[s]
    break  if src[pos1] isnt 0
    break unless s isnt s_end
  if s is s_end
    src[pos] = -nbd
    contour.push
      x: point.x
      y: point.y

  else
    pos3 = pos
    s_prev = s ^ 4
    loop
      s_end = s
      loop
        pos4 = pos3 + deltas[++s]
        break unless src[pos4] is 0
      s &= 7
      if ((s - 1) >>> 0) < (s_end >>> 0)
        src[pos3] = -nbd
      else src[pos3] = nbd  if src[pos3] is 1
      contour.push
        x: point.x
        y: point.y

      s_prev = s
      point.x += CV.neighborhood[s][0]
      point.y += CV.neighborhood[s][1]
      break  if (pos4 is pos) and (pos3 is pos1)
      pos3 = pos4
      s = (s + 4) & 7
  contour

CV.neighborhood = [[1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]]
CV.neighborhoodDeltas = (width) ->
  deltas = []
  len = CV.neighborhood.length
  i = 0
  while i < len
    deltas[i] = CV.neighborhood[i][0] + (CV.neighborhood[i][1] * width)
    ++i
  deltas.concat deltas

CV.approxPolyDP = (contour, epsilon) ->
  slice =
    start_index: 0
    end_index: 0

  right_slice =
    start_index: 0
    end_index: 0

  poly = []
  stack = []
  len = contour.length
  pt = undefined
  start_pt = undefined
  end_pt = undefined
  dist = undefined
  max_dist = undefined
  le_eps = undefined
  dx = undefined
  dy = undefined
  i = undefined
  j = undefined
  k = undefined
  epsilon *= epsilon
  k = 0
  i = 0
  while i < 3
    max_dist = 0
    k = (k + right_slice.start_index) % len
    start_pt = contour[k]
    k = 0  if ++k is len
    j = 1
    while j < len
      pt = contour[k]
      k = 0  if ++k is len
      dx = pt.x - start_pt.x
      dy = pt.y - start_pt.y
      dist = dx * dx + dy * dy
      if dist > max_dist
        max_dist = dist
        right_slice.start_index = j
      ++j
    ++i
  if max_dist <= epsilon
    poly.push
      x: start_pt.x
      y: start_pt.y

  else
    slice.start_index = k
    slice.end_index = (right_slice.start_index += slice.start_index)
    right_slice.start_index -= (if right_slice.start_index >= len then len else 0)
    right_slice.end_index = slice.start_index
    right_slice.end_index += len  if right_slice.end_index < right_slice.start_index
    stack.push
      start_index: right_slice.start_index
      end_index: right_slice.end_index

    stack.push
      start_index: slice.start_index
      end_index: slice.end_index

  while stack.length isnt 0
    slice = stack.pop()
    end_pt = contour[slice.end_index % len]
    start_pt = contour[k = slice.start_index % len]
    k = 0  if ++k is len
    if slice.end_index <= slice.start_index + 1
      le_eps = true
    else
      max_dist = 0
      dx = end_pt.x - start_pt.x
      dy = end_pt.y - start_pt.y
      i = slice.start_index + 1
      while i < slice.end_index
        pt = contour[k]
        k = 0  if ++k is len
        dist = Math.abs((pt.y - start_pt.y) * dx - (pt.x - start_pt.x) * dy)
        if dist > max_dist
          max_dist = dist
          right_slice.start_index = i
        ++i
      le_eps = max_dist * max_dist <= epsilon * (dx * dx + dy * dy)
    if le_eps
      poly.push
        x: start_pt.x
        y: start_pt.y

    else
      right_slice.end_index = slice.end_index
      slice.end_index = right_slice.start_index
      stack.push
        start_index: right_slice.start_index
        end_index: right_slice.end_index

      stack.push
        start_index: slice.start_index
        end_index: slice.end_index

  poly

CV.warp = (imageSrc, imageDst, contour, warpSize) ->
  src = imageSrc.data
  dst = imageDst.data
  width = imageSrc.width
  height = imageSrc.height
  pos = 0
  sx1 = undefined
  sx2 = undefined
  dx1 = undefined
  dx2 = undefined
  sy1 = undefined
  sy2 = undefined
  dy1 = undefined
  dy2 = undefined
  p1 = undefined
  p2 = undefined
  p3 = undefined
  p4 = undefined
  m = undefined
  r = undefined
  s = undefined
  t = undefined
  u = undefined
  v = undefined
  w = undefined
  x = undefined
  y = undefined
  i = undefined
  j = undefined
  m = CV.getPerspectiveTransform(contour, warpSize - 1)
  r = m[8]
  s = m[2]
  t = m[5]
  i = 0
  while i < warpSize
    r += m[7]
    s += m[1]
    t += m[4]
    u = r
    v = s
    w = t
    j = 0
    while j < warpSize
      u += m[6]
      v += m[0]
      w += m[3]
      x = v / u
      y = w / u
      sx1 = x >>> 0
      sx2 = (if (sx1 is width - 1) then sx1 else sx1 + 1)
      dx1 = x - sx1
      dx2 = 1.0 - dx1
      sy1 = y >>> 0
      sy2 = (if (sy1 is height - 1) then sy1 else sy1 + 1)
      dy1 = y - sy1
      dy2 = 1.0 - dy1
      p1 = p2 = sy1 * width
      p3 = p4 = sy2 * width
      dst[pos++] = (dy2 * (dx2 * src[p1 + sx1] + dx1 * src[p2 + sx2]) + dy1 * (dx2 * src[p3 + sx1] + dx1 * src[p4 + sx2])) & 0xff
      ++j
    ++i
  imageDst.width = warpSize
  imageDst.height = warpSize
  imageDst

CV.getPerspectiveTransform = (src, size) ->
  rq = CV.square2quad(src)
  rq[0] /= size
  rq[1] /= size
  rq[3] /= size
  rq[4] /= size
  rq[6] /= size
  rq[7] /= size
  rq

CV.square2quad = (src) ->
  sq = []
  px = undefined
  py = undefined
  dx1 = undefined
  dx2 = undefined
  dy1 = undefined
  dy2 = undefined
  den = undefined
  px = src[0].x - src[1].x + src[2].x - src[3].x
  py = src[0].y - src[1].y + src[2].y - src[3].y
  if 0 is px and 0 is py
    sq[0] = src[1].x - src[0].x
    sq[1] = src[2].x - src[1].x
    sq[2] = src[0].x
    sq[3] = src[1].y - src[0].y
    sq[4] = src[2].y - src[1].y
    sq[5] = src[0].y
    sq[6] = 0
    sq[7] = 0
    sq[8] = 1
  else
    dx1 = src[1].x - src[2].x
    dx2 = src[3].x - src[2].x
    dy1 = src[1].y - src[2].y
    dy2 = src[3].y - src[2].y
    den = dx1 * dy2 - dx2 * dy1
    sq[6] = (px * dy2 - dx2 * py) / den
    sq[7] = (dx1 * py - px * dy1) / den
    sq[8] = 1
    sq[0] = src[1].x - src[0].x + sq[6] * src[1].x
    sq[1] = src[3].x - src[0].x + sq[7] * src[3].x
    sq[2] = src[0].x
    sq[3] = src[1].y - src[0].y + sq[6] * src[1].y
    sq[4] = src[3].y - src[0].y + sq[7] * src[3].y
    sq[5] = src[0].y
  sq

CV.isContourConvex = (contour) ->
  orientation = 0
  convex = true
  len = contour.length
  i = 0
  j = 0
  cur_pt = undefined
  prev_pt = undefined
  dxdy0 = undefined
  dydx0 = undefined
  dx0 = undefined
  dy0 = undefined
  dx = undefined
  dy = undefined
  prev_pt = contour[len - 1]
  cur_pt = contour[0]
  dx0 = cur_pt.x - prev_pt.x
  dy0 = cur_pt.y - prev_pt.y
  while i < len
    j = 0  if ++j is len
    prev_pt = cur_pt
    cur_pt = contour[j]
    dx = cur_pt.x - prev_pt.x
    dy = cur_pt.y - prev_pt.y
    dxdy0 = dx * dy0
    dydx0 = dy * dx0
    orientation |= (if dydx0 > dxdy0 then 1 else ((if dydx0 < dxdy0 then 2 else 3)))
    if 3 is orientation
      convex = false
      break
    dx0 = dx
    dy0 = dy
    ++i
  convex

CV.perimeter = (poly) ->
  len = poly.length
  i = 0
  j = len - 1
  p = 0.0
  dx = undefined
  dy = undefined
  while i < len
    dx = poly[i].x - poly[j].x
    dy = poly[i].y - poly[j].y
    p += Math.sqrt(dx * dx + dy * dy)
    j = i++
  p

CV.minEdgeLength = (poly) ->
  len = poly.length
  i = 0
  j = len - 1
  min = Infinity
  d = undefined
  dx = undefined
  dy = undefined
  while i < len
    dx = poly[i].x - poly[j].x
    dy = poly[i].y - poly[j].y
    d = dx * dx + dy * dy
    min = d  if d < min
    j = i++
  Math.sqrt min

CV.countNonZero = (imageSrc, square) ->
  src = imageSrc.data
  height = square.height
  width = square.width
  pos = square.x + (square.y * imageSrc.width)
  span = imageSrc.width - width
  nz = 0
  i = undefined
  j = undefined
  i = 0
  while i < height
    j = 0
    while j < width
      ++nz  if 0 isnt src[pos++]
      ++j
    pos += span
    ++i
  nz

CV.binaryBorder = (imageSrc, dst) ->
  src = imageSrc.data
  height = imageSrc.height
  width = imageSrc.width
  posSrc = 0
  posDst = 0
  i = undefined
  j = undefined
  j = -2
  while j < width
    dst[posDst++] = 0
    ++j
  i = 0
  while i < height
    dst[posDst++] = 0
    j = 0
    while j < width
      dst[posDst++] = ((if 0 is src[posSrc++] then 0 else 1))
      ++j
    dst[posDst++] = 0
    ++i
  j = -2
  while j < width
    dst[posDst++] = 0
    ++j
  dst

#
#Copyright (c) 2011 Juan Mellado
#
#Permission is hereby granted, free of charge, to any person obtaining a copy
#of this software and associated documentation files (the "Software"), to deal
#in the Software without restriction, including without limitation the rights
#to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#copies of the Software, and to permit persons to whom the Software is
#furnished to do so, subject to the following conditions:
#
#The above copyright notice and this permission notice shall be included in
#all copies or substantial portions of the Software.
#
#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
#AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
#THE SOFTWARE.
#

#
#References:
#- "ArUco: a minimal library for Augmented Reality applications based on OpenCv"
#  http://www.uco.es/investiga/grupos/ava/node/26
#
AR = AR or {}
AR.Marker = (id, corners) ->
  @id = id
  @corners = corners
  @

class AR.Detector
  constructor: (minSize) ->
    @grey = new CV.Image()
    @thres = new CV.Image()
    @homography = new CV.Image()
    @minSize = minSize
    @binary = []
    @contours = []
    @polys = []
    @candidates = []

  detect: (image) ->

    CV.grayscale image, @grey
    CV.adaptiveThreshold @grey, @thres, 2, 7
    @contours = CV.findContours(@thres, @binary)
    @candidates = @findCandidates(@contours, @minSize, 0.05, 10)
    @candidates = @clockwiseCorners(@candidates)
    @candidates = @notTooNear(@candidates, 10)
    @findMarkers @grey, @candidates, 100

  findCandidates: (contours, minSize, epsilon, minLength) ->
    candidates = []
    len = contours.length
    contour = undefined
    poly = undefined
    i = undefined
    @polys = []
    i = 0
    while i < len
      contour = contours[i]
      if contour.length >= minSize
        poly = CV.approxPolyDP(contour, contour.length * epsilon)
        @polys.push poly
        candidates.push poly  if CV.minEdgeLength(poly) >= minLength  if (4 is poly.length) and (CV.isContourConvex(poly))
      ++i
    candidates

  clockwiseCorners: (candidates) ->
    len = candidates.length
    dx1 = undefined
    dx2 = undefined
    dy1 = undefined
    dy2 = undefined
    swap = undefined
    i = undefined
    i = 0
    while i < len
      dx1 = candidates[i][1].x - candidates[i][0].x
      dy1 = candidates[i][1].y - candidates[i][0].y
      dx2 = candidates[i][2].x - candidates[i][0].x
      dy2 = candidates[i][2].y - candidates[i][0].y
      if (dx1 * dy2 - dy1 * dx2) < 0
        swap = candidates[i][1]
        candidates[i][1] = candidates[i][3]
        candidates[i][3] = swap
      ++i
    candidates

  notTooNear: (candidates, minDist) ->
    notTooNear = []
    len = candidates.length
    dist = undefined
    dx = undefined
    dy = undefined
    i = undefined
    j = undefined
    k = undefined
    i = 0
    while i < len
      j = i + 1
      while j < len
        dist = 0
        k = 0
        while k < 4
          dx = candidates[i][k].x - candidates[j][k].x
          dy = candidates[i][k].y - candidates[j][k].y
          dist += dx * dx + dy * dy
          ++k
        if (dist / 4) < (minDist * minDist)
          if CV.perimeter(candidates[i]) < CV.perimeter(candidates[j])
            candidates[i].tooNear = true
          else
            candidates[j].tooNear = true
        ++j
      ++i
    i = 0
    while i < len
      notTooNear.push candidates[i]  unless candidates[i].tooNear
      ++i
    notTooNear

  findMarkers: (imageSrc, candidates, warpSize) ->
    markers = []
    len = candidates.length
    candidate = undefined
    marker = undefined
    i = undefined
    i = 0
    while i < len
      candidate = candidates[i]
      CV.warp imageSrc, @homography, candidate, warpSize
      CV.threshold @homography, @homography, CV.otsu(@homography)
      marker = @getMarker(@homography, candidate)
      markers.push marker  if marker
      ++i
    markers

  getMarker: (imageSrc, candidate) ->
    width = (imageSrc.width / 7) >>> 0
    minZero = (width * width) >> 1
    bits = []
    rotations = []
    distances = []
    square = undefined
    pair = undefined
    inc = undefined
    i = undefined
    j = undefined
    i = 0
    while i < 7
      inc = (if (0 is i or 6 is i) then 1 else 6)
      j = 0
      while j < 7
        square =
          x: j * width
          y: i * width
          width: width
          height: width

        return null  if CV.countNonZero(imageSrc, square) > minZero
        j += inc
      ++i
    i = 0
    while i < 5
      bits[i] = []
      j = 0
      while j < 5
        square =
          x: (j + 1) * width
          y: (i + 1) * width
          width: width
          height: width

        bits[i][j] = (if CV.countNonZero(imageSrc, square) > minZero then 1 else 0)
        ++j
      ++i
    rotations[0] = bits
    distances[0] = @hammingDistance(rotations[0])
    pair =
      first: distances[0]
      second: 0

    i = 1
    while i < 4
      rotations[i] = @rotate(rotations[i - 1])
      distances[i] = @hammingDistance(rotations[i])
      if distances[i] < pair.first
        pair.first = distances[i]
        pair.second = i
      ++i
    return null  if 0 isnt pair.first
    new AR.Marker(@mat2id(rotations[pair.second]), @rotate2(candidate, 4 - pair.second))

  hammingDistance: (bits) ->
    ids = [[1, 0, 0, 0, 0], [1, 0, 1, 1, 1], [0, 1, 0, 0, 1], [0, 1, 1, 1, 0]]
    dist = 0
    sum = undefined
    minSum = undefined
    i = undefined
    j = undefined
    k = undefined
    i = 0
    while i < 5
      minSum = Infinity
      j = 0
      while j < 4
        sum = 0
        k = 0
        while k < 5
          sum += (if bits[i][k] is ids[j][k] then 0 else 1)
          ++k
        minSum = sum  if sum < minSum
        ++j
      dist += minSum
      ++i
    dist

  mat2id: (bits) ->
    id = 0
    i = undefined
    i = 0
    while i < 5
      id <<= 1
      id |= bits[i][1]
      id <<= 1
      id |= bits[i][3]
      ++i
    id

  rotate: (src) ->
    dst = []
    len = src.length
    i = undefined
    j = undefined
    i = 0
    while i < len
      dst[i] = []
      j = 0
      while j < src[i].length
        dst[i][j] = src[src[i].length - j - 1][i]
        ++j
      ++i
    dst

  rotate2: (src, rotation) ->
    dst = []
    len = src.length
    i = undefined
    i = 0
    while i < len
      dst[i] = src[(rotation + i) % len]
      ++i
    dst

module.exports = AR