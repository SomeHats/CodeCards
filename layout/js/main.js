$(function() {
  var $doc = $(document),
      $tmp = $('<div></div>'),
      Language = require('interpreter/language'),
      cards = [],
      words = {}, 
      images = {};

  window.imags = images;

  // SVG download links
  $doc.on('hover', '.svg', function() {
    $el = $(this);
    $svg = $el.find('svg');

    var wtmp = $svg.attr('width'),
        htmp = $svg.attr('height');

    $svg.attr({
      width: $('#size_w').val() + 'mm',
      height: $('#size_h').val() + 'mm'
    });

    if ($svg.length === 1) {
      var data = $el.html(),
          uri = "data:image/svg+xml;base64,";

      data = data.replace(/<glyph unicode="(.*)" d="/g, function(match, entity) {
        return '<glyph unicode="' + $tmp.text(entity).html() + '" d="';
      });

      data = data.replace('&nbsp;', ' ');

      data = base64_encode(data);

      $el.attr('href', uri + data);

      $svg.attr({
        width: wtmp,
        height: htmp
      });
    }
  });

  // Zoom pages
  $('#zoom').on('click', function() {$(document.body).toggleClass('zoom'); change();});

  $('.options input').on('change keyup', change);

  $('select').on('change click', function() {
    var wxh = $(this).val().split(' ');
    $('#size_w').val(wxh[0]);
    $('#size_h').val(wxh[1]);
    change();
  });

  $('#toggleWords').on('click', function() {
    $('#words').toggleClass('hidden');
  });

  $('#lang, #setall').on('change keyup', function() {
    var exists = true,
        lang

    // Check language exists
    try {
      require('data/languages/' + $('#lang').val() + '.lang');
    } catch (e) {
      exists = false;
    }

    if (exists) {
      tmp = {};
      tmp[$('#lang').val()] = '*';
      lang = new Language(tmp);
      words = lang.words;
      $('#notice').text(Object.keys(words).length + ' words');
      listWords(lang.words);
    } else {
      $('#notice').text('Not found');
      listWords(false);
    }
    change();
  }).trigger('change');

  change();

  function change() {
    var mm2i = 0.0393700787,
        $svgs = $('svg'),
        widthmm = $('#size_w').val(),
        heightmm = $('#size_h').val(),
        dpi = $('#dpi').val(),
        widthpx = Math.round(widthmm * mm2i * dpi),
        heightpx = Math.round(heightmm * mm2i * dpi),
        sf = ($(document.body).innerWidth() - 40) / widthpx,
        mm2px = mm2i * dpi,
        scroll = $(window).scrollTop();

    if($(document.body).hasClass('zoom')) {
      $svgs.attr({
        width: (widthpx * sf) - 40 + 'px',
        height: (heightpx * sf) - (40 * heightpx/widthpx) + 'px'
      });
    } else {
      $svgs.attr({
        width: (widthpx * sf) / 2 - 40 + 'px',
        height: (heightpx * sf) / 2 - (40 * heightpx/widthpx) + 'px'
      });
    }

    $svgs.each(function(i, el) {
      el.setAttribute('viewBox', '0 0 ' + widthpx + ' ' + heightpx);
    });

    draw(widthpx, heightpx, mm2px, 
      $('#card_h').val() * mm2px,
      $('#fontsize').val() * mm2px,
      $('#padding').val() * mm2px);

    $(window).scrollTop(scroll);
  }

  function listWords() {
    var $words = $('#words'), $el, word;
    if (words) {
      var dv = $('#setall').val();
      cards = [];
      $words.empty();
      for(key in words) {
        word = (typeof words[key] === 'string') ? words[key] : (words[key].print || words[key].word);
        $el = $('<label></label>');
        $el.html('<span>' + key + ': ' + word + '</span><input data-key="' + key + '" type="number" value="'+dv+'">');
        $el.appendTo($words);

        if (words[key].img) {
          var img = words[key].img;
          img = img.replace('http://', 'http://www.corsproxy.com/');
          if (!images[img]) {
            var image = new Image;
            image.crossOrigin = "Anonymous"
            $(image).on('load', function() {
              var canvas = document.createElement("canvas");
              canvas.width = this.width;
              canvas.height = this.height;

              var ctx = canvas.getContext("2d");
              ctx.drawImage(this, 0, 0);

              images[this.src] = {
                data: canvas.toDataURL("image/png"),
                width: this.width,
                height: this.height
              }
            });

            image.src = img;
          }
        }
        console.log(word);
        cards.push({
          id: key,
          display: word,
          img: (words[key].img ? img : null),
          n: dv,
          size: 1
        });

        $el.find('input').on('change keyup', function() {
          var $this = $(this),
              id=$this.data('key'),
              i;

          for (i = 0; i < cards.length; i++) {
            if(cards[i].id == id) {
              cards[i].n = parseInt($this.val());
              break;
            }
          }

          change();
        });
      }
    } else {
      $words.empty().text('No words available.');
    }
  }

  function draw(width, height, mm2px, cHeight, font, padding) {
    if (cHeight !== 0 && !isNaN(cHeight) &&
        font    !== 0 && !isNaN(font)    &&
        width   !== 0 && !isNaN(width)   &&
        height  !== 0 && !isNaN(height)  &&
        mm2px   !== 0 && !isNaN(mm2px)   &&
        !isNaN(padding)) {

      bleed = 4 * mm2px;

      $('.svg:not(#template)').remove();

      var layers = {
            guides: $('#guides_cb')[0].checked,
            front: $('#front_cb')[0].checked,
            back: $('#back_cb')[0].checked,
            print: $('#print_cb')[0].checked,
            cut: $('#cut_cb')[0].checked,
            images: $('#images_cb')[0].checked,
            blank: $('#blank_cb')[0].checked
          },
          $template = $('#template'),
          $cont = $('#cont'),
          binsPerPage = Math.floor((height - (bleed * 2))/ cHeight),
          bins = [],
          $svgs, $svg, tmp, i, j, k, needNewBin, pages,
          soFar, bin, $guides;

      // Update all sizes:
      for (id in cards) {
        cards[id].size = getSize(cards[id]);
      }

      // Sort cards
      cards.sort(function(a, b) {
        if (Math.round(a.size.w) !== Math.round(b.size.w)) {
          return b.size.w - a.size.w;
        } else if (a.display < b.display) {
          return 1;
        } else if (b.display < a.display) {
          return -1;
        } else {
          return 0;
        }
      });

      // Bin pack cards. 1st fit descending. Fuck yeah D1!
      for (i = 0; i < cards.length; i++) {
        for (j = 0; j < cards[i].n; j++) {
          if (cards[i].size.w > width - bleed * 4) {
            // Won't fit on a page.
            console.log(cards[i].display + ' is too big');
          } else {
            needNewBin = true;
            for (k = 0; k < bins.length; k++) {
              if (bins[k].remaining > cards[i].size.w) {
                needNewBin = false;
                bins[k].items.push(cards[i]);
                bins[k].remaining -= cards[i].size.w;
                break;
              }
            }

            if(needNewBin) {
              bins.push({
                remaining: width - (bleed * 4),
                items: []
              });

              // Force a loop of that same object
              j--;
            }
          }
        }
      }

      pages = Math.ceil(bins.length / binsPerPage);

      // Draw stuff.
      for(i = 0; i < pages; i++) {
        $svg = $template.clone()
          .appendTo($cont)
          .attr('id', 'page-' + i)
          .attr('download', 'cc-'+(layers.front?'front-':'back-')+(layers.print?'print-':'cut-')+'page-' + i + '.svg')
          .find('svg');

        $guides = $svg.find('.guides');

        for (j = 0; j < binsPerPage; j++) {
          soFar = bleed + padding / 3;
          if(bins[i * binsPerPage + j]) {
            bin = bins[i * binsPerPage + j].items;
            for(k = 0; k < bin.length; k++) {
              if(layers.front) {

                if(layers.print) {
                  if (layers.blank && bin[k].id != 0) {
                    littleText(bin[k].id, soFar, (j + 1) * cHeight + (bleed / 2), $svg);
                  } else {
                    if (layers.images && bin[k].img) {
                      image(bin[k], soFar, (j * cHeight) + bleed, $svg);
                    } else {
                      text(bin[k],
                        centerx(soFar, soFar - bin[k].size.w, bin[k].size.width), 
                        centery(j * cHeight + bleed, (j + 1) * cHeight + bleed, bin[k].size.h/2), $svg);
                    }
                  }
                }

                if (layers.cut) {
                  drawPuzzleConnector(soFar, j * cHeight + bleed, $svg);
                }

                soFar += bin[k].size.w;
                if (layers.cut && k === bin.length - 1) {
                  drawPuzzleConnector(soFar, j * cHeight + bleed, $svg);
                }

                if (layers.guides) {
                  c('line').attr({
                    x1: soFar,
                    x2: soFar,
                    y1: j * cHeight + bleed,
                    y2: (j + 1) * cHeight + bleed
                  }).appendTo($guides);
                }
              } else {
                if(layers.print) {
                  drawAruco(bin[k].id,
                    (soFar + soFar + bin[k].size.w) / 2,
                    (height - (j + 0.5) * cHeight) - bleed,
                    $svg);
                }

                if (layers.cut) {
                  drawPuzzleConnector(soFar, height - ((j + 1) * cHeight + bleed), $svg);
                }

                soFar += bin[k].size.w;
                if (layers.cut && k === bin.length - 1) {
                  drawPuzzleConnector(soFar, height - ((j + 1) * cHeight + bleed), $svg);
                }

                if (layers.guides) {
                  c('line').attr({
                    x1: soFar,
                    x2: soFar,
                    y1: (height - j * cHeight) - bleed,
                    y2: (height - (j + 1) * cHeight) - bleed
                  }).appendTo($guides);
                }
              }
            }
          }
        }
      }

      $svgs = $('.svg:not(#template)');

      if(layers.guides || layers.cut) {
        $svgs.each(function(i, el) {
          svg = $(el).find('svg');
          drawHorizontals(svg);
        });
      }

      function drawPuzzleConnector(x, y, svg) {
        x += padding / 8

        var path = '',
            p = {
              x1: x - (padding / 3),
              y1: y,
              x2: x - (padding / 3),
              y2: y + (cHeight / 3),
              x3: x + (padding / 5),
              y3: y + cHeight / 2,
              x4: x - (padding / 3),
              y4: y + (2 * cHeight / 3),
              x5: x - (padding / 3),
              y5: y + cHeight
            };

        path+=['M', p.x1, p.y1,

               'C', p.x1 - padding / 6, p.y1 + cHeight / 12,
                    p.x2 - padding / 8, p.y2 - cHeight / 12,
                    p.x2, p.y2,

               'C', p.x2 + padding / 3, p.y2 + cHeight / 9,
                    p.x3, p.y3 - cHeight / 3,
                    p.x3, p.y3,

               'C', p.x3, p.y3 + cHeight / 3,
                    p.x4 + padding / 3, p.y4 - cHeight / 9,
                    p.x4, p.y4,

               'C', p.x4 - padding / 8, p.y4 + cHeight / 12,
                    p.x5 - padding / 6, p.y5 - cHeight / 12,
                    p.x5, p.y5].join(' ');

        c('path').attr('d', path).appendTo(svg);
      }

      function drawHorizontals($el) {
        var i, line, rect, apt = (layers.guides) ? $el.find('.guides') : $el;
        if(layers.front) {
          for (i = bleed; i < height - bleed; i += cHeight) {
            line = c('line');
            line.attr({
              x1: 0,
              x2: width,
              y1: i,
              y2: i
            });

            line.appendTo(apt);
          }

          if (layers.guides) {
            rect = c('rect');
            rect.attr({
              x: 0,
              y: i - cHeight,
              width: width,
              height: height - (i - cHeight)
            });
            rect.appendTo(apt);
          }
        } else {
          for (i = height - bleed; i > 0; i -= cHeight) {
            line = c('line');
            line.attr({
              x1: 0,
              x2: width,
              y1: i,
              y2: i
            });

            line.appendTo(apt);
          }

          if (layers.guides) {
            rect = c('rect');
            rect.attr({
              x: 0,
              y: 0,
              width: width,
              height: cHeight + i
            });
            rect.appendTo(apt);
          }
        }
      }

      function getSize(card) {
        var $txt = c('text'),
            bbox, obj;

        if (layers.images && card.img) {
          var h = cHeight- padding / 3;
          obj = {height: h, h: h};
          obj.width = (h / images[card.img].height) * images[card.img].width;

          obj.w = obj.width + padding * 2
          obj.w = (obj.w < h) ? h : obj.w;
          return obj
        } else {
          var text = card.display;

          $txt.attr({
            x: 0,
            y: font,
            'font-size': font
          });

          $txt[0].textContent = text;

          $txt.appendTo($template.find('svg'));
          $template.css('display', 'block');
          bbox = $txt[0].getBBox();
          $template.css('display', '');
          $txt.remove();

          obj = {width: bbox.width + (padding * 2), h: bbox.height};

          obj.w = (obj.width < cHeight) ? cHeight : obj.width;

          return obj;
        }
      }

      function text(obj, x, y, $svg) {
        var $el = c('text');

        $el[0].textContent = obj.display;

        $el.attr({
          x: x + padding,
          y: y,
          'font-size': font
        });

        $el.appendTo($svg);
      }

      function littleText(str, x, y, $svg) {
        var $el = c('text');

        $el[0].textContent = str;
        $el.attr({
          x: x,
          y: y,
          'font-size': font / 5
        });

        $el.appendTo($svg);
      }

      function image(obj, x, y, $svg) {
        var $el = c('image');

        $el.attr({
          x: x + padding,
          y: y + padding / 6,
          width: obj.size.width,
          height: obj.size.height
        })

        $el[0].setAttributeNS('http://www.w3.org/1999/xlink', 'href', images[obj.img].data);

        $el.appendTo($svg);
      }

      function drawAruco(id, x, y, $svg) {
        var marker = getMarker(id),
            unit = cHeight / 20,
            top = y - (unit * 7),
            left = x - (unit * 7),
            i, j;

        for(i = 0; i < 7; i++) {
          for(j = 0; j < 7; j++) {
            if(marker[i][j] === 0) {
              c('rect').attr({
                y: top + (i * unit * 2),
                x: left + (j * unit * 2),
                width: unit * 2,
                height: unit * 2,
                class: 'aruco'
              }).appendTo($svg);
            }
          }
        }

        // From coffeescript source. See ../markers/src/
        function getMarker(id) {
          var i, out, slice, _i;
          id = parseInt(id);
          id = ('0000000000' + id.toString(2)).slice(-10);
          out = [];
          out.push([0, 0, 0, 0, 0, 0, 0]);
          for (i = _i = 0; _i <= 4; i = ++_i) {
            slice = id.slice(i * 2, (i + 1) * 2);
            switch (slice) {
              case '00':
                out.push([0, 1, 0, 0, 0, 0, 0]);
                break;
              case '01':
                out.push([0, 1, 0, 1, 1, 1, 0]);
                break;
              case '10':
                out.push([0, 0, 1, 0, 0, 1, 0]);
                break;
              case '11':
                out.push([0, 0, 1, 1, 1, 0, 0]);
            }
          }
          out.push([0, 0, 0, 0, 0, 0, 0])
          return out;
        }
      }

      function centery(min, max, mid) {
        return (min + (max - min) / 2) + (mid / 2);
      }
      function centerx(min, max, mid) {
        return (min + (min - max) / 2) - (mid / 2);
      }

      function c(name) {
        return $(document.createElementNS('http://www.w3.org/2000/svg', name));
      }

      function x(name) {
        return $(document.createElementNS('http://www.w3.org/1999/xlink', name));
      }
    }
  };
});