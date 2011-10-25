(function() {
  /*!
  Copyright 2011 Gaetan Renaudeau
  
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  
  http://www.apache.org/licenses/LICENSE-2.0
  
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  */
  var Slider, SliderTransitionFunctions, SliderUtils, SliderWithCanvas, currentTime, mod, requestAnimationFrame, tmplSlider, tmplSliderWithCanvas;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  mod = function(X, Y) {
    return X - Y * Math.floor(X / Y);
  };
  requestAnimationFrame = function(a,b){while(a--&&!(b=window["oR0msR0mozR0webkitR0r".split(0)[a]+"equestAnimationFrame"]));return b||function(a){setTimeout(a,15)}}(5);
  currentTime = function(){return new Date().getTime()};
  tmplSlider = function(o) {
    var slider;
    slider = $("<div class=\"slider\">\n  <div class=\"loader\"><span class=\"spinner\"></span> Loading photos... (<span class=\"percent\">0</span>%)</div>\n  <div class=\"slide-images\"></div>\n  <div class=\"options\">\n    <a class=\"prevSlide\" href=\"javascript:;\">prev</a>\n    <span class=\"slide-pager\"></span>\n    <a class=\"nextSlide\" href=\"javascript:;\">next</a>\n  </div>\n</div>");
    slider.find('.slide-images').append($.map(o.slides, function(slide) {
      return $('<div class="slide-image">' + (slide.link ? '<a href="' + slide.link + '" target="_blank">' : '') + '<img src="' + slide.src + '">' + (slide.name ? '<span class="caption">' + slide.name + '</span>' : '') + (slide.link ? '</a>' : '') + '</div>')[0];
    }));
    slider.find('.slide-pager').append($.map(o.slides, function(slide, i) {
      return $('<a href="javascript:;">' + (i + 1) + '</a>')[0];
    }));
    return slider;
  };
  tmplSliderWithCanvas = function(o) {
    var node;
    node = tmplSlider(o);
    node.find('div.slide-images').append('<canvas class="slide-images" />');
    return node;
  };
  SliderUtils = {
    extractImageData: function(self, from, to) {
      var fromData, height, output, toData, width, _ref;
      _ref = self.canvas[0], width = _ref.width, height = _ref.height;
      self.clean();
      self.drawImage(self.images[from]);
      fromData = self.ctx.getImageData(0, 0, width, height);
      self.clean();
      self.drawImage(self.images[to]);
      toData = self.ctx.getImageData(0, 0, width, height);
      output = self.ctx.createImageData(width, height);
      return {
        fromData: fromData,
        toData: toData,
        output: output
      };
    },
    clippedTransition: function(clipFunction) {
      return function(self, from, to, progress) {
        var ctx, height, width, _ref;
        _ref = self.canvas[0], width = _ref.width, height = _ref.height;
        ctx = self.ctx;
        self.drawImage(self.images[from]);
        ctx.save();
        ctx.beginPath();
        clipFunction(ctx, width, height, progress);
        ctx.clip();
        self.drawImage(self.images[to]);
        return ctx.restore();
      };
    }
  };
  SliderTransitionFunctions = {
    clock: {
      render: SliderUtils.clippedTransition(function(ctx, w, h, p) {
        ctx.moveTo(w / 2, h / 2);
        return ctx.arc(w / 2, h / 2, Math.max(w, h), 0, Math.PI * 2 * p, false);
      })
    },
    circle: {
      render: SliderUtils.clippedTransition(function(ctx, w, h, p) {
        return ctx.arc(w / 2, h / 2, 0.6 * p * Math.max(w, h), 0, Math.PI * 2, false);
      })
    },
    circles: {
      render: SliderUtils.clippedTransition(function(ctx, w, h, p) {
        var circleH, circleW, circlesX, circlesY, cx, cy, radius, x, y, _results;
        circlesY = 6;
        circlesX = Math.floor(circlesY * w / h);
        circleW = w / circlesX;
        circleH = h / circlesY;
        radius = 0.7 * p * Math.max(circleW, circleH);
        _results = [];
        for (x = 0; 0 <= circlesX ? x <= circlesX : x >= circlesX; 0 <= circlesX ? x++ : x--) {
          _results.push((function() {
            var _results2;
            _results2 = [];
            for (y = 0; 0 <= circlesY ? y <= circlesY : y >= circlesY; 0 <= circlesY ? y++ : y--) {
              cx = (x + 0.5) * circleW;
              cy = (y + 0.5) * circleH;
              ctx.moveTo(cx, cy);
              _results2.push(ctx.arc(cx, cy, radius, 0, Math.PI * 2, false));
            }
            return _results2;
          })());
        }
        return _results;
      })
    },
    verticalOpen: {
      render: SliderUtils.clippedTransition(function(ctx, w, h, p) {
        return ctx.rect((1 - p) * w / 2, 0, w * p, h);
      })
    },
    horizontalOpen: {
      render: SliderUtils.clippedTransition(function(ctx, w, h, p) {
        return ctx.rect(0, (1 - p) * h / 2, w, h * p);
      })
    },
    sunblind: {
      render: SliderUtils.clippedTransition(function(ctx, w, h, p) {
        var blind, blindHeight, blinds, _results;
        p = 1 - (1 - p) * (1 - p);
        blinds = 6;
        blindHeight = h / blinds;
        _results = [];
        for (blind = 0; 0 <= blinds ? blind <= blinds : blind >= blinds; 0 <= blinds ? blind++ : blind--) {
          _results.push(ctx.rect(0, blindHeight * blind, w, blindHeight * p));
        }
        return _results;
      })
    },
    verticalSunblind: {
      render: SliderUtils.clippedTransition(function(ctx, w, h, p) {
        var blind, blindWidth, blinds, prog, _results;
        p = 1 - (1 - p) * (1 - p);
        blinds = 10;
        blindWidth = w / blinds;
        _results = [];
        for (blind = 0; 0 <= blinds ? blind <= blinds : blind >= blinds; 0 <= blinds ? blind++ : blind--) {
          prog = p;
          _results.push(ctx.rect(blindWidth * blind, 0, blindWidth * prog, h));
        }
        return _results;
      })
    },
    squares: {
      render: SliderUtils.clippedTransition(function(ctx, w, h, p) {
        var blindHeight, blindWidth, blindsX, blindsY, rh, rw, x, y, _results;
        p = 1 - (1 - p) * (1 - p);
        blindsY = 6;
        blindsX = Math.floor(blindsY * w / h);
        blindWidth = w / blindsX;
        blindHeight = h / blindsY;
        _results = [];
        for (x = 0; 0 <= blindsX ? x <= blindsX : x >= blindsX; 0 <= blindsX ? x++ : x--) {
          _results.push((function() {
            var _results2;
            _results2 = [];
            for (y = 0; 0 <= blindsY ? y <= blindsY : y >= blindsY; 0 <= blindsY ? y++ : y--) {
              rw = blindWidth * p;
              rh = blindHeight * p;
              _results2.push(ctx.rect(blindWidth * x - rw / 2, blindHeight * y - rh / 2, rw, rh));
            }
            return _results2;
          })());
        }
        return _results;
      })
    },
    fadeLeft: {
      init: function(self, from, to) {
        return SliderUtils.extractImageData(self, from, to);
      },
      render: function(self, from, to, progress, data) {
        var blur, ctx, fd, height, out, td, width, _ref;
        blur = 150;
        _ref = self.canvas[0], width = _ref.width, height = _ref.height;
        ctx = self.ctx;
        fd = data.fromData.data;
        td = data.toData.data;
        out = data.output.data;
        (function(){
       for (var x = 0; x < width; x += 1) {
         p1 = Math.min(Math.max(x-width*progress, 0), blur)/blur
         p2 = 1-p1
        for (var y = 0; y < height; y += 1) {
         var b = (y*width + x)*4
         for (var c = 0; c < 3; c += 1) {
           var i = b + c;
           out[i] = p1 * (fd[i] ) + p2 * (td[i] )
         }
         out[b + 3] = 255;
       }
     }
      }());
        return self.ctx.putImageData(data.output, 0, 0);
      }
    }
  };
  Slider = (function() {
    function Slider(container) {
      this.container = $(container);
    }
    Slider.prototype.current = 0;
    Slider.prototype.lastHumanNav = 0;
    Slider.prototype.duration = 4000;
    Slider.prototype.w = '640px';
    Slider.prototype.h = '430px';
    Slider.prototype.theme = 'theme-dark';
    Slider.prototype.tmpl = tmplSlider;
    Slider.prototype.circular = function(num) {
      return mod(num, this.slides.size());
    };
    Slider.prototype.slide = function(num) {
      if (num == null) {
        num = 0;
      }
      num = Math.max(0, Math.min(num, this.slides.size() - 1));
      if (this.slides && this.pages) {
        this.slides.eq(this.current).removeClass("current");
        this.slides.eq(num).addClass("current");
        this.pages.eq(this.current).removeClass("current");
        this.pages.eq(num).addClass("current");
      }
      this.current = num;
      return this;
    };
    Slider.prototype.next = function() {
      return this.slide(this.circular(this.current + 1));
    };
    Slider.prototype.prev = function() {
      return this.slide(this.circular(this.current - 1));
    };
    Slider.prototype.setDuration = function(duration) {
      this.duration = duration;
      return this;
    };
    Slider.prototype.setTransition = function(transition) {
      if (this.node) {
        if (this.transition) {
          this.node.removeClass(this.transition);
        }
        if (transition) {
          this.node.addClass(transition);
        }
      }
      this.transition = transition;
      return this;
    };
    Slider.prototype.setTheme = function(theme) {
      if (theme == null) {
        theme = "theme-dark";
      }
      if (this.node) {
        if (this.theme) {
          this.node.removeClass(this.theme);
        }
        if (theme) {
          this.node.addClass(theme);
        }
      }
      this.theme = theme;
      return this;
    };
    Slider.prototype.setSize = function(w, h) {
      this.w = w;
      this.h = h;
      if (this.node) {
        this.node.width(w);
        this.node.find(".slide-image").width(w);
        this.node.find(".slide-images").height(h);
      }
      return this;
    };
    Slider.prototype.fetchJson = function(url, options, transformer) {
      var params;
      params = $.extend({}, options);
      if (transformer == null) {
        transformer = function(json) {
          return json;
        };
      }
      $.getJSON(url, params, __bind(function(json) {
        return this.setPhotos(transformer(json));
      }, this));
      return this;
    };
    Slider.prototype._sync = function() {
      this.setTransition(this.transition);
      this.setTheme(this.theme);
      this.setSize(this.w, this.h);
      if (this.slides) {
        return this.slide(this.current);
      }
    };
    Slider.prototype.setPhotos = function(photos) {
      var imgs, nbLoad;
      this.photos = photos;
      this.node = this.tmpl({
        slides: photos
      }).addClass("loading");
      this.container.empty().append(this.node);
      this.current = 0;
      this._sync();
      nbLoad = 0;
      imgs = this.node.find(".slide-image img").bind("load", __bind(function() {
        var total;
        total = imgs.size();
        if (++nbLoad === total) {
          this.node.removeClass("loading");
          this.start();
        }
        return this.node.find(".loader .percent").text(Math.floor(100 * nbLoad / total));
      }, this));
      if (imgs.size() === 0) {
        this.node.find(".loader").text("No photo");
      }
      return this;
    };
    Slider.prototype.start = function() {
      this.slides = this.node.find(".slide-image");
      this.pages = this.node.find(".slide-pager a");
      this._sync();
      this._bind();
      return this;
    };
    Slider.prototype.stop = function() {
      this._unbind();
      return this;
    };
    Slider.prototype._bind = function() {
      var loop_, now, self;
      this._unbind();
      this.node.find(".prevSlide").click(__bind(function() {
        return this.prev();
      }, this));
      this.node.find(".nextSlide").click(__bind(function() {
        return this.next();
      }, this));
      self = this;
      this.node.find(".slide-pager a").each(function(i) {
        return $(this).click(function() {
          return self.slide(i);
        });
      });
      now = function() {
        return currentTime();
      };
      this.node.find(".options a").click(__bind(function() {
        return this.lastHumanNav = now();
      }, this));
      if (!this.timeout) {
        loop_ = __bind(function() {
          if (now() - this.lastHumanNav > 2000) {
            this.next();
          }
          return this.timeout = setTimeout(loop_, this.duration);
        }, this);
        this.timeout = setTimeout(loop_, this.duration);
      }
      return this;
    };
    Slider.prototype._unbind = function() {
      this.node.find(".prevSlide, .nextSlide, .slide-pager a, .options a").unbind('click');
      if (this.timeout) {
        clearTimeout(this.timeout);
        return this.timeout = null;
      }
    };
    return Slider;
  })();
  SliderWithCanvas = (function() {
    __extends(SliderWithCanvas, Slider);
    function SliderWithCanvas() {
      SliderWithCanvas.__super__.constructor.apply(this, arguments);
    }
    SliderWithCanvas.prototype.transitionFunction = SliderTransitionFunctions.clock;
    SliderWithCanvas.prototype.transitionDuration = 1000;
    SliderWithCanvas.prototype.tmpl = tmplSliderWithCanvas;
    SliderWithCanvas.prototype._sync = function() {
      var renderMode;
      renderMode = this.renderMode;
      SliderWithCanvas.__super__._sync.apply(this, arguments);
      return this.setRenderMode(renderMode);
    };
    SliderWithCanvas.prototype.start = function() {
      this.notCanvas = this.node.find('.slide-images:not(canvas) img');
      this.canvas = this.node.find('canvas.slide-images');
      this.ctx = this.canvas[0].getContext('2d');
      if (this.photos) {
        this.images = $.map(this.photos, (__bind(function(photo) {
          var img;
          img = new Image();
          img.src = photo.src;
          return img;
        }, this)));
      }
      return SliderWithCanvas.__super__.start.apply(this, arguments);
    };
    SliderWithCanvas.prototype.setSize = function(w, h) {
      SliderWithCanvas.__super__.setSize.call(this, w, h);
      if (this.canvas) {
        this.canvas.attr("height", h).attr("width", w);
      }
      return this;
    };
    SliderWithCanvas.prototype.setRenderMode = function(renderMode) {
      this.renderMode = renderMode;
      if (this.ctx) {
        if (this.renderMode === 'canvas') {
          this.drawImage(this.images[this.current]);
          this.notCanvas.hide();
          this.canvas.show();
        } else {
          this.canvas.hide();
          this.notCanvas.show();
        }
      }
      return this;
    };
    SliderWithCanvas.prototype.setTransition = function(transition) {
      this.setRenderMode('css');
      SliderWithCanvas.__super__.setTransition.call(this, transition);
      return this;
    };
    SliderWithCanvas.prototype.setTransitionFunction = function(transitionFunction) {
      this.transitionFunction = transitionFunction;
      this.setRenderMode('canvas');
      return this;
    };
    SliderWithCanvas.prototype.setTransitionDuration = function(transitionDuration) {
      this.transitionDuration = transitionDuration;
      this.setRenderMode('canvas');
      return this;
    };
    SliderWithCanvas.prototype.slide = function(num) {
      this.fromSlide = this.current;
      this.toSlide = num;
      this.transitionStart = currentTime();
      if (this.ctx && this.renderMode === 'canvas') {
        this.startRender();
      }
      return SliderWithCanvas.__super__.slide.call(this, num);
    };
    SliderWithCanvas.prototype.clean = function() {
      return this.ctx.clearRect(0, 0, this.canvas[0].width, this.canvas[0].height);
    };
    SliderWithCanvas.prototype.drawImage = function(img) {
      var height, width, _ref;
      _ref = this.canvas[0], width = _ref.width, height = _ref.height;
      return this.ctx.drawImage(img, 0, 0, width, width * img.height / img.width);
    };
    SliderWithCanvas.prototype._renderId = 0;
    SliderWithCanvas.prototype.startRender = function() {
      if (this.transitionFunction.init) {
        this.tfdata = this.transitionFunction.init(this, this.fromSlide, this.toSlide);
      }
      return this.render(++this._renderId);
    };
    SliderWithCanvas.prototype.render = function(id) {
      var now, progress;
      now = currentTime();
      if (id === this._renderId && now >= this.transitionStart) {
        progress = Math.min(1, (now - this.transitionStart) / this.transitionDuration);
        if (progress === 1) {
          this.clean();
          return this.drawImage(this.images[this.toSlide]);
        } else {
          this.transitionFunction.render(this, this.fromSlide, this.toSlide, progress, this.tfdata);
          return requestAnimationFrame((__bind(function() {
            return this.render(id);
          }, this)), this.canvas[0]);
        }
      }
    };
    return SliderWithCanvas;
  })();
  window.Slider = SliderWithCanvas;
  window.SliderTransitionFunctions = SliderTransitionFunctions;
  window.SliderUtils = SliderUtils;
}).call(this);
