if (typeof window === 'undefined') {
  var isWorker = true;
  global = {};
} else {
  var isWorker = false;
}
(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

if (isWorker) {
  var window = {};
  var require = window.require = global.require;
}


window.require.define({"workers/aruco": function(exports, require, module) {
  var AR, CV;

CV = CV || {};

CV.Image = function(width, height, data) {
  this.width = width || 0;
  this.height = height || 0;
  this.data = data || [];
  return this;
};

CV.grayscale = function(imageSrc, imageDst) {
  var dst, i, j, len, src;
  src = imageSrc.data;
  dst = imageDst.data;
  len = src.length;
  i = 0;
  j = 0;
  while (i < len) {
    dst[j++] = (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114 + 0.5) & 0xff;
    i += 4;
  }
  imageDst.width = imageSrc.width;
  imageDst.height = imageSrc.height;
  return imageDst;
};

CV.threshold = function(imageSrc, imageDst, threshold) {
  var dst, i, len, src, tab;
  src = imageSrc.data;
  dst = imageDst.data;
  len = src.length;
  tab = [];
  i = void 0;
  i = 0;
  while (i < 256) {
    tab[i] = (i <= threshold ? 0 : 255);
    ++i;
  }
  i = 0;
  while (i < len) {
    dst[i] = tab[src[i]];
    ++i;
  }
  imageDst.width = imageSrc.width;
  imageDst.height = imageSrc.height;
  return imageDst;
};

CV.adaptiveThreshold = function(imageSrc, imageDst, kernelSize, threshold) {
  var dst, i, len, src, tab;
  src = imageSrc.data;
  dst = imageDst.data;
  len = src.length;
  tab = [];
  i = void 0;
  CV.stackBoxBlur(imageSrc, imageDst, kernelSize);
  i = 0;
  while (i < 768) {
    tab[i] = (i - 255 <= -threshold ? 255 : 0);
    ++i;
  }
  i = 0;
  while (i < len) {
    dst[i] = tab[src[i] - dst[i] + 255];
    ++i;
  }
  imageDst.width = imageSrc.width;
  imageDst.height = imageSrc.height;
  return imageDst;
};

CV.otsu = function(imageSrc) {
  var between, hist, i, len, max, mu, src, sum, sumB, threshold, wB, wF;
  src = imageSrc.data;
  len = src.length;
  hist = [];
  threshold = 0;
  sum = 0;
  sumB = 0;
  wB = 0;
  wF = 0;
  max = 0;
  mu = void 0;
  between = void 0;
  i = void 0;
  i = 0;
  while (i < 256) {
    hist[i] = 0;
    ++i;
  }
  i = 0;
  while (i < len) {
    hist[src[i]]++;
    ++i;
  }
  i = 0;
  while (i < 256) {
    sum += hist[i] * i;
    ++i;
  }
  i = 0;
  while (i < 256) {
    wB += hist[i];
    if (0 !== wB) {
      wF = len - wB;
      if (0 === wF) {
        break;
      }
      sumB += hist[i] * i;
      mu = (sumB / wB) - ((sum - sumB) / wF);
      between = wB * wF * mu * mu;
      if (between > max) {
        max = between;
        threshold = i;
      }
    }
    ++i;
  }
  return threshold;
};

CV.stackBoxBlurMult = [1, 171, 205, 293, 57, 373, 79, 137, 241, 27, 391, 357, 41, 19, 283, 265];

CV.stackBoxBlurShift = [0, 9, 10, 11, 9, 12, 10, 11, 12, 9, 13, 13, 10, 9, 13, 13];

CV.BlurStack = function() {
  this.color = 0;
  return this.next = null;
};

CV.stackBoxBlur = function(imageSrc, imageDst, kernelSize) {
  var color, dst, height, heightMinus1, i, mult, p, pos, radius, shift, size, src, stack, stackStart, start, sum, width, widthMinus1, x, y;
  src = imageSrc.data;
  dst = imageDst.data;
  height = imageSrc.height;
  width = imageSrc.width;
  heightMinus1 = height - 1;
  widthMinus1 = width - 1;
  size = kernelSize + kernelSize + 1;
  radius = kernelSize + 1;
  mult = CV.stackBoxBlurMult[kernelSize];
  shift = CV.stackBoxBlurShift[kernelSize];
  stack = void 0;
  stackStart = void 0;
  color = void 0;
  sum = void 0;
  pos = void 0;
  start = void 0;
  p = void 0;
  x = void 0;
  y = void 0;
  i = void 0;
  stack = stackStart = new CV.BlurStack();
  i = 1;
  while (i < size) {
    stack = stack.next = new CV.BlurStack();
    ++i;
  }
  stack.next = stackStart;
  pos = 0;
  y = 0;
  while (y < height) {
    start = pos;
    color = src[pos];
    sum = radius * color;
    stack = stackStart;
    i = 0;
    while (i < radius) {
      stack.color = color;
      stack = stack.next;
      ++i;
    }
    i = 1;
    while (i < radius) {
      stack.color = src[pos + i];
      sum += stack.color;
      stack = stack.next;
      ++i;
    }
    stack = stackStart;
    x = 0;
    while (x < width) {
      dst[pos++] = (sum * mult) >>> shift;
      p = x + radius;
      p = start + (p < widthMinus1 ? p : widthMinus1);
      sum -= stack.color - src[p];
      stack.color = src[p];
      stack = stack.next;
      ++x;
    }
    ++y;
  }
  x = 0;
  while (x < width) {
    pos = x;
    start = pos + width;
    color = dst[pos];
    sum = radius * color;
    stack = stackStart;
    i = 0;
    while (i < radius) {
      stack.color = color;
      stack = stack.next;
      ++i;
    }
    i = 1;
    while (i < radius) {
      stack.color = dst[start];
      sum += stack.color;
      stack = stack.next;
      start += width;
      ++i;
    }
    stack = stackStart;
    y = 0;
    while (y < height) {
      dst[pos] = (sum * mult) >>> shift;
      p = y + radius;
      p = x + ((p < heightMinus1 ? p : heightMinus1) * width);
      sum -= stack.color - dst[p];
      stack.color = dst[p];
      stack = stack.next;
      pos += width;
      ++y;
    }
    ++x;
  }
  return imageDst;
};

CV.gaussianBlur = function(imageSrc, imageDst, imageMean, kernelSize) {
  var kernel;
  kernel = CV.gaussianKernel(kernelSize);
  imageDst.width = imageSrc.width;
  imageDst.height = imageSrc.height;
  imageMean.width = imageSrc.width;
  imageMean.height = imageSrc.height;
  CV.gaussianBlurFilter(imageSrc, imageMean, kernel, true);
  CV.gaussianBlurFilter(imageMean, imageDst, kernel, false);
  return imageDst;
};

CV.gaussianBlurFilter = function(imageSrc, imageDst, kernel, horizontal) {
  var cur, dst, height, i, j, k, limit, pos, src, value, width;
  src = imageSrc.data;
  dst = imageDst.data;
  height = imageSrc.height;
  width = imageSrc.width;
  pos = 0;
  limit = kernel.length >> 1;
  cur = void 0;
  value = void 0;
  i = void 0;
  j = void 0;
  k = void 0;
  i = 0;
  while (i < height) {
    j = 0;
    while (j < width) {
      value = 0.0;
      k = -limit;
      while (k <= limit) {
        if (horizontal) {
          cur = pos + k;
          if (j + k < 0) {
            cur = pos;
          } else {
            if (j + k >= width) {
              cur = pos;
            }
          }
        } else {
          cur = pos + (k * width);
          if (i + k < 0) {
            cur = pos;
          } else {
            if (i + k >= height) {
              cur = pos;
            }
          }
        }
        value += kernel[limit + k] * src[cur];
        ++k;
      }
      dst[pos++] = (horizontal ? value : (value + 0.5) & 0xff);
      ++j;
    }
    ++i;
  }
  return imageDst;
};

CV.gaussianKernel = function(kernelSize) {
  var center, i, kernel, scale2X, sigma, sum, tab, x;
  tab = [[1], [0.25, 0.5, 0.25], [0.0625, 0.25, 0.375, 0.25, 0.0625], [0.03125, 0.109375, 0.21875, 0.28125, 0.21875, 0.109375, 0.03125]];
  kernel = [];
  center = void 0;
  sigma = void 0;
  scale2X = void 0;
  sum = void 0;
  x = void 0;
  i = void 0;
  if ((kernelSize <= 7) && (kernelSize % 2 === 1)) {
    kernel = tab[kernelSize >> 1];
  } else {
    center = (kernelSize - 1.0) * 0.5;
    sigma = 0.8 + (0.3 * (center - 1.0));
    scale2X = -0.5 / (sigma * sigma);
    sum = 0.0;
    i = 0;
    while (i < kernelSize) {
      x = i - center;
      sum += kernel[i] = Math.exp(scale2X * x * x);
      ++i;
    }
    sum = 1 / sum;
    i = 0;
    while (i < kernelSize) {
      kernel[i] *= sum;
      ++i;
    }
  }
  return kernel;
};

CV.findContours = function(imageSrc, binary) {
  var contours, deltas, height, hole, i, j, nbd, outer, pix, pos, src, width;
  width = imageSrc.width;
  height = imageSrc.height;
  contours = [];
  src = void 0;
  deltas = void 0;
  pos = void 0;
  pix = void 0;
  nbd = void 0;
  outer = void 0;
  hole = void 0;
  i = void 0;
  j = void 0;
  src = CV.binaryBorder(imageSrc, binary);
  deltas = CV.neighborhoodDeltas(width + 2);
  pos = width + 3;
  nbd = 1;
  i = 0;
  while (i < height) {
    j = 0;
    while (j < width) {
      pix = src[pos];
      if (0 !== pix) {
        outer = hole = false;
        if (1 === pix && 0 === src[pos - 1]) {
          outer = true;
        } else {
          if (pix >= 1 && 0 === src[pos + 1]) {
            hole = true;
          }
        }
        if (outer || hole) {
          ++nbd;
          contours.push(CV.borderFollowing(src, pos, nbd, {
            x: j,
            y: i
          }, hole, deltas));
        }
      }
      ++j;
      ++pos;
    }
    ++i;
    pos += 2;
  }
  return contours;
};

CV.borderFollowing = function(src, pos, nbd, point, hole, deltas) {
  var contour, pos1, pos3, pos4, s, s_end, s_prev;
  contour = [];
  pos1 = void 0;
  pos3 = void 0;
  pos4 = void 0;
  s = void 0;
  s_end = void 0;
  s_prev = void 0;
  contour.hole = hole;
  s = s_end = (hole ? 0 : 4);
  while (true) {
    s = (s - 1) & 7;
    pos1 = pos + deltas[s];
    if (src[pos1] !== 0) {
      break;
    }
    if (s === s_end) {
      break;
    }
  }
  if (s === s_end) {
    src[pos] = -nbd;
    contour.push({
      x: point.x,
      y: point.y
    });
  } else {
    pos3 = pos;
    s_prev = s ^ 4;
    while (true) {
      s_end = s;
      while (true) {
        pos4 = pos3 + deltas[++s];
        if (src[pos4] !== 0) {
          break;
        }
      }
      s &= 7;
      if (((s - 1) >>> 0) < (s_end >>> 0)) {
        src[pos3] = -nbd;
      } else {
        if (src[pos3] === 1) {
          src[pos3] = nbd;
        }
      }
      contour.push({
        x: point.x,
        y: point.y
      });
      s_prev = s;
      point.x += CV.neighborhood[s][0];
      point.y += CV.neighborhood[s][1];
      if ((pos4 === pos) && (pos3 === pos1)) {
        break;
      }
      pos3 = pos4;
      s = (s + 4) & 7;
    }
  }
  return contour;
};

CV.neighborhood = [[1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]];

CV.neighborhoodDeltas = function(width) {
  var deltas, i, len;
  deltas = [];
  len = CV.neighborhood.length;
  i = 0;
  while (i < len) {
    deltas[i] = CV.neighborhood[i][0] + (CV.neighborhood[i][1] * width);
    ++i;
  }
  return deltas.concat(deltas);
};

CV.approxPolyDP = function(contour, epsilon) {
  var dist, dx, dy, end_pt, i, j, k, le_eps, len, max_dist, poly, pt, right_slice, slice, stack, start_pt;
  slice = {
    start_index: 0,
    end_index: 0
  };
  right_slice = {
    start_index: 0,
    end_index: 0
  };
  poly = [];
  stack = [];
  len = contour.length;
  pt = void 0;
  start_pt = void 0;
  end_pt = void 0;
  dist = void 0;
  max_dist = void 0;
  le_eps = void 0;
  dx = void 0;
  dy = void 0;
  i = void 0;
  j = void 0;
  k = void 0;
  epsilon *= epsilon;
  k = 0;
  i = 0;
  while (i < 3) {
    max_dist = 0;
    k = (k + right_slice.start_index) % len;
    start_pt = contour[k];
    if (++k === len) {
      k = 0;
    }
    j = 1;
    while (j < len) {
      pt = contour[k];
      if (++k === len) {
        k = 0;
      }
      dx = pt.x - start_pt.x;
      dy = pt.y - start_pt.y;
      dist = dx * dx + dy * dy;
      if (dist > max_dist) {
        max_dist = dist;
        right_slice.start_index = j;
      }
      ++j;
    }
    ++i;
  }
  if (max_dist <= epsilon) {
    poly.push({
      x: start_pt.x,
      y: start_pt.y
    });
  } else {
    slice.start_index = k;
    slice.end_index = (right_slice.start_index += slice.start_index);
    right_slice.start_index -= (right_slice.start_index >= len ? len : 0);
    right_slice.end_index = slice.start_index;
    if (right_slice.end_index < right_slice.start_index) {
      right_slice.end_index += len;
    }
    stack.push({
      start_index: right_slice.start_index,
      end_index: right_slice.end_index
    });
    stack.push({
      start_index: slice.start_index,
      end_index: slice.end_index
    });
  }
  while (stack.length !== 0) {
    slice = stack.pop();
    end_pt = contour[slice.end_index % len];
    start_pt = contour[k = slice.start_index % len];
    if (++k === len) {
      k = 0;
    }
    if (slice.end_index <= slice.start_index + 1) {
      le_eps = true;
    } else {
      max_dist = 0;
      dx = end_pt.x - start_pt.x;
      dy = end_pt.y - start_pt.y;
      i = slice.start_index + 1;
      while (i < slice.end_index) {
        pt = contour[k];
        if (++k === len) {
          k = 0;
        }
        dist = Math.abs((pt.y - start_pt.y) * dx - (pt.x - start_pt.x) * dy);
        if (dist > max_dist) {
          max_dist = dist;
          right_slice.start_index = i;
        }
        ++i;
      }
      le_eps = max_dist * max_dist <= epsilon * (dx * dx + dy * dy);
    }
    if (le_eps) {
      poly.push({
        x: start_pt.x,
        y: start_pt.y
      });
    } else {
      right_slice.end_index = slice.end_index;
      slice.end_index = right_slice.start_index;
      stack.push({
        start_index: right_slice.start_index,
        end_index: right_slice.end_index
      });
      stack.push({
        start_index: slice.start_index,
        end_index: slice.end_index
      });
    }
  }
  return poly;
};

CV.warp = function(imageSrc, imageDst, contour, warpSize) {
  var dst, dx1, dx2, dy1, dy2, height, i, j, m, p1, p2, p3, p4, pos, r, s, src, sx1, sx2, sy1, sy2, t, u, v, w, width, x, y;
  src = imageSrc.data;
  dst = imageDst.data;
  width = imageSrc.width;
  height = imageSrc.height;
  pos = 0;
  sx1 = void 0;
  sx2 = void 0;
  dx1 = void 0;
  dx2 = void 0;
  sy1 = void 0;
  sy2 = void 0;
  dy1 = void 0;
  dy2 = void 0;
  p1 = void 0;
  p2 = void 0;
  p3 = void 0;
  p4 = void 0;
  m = void 0;
  r = void 0;
  s = void 0;
  t = void 0;
  u = void 0;
  v = void 0;
  w = void 0;
  x = void 0;
  y = void 0;
  i = void 0;
  j = void 0;
  m = CV.getPerspectiveTransform(contour, warpSize - 1);
  r = m[8];
  s = m[2];
  t = m[5];
  i = 0;
  while (i < warpSize) {
    r += m[7];
    s += m[1];
    t += m[4];
    u = r;
    v = s;
    w = t;
    j = 0;
    while (j < warpSize) {
      u += m[6];
      v += m[0];
      w += m[3];
      x = v / u;
      y = w / u;
      sx1 = x >>> 0;
      sx2 = (sx1 === width - 1 ? sx1 : sx1 + 1);
      dx1 = x - sx1;
      dx2 = 1.0 - dx1;
      sy1 = y >>> 0;
      sy2 = (sy1 === height - 1 ? sy1 : sy1 + 1);
      dy1 = y - sy1;
      dy2 = 1.0 - dy1;
      p1 = p2 = sy1 * width;
      p3 = p4 = sy2 * width;
      dst[pos++] = (dy2 * (dx2 * src[p1 + sx1] + dx1 * src[p2 + sx2]) + dy1 * (dx2 * src[p3 + sx1] + dx1 * src[p4 + sx2])) & 0xff;
      ++j;
    }
    ++i;
  }
  imageDst.width = warpSize;
  imageDst.height = warpSize;
  return imageDst;
};

CV.getPerspectiveTransform = function(src, size) {
  var rq;
  rq = CV.square2quad(src);
  rq[0] /= size;
  rq[1] /= size;
  rq[3] /= size;
  rq[4] /= size;
  rq[6] /= size;
  rq[7] /= size;
  return rq;
};

CV.square2quad = function(src) {
  var den, dx1, dx2, dy1, dy2, px, py, sq;
  sq = [];
  px = void 0;
  py = void 0;
  dx1 = void 0;
  dx2 = void 0;
  dy1 = void 0;
  dy2 = void 0;
  den = void 0;
  px = src[0].x - src[1].x + src[2].x - src[3].x;
  py = src[0].y - src[1].y + src[2].y - src[3].y;
  if (0 === px && 0 === py) {
    sq[0] = src[1].x - src[0].x;
    sq[1] = src[2].x - src[1].x;
    sq[2] = src[0].x;
    sq[3] = src[1].y - src[0].y;
    sq[4] = src[2].y - src[1].y;
    sq[5] = src[0].y;
    sq[6] = 0;
    sq[7] = 0;
    sq[8] = 1;
  } else {
    dx1 = src[1].x - src[2].x;
    dx2 = src[3].x - src[2].x;
    dy1 = src[1].y - src[2].y;
    dy2 = src[3].y - src[2].y;
    den = dx1 * dy2 - dx2 * dy1;
    sq[6] = (px * dy2 - dx2 * py) / den;
    sq[7] = (dx1 * py - px * dy1) / den;
    sq[8] = 1;
    sq[0] = src[1].x - src[0].x + sq[6] * src[1].x;
    sq[1] = src[3].x - src[0].x + sq[7] * src[3].x;
    sq[2] = src[0].x;
    sq[3] = src[1].y - src[0].y + sq[6] * src[1].y;
    sq[4] = src[3].y - src[0].y + sq[7] * src[3].y;
    sq[5] = src[0].y;
  }
  return sq;
};

CV.isContourConvex = function(contour) {
  var convex, cur_pt, dx, dx0, dxdy0, dy, dy0, dydx0, i, j, len, orientation, prev_pt;
  orientation = 0;
  convex = true;
  len = contour.length;
  i = 0;
  j = 0;
  cur_pt = void 0;
  prev_pt = void 0;
  dxdy0 = void 0;
  dydx0 = void 0;
  dx0 = void 0;
  dy0 = void 0;
  dx = void 0;
  dy = void 0;
  prev_pt = contour[len - 1];
  cur_pt = contour[0];
  dx0 = cur_pt.x - prev_pt.x;
  dy0 = cur_pt.y - prev_pt.y;
  while (i < len) {
    if (++j === len) {
      j = 0;
    }
    prev_pt = cur_pt;
    cur_pt = contour[j];
    dx = cur_pt.x - prev_pt.x;
    dy = cur_pt.y - prev_pt.y;
    dxdy0 = dx * dy0;
    dydx0 = dy * dx0;
    orientation |= (dydx0 > dxdy0 ? 1 : (dydx0 < dxdy0 ? 2 : 3));
    if (3 === orientation) {
      convex = false;
      break;
    }
    dx0 = dx;
    dy0 = dy;
    ++i;
  }
  return convex;
};

CV.perimeter = function(poly) {
  var dx, dy, i, j, len, p;
  len = poly.length;
  i = 0;
  j = len - 1;
  p = 0.0;
  dx = void 0;
  dy = void 0;
  while (i < len) {
    dx = poly[i].x - poly[j].x;
    dy = poly[i].y - poly[j].y;
    p += Math.sqrt(dx * dx + dy * dy);
    j = i++;
  }
  return p;
};

CV.minEdgeLength = function(poly) {
  var d, dx, dy, i, j, len, min;
  len = poly.length;
  i = 0;
  j = len - 1;
  min = Infinity;
  d = void 0;
  dx = void 0;
  dy = void 0;
  while (i < len) {
    dx = poly[i].x - poly[j].x;
    dy = poly[i].y - poly[j].y;
    d = dx * dx + dy * dy;
    if (d < min) {
      min = d;
    }
    j = i++;
  }
  return Math.sqrt(min);
};

CV.countNonZero = function(imageSrc, square) {
  var height, i, j, nz, pos, span, src, width;
  src = imageSrc.data;
  height = square.height;
  width = square.width;
  pos = square.x + (square.y * imageSrc.width);
  span = imageSrc.width - width;
  nz = 0;
  i = void 0;
  j = void 0;
  i = 0;
  while (i < height) {
    j = 0;
    while (j < width) {
      if (0 !== src[pos++]) {
        ++nz;
      }
      ++j;
    }
    pos += span;
    ++i;
  }
  return nz;
};

CV.binaryBorder = function(imageSrc, dst) {
  var height, i, j, posDst, posSrc, src, width;
  src = imageSrc.data;
  height = imageSrc.height;
  width = imageSrc.width;
  posSrc = 0;
  posDst = 0;
  i = void 0;
  j = void 0;
  j = -2;
  while (j < width) {
    dst[posDst++] = 0;
    ++j;
  }
  i = 0;
  while (i < height) {
    dst[posDst++] = 0;
    j = 0;
    while (j < width) {
      dst[posDst++] = (0 === src[posSrc++] ? 0 : 1);
      ++j;
    }
    dst[posDst++] = 0;
    ++i;
  }
  j = -2;
  while (j < width) {
    dst[posDst++] = 0;
    ++j;
  }
  return dst;
};

AR = AR || {};

AR.Marker = function(id, corners) {
  this.id = id;
  this.corners = corners;
  return this;
};

AR.Detector = (function() {

  function Detector(minSize) {
    this.grey = new CV.Image();
    this.thres = new CV.Image();
    this.homography = new CV.Image();
    this.minSize = minSize;
    this.binary = [];
    this.contours = [];
    this.polys = [];
    this.candidates = [];
  }

  Detector.prototype.detect = function(image) {
    CV.grayscale(image, this.grey);
    CV.adaptiveThreshold(this.grey, this.thres, 2, 7);
    this.contours = CV.findContours(this.thres, this.binary);
    this.candidates = this.findCandidates(this.contours, this.minSize, 0.05, 10);
    this.candidates = this.clockwiseCorners(this.candidates);
    this.candidates = this.notTooNear(this.candidates, 10);
    return this.findMarkers(this.grey, this.candidates, 49);
  };

  Detector.prototype.findCandidates = function(contours, minSize, epsilon, minLength) {
    var candidates, contour, i, len, poly;
    candidates = [];
    len = contours.length;
    contour = void 0;
    poly = void 0;
    i = void 0;
    this.polys = [];
    i = 0;
    while (i < len) {
      contour = contours[i];
      if (contour.length >= minSize) {
        poly = CV.approxPolyDP(contour, contour.length * epsilon);
        this.polys.push(poly);
        if ((4 === poly.length) && (CV.isContourConvex(poly)) ? CV.minEdgeLength(poly) >= minLength : void 0) {
          candidates.push(poly);
        }
      }
      ++i;
    }
    return candidates;
  };

  Detector.prototype.clockwiseCorners = function(candidates) {
    var dx1, dx2, dy1, dy2, i, len, swap;
    len = candidates.length;
    dx1 = void 0;
    dx2 = void 0;
    dy1 = void 0;
    dy2 = void 0;
    swap = void 0;
    i = void 0;
    i = 0;
    while (i < len) {
      dx1 = candidates[i][1].x - candidates[i][0].x;
      dy1 = candidates[i][1].y - candidates[i][0].y;
      dx2 = candidates[i][2].x - candidates[i][0].x;
      dy2 = candidates[i][2].y - candidates[i][0].y;
      if ((dx1 * dy2 - dy1 * dx2) < 0) {
        swap = candidates[i][1];
        candidates[i][1] = candidates[i][3];
        candidates[i][3] = swap;
      }
      ++i;
    }
    return candidates;
  };

  Detector.prototype.notTooNear = function(candidates, minDist) {
    var dist, dx, dy, i, j, k, len, notTooNear;
    notTooNear = [];
    len = candidates.length;
    dist = void 0;
    dx = void 0;
    dy = void 0;
    i = void 0;
    j = void 0;
    k = void 0;
    i = 0;
    while (i < len) {
      j = i + 1;
      while (j < len) {
        dist = 0;
        k = 0;
        while (k < 4) {
          dx = candidates[i][k].x - candidates[j][k].x;
          dy = candidates[i][k].y - candidates[j][k].y;
          dist += dx * dx + dy * dy;
          ++k;
        }
        if ((dist / 4) < (minDist * minDist)) {
          if (CV.perimeter(candidates[i]) < CV.perimeter(candidates[j])) {
            candidates[i].tooNear = true;
          } else {
            candidates[j].tooNear = true;
          }
        }
        ++j;
      }
      ++i;
    }
    i = 0;
    while (i < len) {
      if (!candidates[i].tooNear) {
        notTooNear.push(candidates[i]);
      }
      ++i;
    }
    return notTooNear;
  };

  Detector.prototype.findMarkers = function(imageSrc, candidates, warpSize) {
    var candidate, i, len, marker, markers;
    markers = [];
    len = candidates.length;
    candidate = void 0;
    marker = void 0;
    i = void 0;
    i = 0;
    while (i < len) {
      candidate = candidates[i];
      CV.warp(imageSrc, this.homography, candidate, warpSize);
      CV.threshold(this.homography, this.homography, CV.otsu(this.homography));
      marker = this.getMarker(this.homography, candidate);
      if (marker) {
        markers.push(marker);
      }
      ++i;
    }
    return markers;
  };

  Detector.prototype.getMarker = function(imageSrc, candidate) {
    var bits, distances, i, inc, j, minZero, pair, rotations, square, width;
    width = (imageSrc.width / 7) >>> 0;
    minZero = (width * width) >> 1;
    bits = [];
    rotations = [];
    distances = [];
    square = void 0;
    pair = void 0;
    inc = void 0;
    i = void 0;
    j = void 0;
    i = 0;
    while (i < 7) {
      inc = (0 === i || 6 === i ? 1 : 6);
      j = 0;
      while (j < 7) {
        square = {
          x: j * width,
          y: i * width,
          width: width,
          height: width
        };
        if (CV.countNonZero(imageSrc, square) > minZero) {
          return null;
        }
        j += inc;
      }
      ++i;
    }
    i = 0;
    while (i < 5) {
      bits[i] = [];
      j = 0;
      while (j < 5) {
        square = {
          x: (j + 1) * width,
          y: (i + 1) * width,
          width: width,
          height: width
        };
        bits[i][j] = (CV.countNonZero(imageSrc, square) > minZero ? 1 : 0);
        ++j;
      }
      ++i;
    }
    rotations[0] = bits;
    distances[0] = this.hammingDistance(rotations[0]);
    pair = {
      first: distances[0],
      second: 0
    };
    i = 1;
    while (i < 4) {
      rotations[i] = this.rotate(rotations[i - 1]);
      distances[i] = this.hammingDistance(rotations[i]);
      if (distances[i] < pair.first) {
        pair.first = distances[i];
        pair.second = i;
      }
      ++i;
    }
    if (0 !== pair.first) {
      return null;
    }
    return new AR.Marker(this.mat2id(rotations[pair.second]), this.rotate2(candidate, 4 - pair.second));
  };

  Detector.prototype.hammingDistance = function(bits) {
    var dist, i, ids, j, k, minSum, sum;
    ids = [[1, 0, 0, 0, 0], [1, 0, 1, 1, 1], [0, 1, 0, 0, 1], [0, 1, 1, 1, 0]];
    dist = 0;
    sum = void 0;
    minSum = void 0;
    i = void 0;
    j = void 0;
    k = void 0;
    i = 0;
    while (i < 5) {
      minSum = Infinity;
      j = 0;
      while (j < 4) {
        sum = 0;
        k = 0;
        while (k < 5) {
          sum += (bits[i][k] === ids[j][k] ? 0 : 1);
          ++k;
        }
        if (sum < minSum) {
          minSum = sum;
        }
        ++j;
      }
      dist += minSum;
      ++i;
    }
    return dist;
  };

  Detector.prototype.mat2id = function(bits) {
    var i, id;
    id = 0;
    i = void 0;
    i = 0;
    while (i < 5) {
      id <<= 1;
      id |= bits[i][1];
      id <<= 1;
      id |= bits[i][3];
      ++i;
    }
    return id;
  };

  Detector.prototype.rotate = function(src) {
    var dst, i, j, len;
    dst = [];
    len = src.length;
    i = void 0;
    j = void 0;
    i = 0;
    while (i < len) {
      dst[i] = [];
      j = 0;
      while (j < src[i].length) {
        dst[i][j] = src[src[i].length - j - 1][i];
        ++j;
      }
      ++i;
    }
    return dst;
  };

  Detector.prototype.rotate2 = function(src, rotation) {
    var dst, i, len;
    dst = [];
    len = src.length;
    i = void 0;
    i = 0;
    while (i < len) {
      dst[i] = src[(rotation + i) % len];
      ++i;
    }
    return dst;
  };

  return Detector;

})();

module.exports = AR;

}});

window.require.define({"workers/imagefilters": function(exports, require, module) {
  var ImageFilters;

ImageFilters = {};

ImageFilters.utils = {
  clamp: function(value) {
    if (value > 255) {
      return 255;
    } else {
      if (value < 0) {
        return 0;
      } else {
        return value;
      }
    }
  },
  buildMap: function(f) {
    var k, m, v;
    m = [];
    k = 0;
    v = void 0;
    while (k < 256) {
      m[k] = ((v = f(k)) > 255 ? 255 : (v < 0 ? 0 : v | 0));
      k += 1;
    }
    return m;
  },
  applyMap: function(src, map) {
    var i, l, _results;
    i = 0;
    l = src.length;
    _results = [];
    while (i < l) {
      src[i] = map[src[i]];
      src[i + 1] = map[src[i + 1]];
      src[i + 2] = map[src[i + 2]];
      src[i + 3] = src[i + 3];
      _results.push(i += 4);
    }
    return _results;
  },
  mapRGB: function(src, func) {
    return this.applyMap(src, this.buildMap(func));
  },
  getPixelIndex: function(x, y, width, height, edge) {
    if (x < 0 || x >= width || y < 0 || y >= height) {
      switch (edge) {
        case 1:
          x = (x < 0 ? 0 : (x >= width ? width - 1 : x));
          y = (y < 0 ? 0 : (y >= height ? height - 1 : y));
          break;
        case 2:
          x = ((x %= width) < 0 ? x + width : x);
          y = ((y %= height) < 0 ? y + height : y);
          break;
        default:
          return null;
      }
    }
    return (y * width + x) << 2;
  },
  getPixel: function(src, x, y, width, height, edge) {
    var i;
    if (x < 0 || x >= width || y < 0 || y >= height) {
      switch (edge) {
        case 1:
          x = (x < 0 ? 0 : (x >= width ? width - 1 : x));
          y = (y < 0 ? 0 : (y >= height ? height - 1 : y));
          break;
        case 2:
          x = ((x %= width) < 0 ? x + width : x);
          y = ((y %= height) < 0 ? y + height : y);
          break;
        default:
          return 0;
      }
    }
    i = (y * width + x) << 2;
    return src[i + 3] << 24 | src[i] << 16 | src[i + 1] << 8 | src[i + 2];
  },
  getPixelByIndex: function(src, i) {
    return src[i + 3] << 24 | src[i] << 16 | src[i + 1] << 8 | src[i + 2];
  },
  /*
    @param r 0 <= n <= 255
    @param g 0 <= n <= 255
    @param b 0 <= n <= 255
    @return Array(h, s, l)
  */

  rgbToHsl: function(r, g, b) {
    var chroma, h, l, max, min, s;
    r /= 255;
    g /= 255;
    b /= 255;
    max = (r > g ? (r > b ? r : b) : (g > b ? g : b));
    min = (r < g ? (r < b ? r : b) : (g < b ? g : b));
    chroma = max - min;
    h = 0;
    s = 0;
    l = (min + max) / 2;
    if (chroma !== 0) {
      if (r === max) {
        h = (g - b) / chroma + (g < b ? 6 : 0);
      } else if (g === max) {
        h = (b - r) / chroma + 2;
      } else {
        h = (r - g) / chroma + 4;
      }
      h /= 6;
      s = (l > 0.5 ? chroma / (2 - max - min) : chroma / (max + min));
    }
    return [h, s, l];
  },
  /*
    @param h 0.0 <= n <= 1.0
    @param s 0.0 <= n <= 1.0
    @param l 0.0 <= n <= 1.0
    @return Array(r, g, b)
  */

  hslToRgb: function(h, s, l) {
    var b, g, hue, i, m1, m2, r, rgb, tmp;
    m1 = void 0;
    m2 = void 0;
    hue = void 0;
    r = void 0;
    g = void 0;
    b = void 0;
    rgb = [];
    if (s === 0) {
      r = g = b = l * 255 + 0.5 | 0;
      rgb = [r, g, b];
    } else {
      if (l <= 0.5) {
        m2 = l * (s + 1);
      } else {
        m2 = l + s - l * s;
      }
      m1 = l * 2 - m2;
      hue = h + 1 / 3;
      tmp = void 0;
      i = 0;
      while (i < 3) {
        if (hue < 0) {
          hue += 1;
        } else {
          if (hue > 1) {
            hue -= 1;
          }
        }
        if (6 * hue < 1) {
          tmp = m1 + (m2 - m1) * hue * 6;
        } else if (2 * hue < 1) {
          tmp = m2;
        } else if (3 * hue < 2) {
          tmp = m1 + (m2 - m1) * (2 / 3 - hue) * 6;
        } else {
          tmp = m1;
        }
        rgb[i] = tmp * 255 + 0.5 | 0;
        hue -= 1 / 3;
        i += 1;
      }
    }
    return rgb;
  }
};

ImageFilters.ConvolutionFilter = function(srcImageData, matrixX, matrixY, matrix, divisor, bias, preserveAlpha, clamp, color, alpha) {
  var a, b, clampA, clampB, clampG, clampR, col, colIndex, cols, g, index, m, mIndex, offset, p, r, replace, row, rowIndex, rows, srcHeight, srcLength, srcPixels, srcWidth, v, x, y;
  srcPixels = srcImageData.data;
  srcWidth = srcImageData.width;
  srcHeight = srcImageData.height;
  srcLength = srcPixels.length;
  divisor = divisor || 1;
  bias = bias || 0;
  (preserveAlpha !== false) && (preserveAlpha = true);
  (clamp !== false) && (clamp = true);
  color = color || 0;
  alpha = alpha || 0;
  index = 0;
  rows = matrixX >> 1;
  cols = matrixY >> 1;
  clampR = color >> 16 & 0xFF;
  clampG = color >> 8 & 0xFF;
  clampB = color & 0xFF;
  clampA = alpha * 0xFF;
  y = 0;
  while (y < srcHeight) {
    x = 0;
    while (x < srcWidth) {
      r = 0;
      g = 0;
      b = 0;
      a = 0;
      replace = false;
      mIndex = 0;
      v = void 0;
      row = -rows;
      while (row <= rows) {
        rowIndex = y + row;
        offset = void 0;
        if (0 <= rowIndex && rowIndex < srcHeight) {
          offset = rowIndex * srcWidth;
        } else if (clamp) {
          offset = y * srcWidth;
        } else {
          replace = true;
        }
        col = -cols;
        while (col <= cols) {
          m = matrix[mIndex++];
          if (m !== 0) {
            colIndex = x + col;
            if (!(0 <= colIndex && colIndex < srcWidth)) {
              if (clamp) {
                colIndex = x;
              } else {
                replace = true;
              }
            }
            if (replace) {
              r += m * clampR;
              g += m * clampG;
              b += m * clampB;
              a += m * clampA;
            } else {
              p = (offset + colIndex) << 2;
              r += m * srcPixels[p];
              g += m * srcPixels[p + 1];
              b += m * srcPixels[p + 2];
              a += m * srcPixels[p + 3];
            }
          }
          col += 1;
        }
        row += 1;
      }
      srcPixels[index] = ((v = r / divisor + bias) > 255 ? 255 : (v < 0 ? 0 : v | 0));
      srcPixels[index + 1] = ((v = g / divisor + bias) > 255 ? 255 : (v < 0 ? 0 : v | 0));
      srcPixels[index + 2] = ((v = b / divisor + bias) > 255 ? 255 : (v < 0 ? 0 : v | 0));
      srcPixels[index + 3] = (preserveAlpha ? srcPixels[index + 3] : ((v = a / divisor + bias) > 255 ? 255 : (v < 0 ? 0 : v | 0)));
      x += 1;
      index += 4;
    }
    y += 1;
  }
  return srcImageData;
};

/*
GIMP algorithm modified. pretty close to fireworks
@param brightness -100 <= n <= 100
@param contrast -100 <= n <= 100
*/


ImageFilters.BrightnessContrastGimp = function(srcImageData, brightness, contrast) {
  var avg, i, p4, srcHeight, srcLength, srcPixels, srcWidth;
  srcPixels = srcImageData.data;
  srcWidth = srcImageData.width;
  srcHeight = srcImageData.height;
  srcLength = srcPixels.length;
  p4 = Math.PI / 4;
  brightness /= 100;
  contrast *= 0.99;
  contrast /= 100;
  contrast = Math.tan((contrast + 1) * p4);
  avg = 0;
  i = 0;
  while (i < srcLength) {
    avg += (srcPixels[i] * 19595 + srcPixels[i + 1] * 38470 + srcPixels[i + 2] * 7471) >> 16;
    i += 4;
  }
  avg = avg / (srcLength / 4);
  this.utils.mapRGB(srcPixels, function(value) {
    if (brightness < 0) {
      value = value * (1 + brightness);
    } else {
      if (brightness > 0) {
        value = value + ((255 - value) * brightness);
      }
    }
    if (contrast !== 0) {
      value = (value - avg) * contrast + avg;
    }
    return value + 0.5 | 0;
  });
  return srcImageData;
};

/*
@param factor 1 <= n
*/


ImageFilters.Sharpen = function(srcImageData, factor) {
  return this.ConvolutionFilter(srcImageData, 3, 3, [-factor / 16, -factor / 8, -factor / 16, -factor / 8, factor * 0.75 + 1, -factor / 8, -factor / 16, -factor / 8, -factor / 16]);
};

module.exports = ImageFilters;

}});

self.onmessage = function(event) {
  if(event.data.event === 'start') {
    var Worker = global.require(event.data.data)
    new Worker(self);
  }
}

window.require.define({"workers/init": function(exports, require, module) {
  var AR, ImageFilters, Init, Marker,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ImageFilters = require('workers/imagefilters');

AR = require('workers/aruco');

Marker = require('workers/marker');

module.exports = Init = (function(_super) {

  __extends(Init, _super);

  function Init() {
    return Init.__super__.constructor.apply(this, arguments);
  }

  Init.prototype.initialize = function() {
    this.ready();
    this.detector = new AR.Detector(12);
    this.on('settings', function(settings) {
      var key, _results;
      _results = [];
      for (key in settings) {
        _results.push(this.settings[key] = settings[key]);
      }
      return _results;
    });
    this.on('set', function(setting) {
      return this.settings[setting.attribute] = setting.value;
    });
    return this.on('raw-image', function(data) {
      var img;
      this.busy();
      this.data = data;
      img = data.img;
      if (data.blend !== 1) {
        if (this.imageData.length > data.blend) {
          this.pimageData = [];
        }
        this.imageData.push(img);
        if (this.imageData.length === data.blend) {
          img = this.averageImageData();
          this.imageData.shift();
        }
      }
      if (data.brightness !== 0 || data.contrast !== 0) {
        img = ImageFilters.BrightnessContrastGimp(img, data.brightness, data.contrast);
      }
      if (data.sharpen !== 0) {
        img = ImageFilters.Sharpen(img, data.sharpen);
      }
      this.send('filtered-image', img);
      return this.detect(img);
    });
  };

  Init.prototype.detect = function(img) {
    var markers;
    markers = this.detector.detect(img);
    markers = markers.map(function(marker, index) {
      return new Marker(marker.id, marker.corners, index);
    });
    return this.interpret(markers);
  };

  Init.prototype.interpret = function(markers) {
    var candidate, candidates, current, lineStarter, lsSuccess, results, success, _i, _j, _k, _len, _len1, _len2;
    results = [];
    current = markers.filter(function(marker) {
      return marker.id === 0;
    });
    if (current.length === 0) {
      this.send('error', {
        msg: 'No start marker found!',
        markers: markers
      });
      return this.ready();
    } else if (current.length > 1) {
      this.send('error', {
        msg: 'Too many start markers visible',
        markers: markers
      });
      return this.ready;
    } else {
      current = current[0];
      current.colour = 'magenta';
      current.available = false;
      lineStarter = current;
      success = true;
      while (success) {
        success = false;
        if (current.contains(this.data.mousex, this.data.mousey)) {
          current.colour = 'cyan';
          current.highlightExtra = true;
        }
        current.radius = current.size * this.data.distanceLimit;
        candidates = markers.filter(function(marker) {
          return marker.available && marker.index !== current.index && current.lookAhead(marker.x, marker.y);
        });
        if (candidates.length !== 0) {
          for (_i = 0, _len = candidates.length; _i < _len; _i++) {
            candidate = candidates[_i];
            candidate.distanceFromCurrent = candidate.distanceFrom(current.x, current.y);
          }
          candidates.sort(this.sortByDistance);
          if (candidates[0].distanceFromCurrent <= current.radius) {
            results.push(candidates[0].id);
            current = candidates[0];
            current.colour = 'lime';
            current.available = false;
            success = true;
          }
        }
        if (success === false) {
          results.push(0);
          candidates = markers.filter(function(marker) {
            return marker.available && marker.index !== current.index && lineStarter.isAbove(marker.x, marker.y);
          });
          if (candidates.length !== 0) {
            for (_j = 0, _len1 = candidates.length; _j < _len1; _j++) {
              candidate = candidates[_j];
              candidate.distanceFromCurrent = lineStarter.distanceAbove(candidate.x, candidate.y);
            }
            candidates.sort(this.sortByDistance);
            if (candidates[0].distanceFromCurrent <= current.radius) {
              lsSuccess = true;
              current = candidates[0];
              while (lsSuccess) {
                lsSuccess = false;
                current.radius = current.size * this.distanceLimit;
                candidates = markers.filter(function(marker) {
                  return marker.available && marker.index !== current.index && current.lookBehind(marker.x, marker.y);
                });
                if (candidates.length !== 0) {
                  for (_k = 0, _len2 = candidates.length; _k < _len2; _k++) {
                    candidate = candidates[_k];
                    candidate.distanceFromCurrent = candidate.distanceFrom(current.x, current.y);
                  }
                  candidates.sort(this.sortByDistance);
                  if (candidates[0].distanceFromCurrent <= current.radius) {
                    lsSuccess = true;
                    current = candidates[0];
                  }
                } else {
                  lineStarter = current;
                }
              }
              results.push(current.id);
              current.colour = 'yellow';
              current.available = false;
              success = true;
            }
          }
        }
      }
      this.send('success', {
        results: results,
        markers: markers
      });
      return this.ready();
    }
  };

  Init.prototype.sortByDistance = function(a, b) {
    if (a.distanceFromCurrent < b.distanceFromCurrent) {
      return -1;
    } else if (a.distanceFromCurrent > b.distanceFromCurrent) {
      return 1;
    } else {
      return 0;
    }
  };

  Init.prototype.averageImageData = function() {
    var data, i, j, v, _i, _j, _ref, _ref1;
    data = this.imageData;
    for (i = _i = 0, _ref = data[0].data.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      v = 0;
      for (j = _j = 0, _ref1 = data.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        v += data[j].data[i];
      }
      v /= data.length;
      data[0].data[i] = Math.round(v);
    }
    return data[0];
  };

  Init.prototype.settings = {};

  Init.prototype.imageData = [];

  return Init;

})(require('workers/worker'));

}});

window.require.define({"workers/marker": function(exports, require, module) {
  var AR, Marker,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AR = require('workers/aruco');

module.exports = Marker = (function(_super) {

  __extends(Marker, _super);

  function Marker(id, corners, index) {
    var i, _i;
    this.id = id;
    this.corners = corners;
    this.index = index != null ? index : 1024;
    this.geom = [];
    for (i = _i = 0; _i <= 3; i = ++_i) {
      this.x += this.corners[i].x;
      this.y += this.corners[i].y;
      this.geom[i] = {};
      this.geom[i].m = (this.corners[i].y - this.corners[(i + 1) % 4].y) / (this.corners[i].x - this.corners[(i + 1) % 4].x);
      this.geom[i].c = this.corners[i].y - this.geom[i].m * this.corners[i].x;
    }
    this.x /= 4;
    this.y /= 4;
    this.size = Math.sqrt(Math.pow(this.corners[0].x - this.corners[2].x, 2) + Math.pow(this.corners[0].y - this.corners[2].y, 2));
    this.size += Math.sqrt(Math.pow(this.corners[1].x - this.corners[3].x, 2) + Math.pow(this.corners[1].y - this.corners[3].y, 2));
    this.size /= 2;
    this.colour = 'red';
    this.available = true;
  }

  Marker.prototype.distanceFrom = function(x, y) {
    return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
  };

  Marker.prototype.contains = function(x, y) {
    return this.pointInPolygon(this.corners, x, y);
  };

  Marker.prototype.lookAhead = function(x, y) {
    var g, p;
    if (!this.lookAheadPoints) {
      p = this.clone(this.corners);
      g = this.geom;
      if (g[0].m === Infinity || g[0].m === -Infinity) {
        p[1] = p[0].y < p[1].y ? 480 : 0;
      } else if (p[0].x < p[1].x) {
        p[1].x = 640;
        p[1].y = g[0].m * 640 + g[0].c;
      } else {
        p[1].x = 0;
        p[1].y = g[0].c;
      }
      if (g[2].m === Infinity || g[2].m === -Infinity) {
        p[2] = p[3].y < p[2].y ? 480 : 0;
      } else if (p[3].x < p[2].x) {
        p[2].x = 640;
        p[2].y = g[2].m * 640 + g[2].c;
      } else {
        p[2].x = 0;
        p[2].y = g[2].c;
      }
      this.lookAheadPoints = p;
    }
    return this.pointInPolygon(this.lookAheadPoints, x, y);
  };

  Marker.prototype.lookBehind = function(x, y) {
    var g, p;
    if (!this.lookBehindPoints) {
      p = this.clone(this.corners);
      g = this.geom;
      if (g[0].m === Infinity || g[0].m === -Infinity) {
        p[1] = p[0].y > p[1].y ? 480 : 0;
      } else if (p[0].x > p[1].x) {
        p[1].x = 640;
        p[1].y = g[0].m * 640 + g[0].c;
      } else {
        p[1].x = 0;
        p[1].y = g[0].c;
      }
      if (g[2].m === Infinity || g[2].m === -Infinity) {
        p[2] = p[3].y > p[2].y ? 480 : 0;
      } else if (p[3].x > p[2].x) {
        p[2].x = 640;
        p[2].y = g[2].m * 640 + g[2].c;
      } else {
        p[2].x = 0;
        p[2].y = g[2].c;
      }
      this.lookBehindPoints = p;
    }
    return this.pointInPolygon(this.lookBehindPoints, x, y);
  };

  Marker.prototype.isAbove = function(x, y) {
    var g, p;
    if (!this.isAbovePoints) {
      p = this.clone(this.corners);
      g = this.geom;
      if (g[0].m === Infinity || g[0].m === -Infinity) {
        if (p[0].y < p[1].y) {
          p[0].y = p[3].y = 0;
          p[1].y = p[2].y = 480;
          p[2].x = p[3].x = 640;
        } else {
          p[0].y = p[3].y = 480;
          p[1].y = p[2].y = p[2].x = p[3].x = 0;
        }
      } else if (p[0].x < p[1].x) {
        p[0].x = p[3].x = p[3].y = p[2].y = 0;
        p[0].y = g[0].c;
        p[1].x = p[2].x = 640;
        p[1].y = g[0].m * 640 + g[0].c;
      } else {
        p[0].x = p[3].x = 640;
        p[0].y = g[0].m * 640 + g[0].c;
        p[3].y = 480;
        p[1].x = p[2].x = 0;
        p[1].y = g[0].c;
        p[2].y = 480;
      }
      this.isAbovePoints = p;
    }
    return this.pointInPolygon(this.isAbovePoints, x, y);
  };

  Marker.prototype.distanceAbove = function(x, y) {
    var d, g;
    g = this.geom;
    d = Math.abs((g[0].m * x) - y + g[0].c);
    d /= Math.sqrt(g[0].m * g[0].m + 1);
    return d;
  };

  Marker.prototype.pointInPolygon = function(p, x, y) {
    var c, i, j, _i, _ref;
    c = false;
    for (i = _i = _ref = p.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
      j = (i + 1) % p.length;
      if ((((p[i].y <= y) && (y < p[j].y)) || ((p[j].y <= y) && (y < p[i].y))) && (x < (p[j].x - p[i].x) * (y - p[i].y) / (p[j].y - p[i].y) + p[i].x)) {
        c = !c;
      }
    }
    return c;
  };

  Marker.prototype.clone = function(obj) {
    var attr, copy, item;
    if (null === obj || "object" !== typeof obj) {
      return obj;
    }
    if (obj instanceof Array) {
      copy = [];
      copy = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = obj.length; _i < _len; _i++) {
          item = obj[_i];
          _results.push(this.clone(item));
        }
        return _results;
      }).call(this);
      return copy;
    }
    if (obj instanceof Object) {
      copy = {};
      for (attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = this.clone(obj[attr]);
        }
      }
      return copy;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
  };

  Marker.prototype.x = 0;

  Marker.prototype.y = 0;

  return Marker;

})(AR.Marker);

}});

window.require.define({"workers/worker": function(exports, require, module) {
  var Worker, eventSplitter;

eventSplitter = /\s+/;

module.exports = Worker = (function() {

  function Worker(slf) {
    var _ths;
    _ths = this;
    slf.onmessage = function(e) {
      return _ths.trigger(e.data.event, e.data.data);
    };
    this.send = function(event, data) {
      return slf.postMessage({
        event: event,
        data: data
      });
    };
    this.initialize();
  }

  Worker.prototype.initialize = function() {
    return null;
  };

  Worker.prototype.ready = function() {
    return this.send('WW_READY', true);
  };

  Worker.prototype.busy = function() {
    return this.send('WW_READY', false);
  };

  Worker.prototype.on = function(events, callback, context) {
    var calls, event, list;
    if (!callback) {
      return this;
    }
    events = events.split(eventSplitter);
    calls = this._callbacks || (this._callbacks = {});
    while (event = events.shift()) {
      list = calls[event] || (calls[event] = []);
      list.push(callback, context);
    }
    return this;
  };

  Worker.prototype.off = function(events, callback, context) {
    var calls, event, i, list;
    _.keys = Object.keys || function(obj) {
      var key, keys;
      if (obj !== Object(obj)) {
        throw new TypeError("Invalid object");
      }
      keys = [];
      for (key in obj) {
        if (_.has(obj, key)) {
          keys[keys.length] = key;
        }
      }
      return keys;
    };
    if (!(calls = this._callbacks)) {
      return this;
    }
    if (!(events || callback || context)) {
      delete this._callbacks;
      return this;
    }
    events = (events ? events.split(eventSplitter) : _.keys(calls));
    while (event = events.shift()) {
      if (!(list = calls[event]) || !(callback || context)) {
        delete calls[event];
        continue;
      }
      i = list.length - 2;
      while (i >= 0) {
        if (!(callback && list[i] !== callback || context && list[i + 1] !== context)) {
          list.splice(i, 2);
        }
        i -= 2;
      }
    }
    return this;
  };

  Worker.prototype.trigger = function(events) {
    var all, args, calls, event, i, length, list, rest;
    if (!(calls = this._callbacks)) {
      return this;
    }
    rest = [];
    events = events.split(eventSplitter);
    i = 1;
    length = arguments.length;
    while (i < length) {
      rest[i - 1] = arguments[i];
      i++;
    }
    while (event = events.shift()) {
      if (all = calls.all) {
        all = all.slice();
      }
      if (list = calls[event]) {
        list = list.slice();
      }
      if (list) {
        i = 0;
        length = list.length;
        while (i < length) {
          list[i].apply(list[i + 1] || this, rest);
          i += 2;
        }
      }
      if (all) {
        args = [event].concat(rest);
        i = 0;
        length = all.length;
        while (i < length) {
          all[i].apply(all[i + 1] || this, args);
          i += 2;
        }
      }
    }
    return this;
  };

  return Worker;

})();

}});

