elation.extend("spacecraft.heightmap", function(args) {
  this.init = function(args) {
    this.args = args || {};

    this.variance = this.args.variance || 255;
    this.callback = this.args.callback || false;

    if (this.args.src) {
      var img = new Image();
      (function(self) {
        img.onload = function() { self.loadImage(img); };
      })(this);
      img.src = this.args.src;
    }

/*
    document.body.appendChild(this.canvas);
    elation.events.add(this.canvas, "mousemove", this);
*/
  }
  this.loadImage = function(img) {
    this.canvas = document.createElement("CANVAS");
    this.width = this.canvas.width = img.width;
    this.height = this.canvas.height = img.height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.drawImage(img, 0, 0);
    this.imgdata = this.ctx.getImageData(0,0,img.width,img.height);

    if (this.callback) {
      if (typeof this.callback == 'function') {
        this.callback(); 
      } else if (this.callback.length == 2 && typeof this.callback[1] == 'function') {
        this.callback[1].call(this.callback[0]);
      }
    }
  }
  this.handleEvent = function(ev) {
    if (typeof this[ev.type] == 'function') this[ev.type](ev);
  }
  this.mousemove = function(ev) {
    var x = ev.pageX - ev.target.offsetLeft,
        y = ev.pageY - ev.target.offsetTop;
    console.log([x, y], this.getHeight(x, y));
  }
  this.setImageData = function(dim, imgdata) {
    this.width = dim[0];
    this.height = dim[1];
    this.imgdata = imgdata;
  }
  this.getHeight = function(x, y) {
    if (this.imgdata) {
      var px = Math.floor(x),
          py = Math.floor(y),
          u = x - px,
          v = y - py;


      var m = this.getPixelOffset(px, py);
      var pixels = [
        this.getPixelOffset(px-1, py-1), // top left
        this.getPixelOffset(px, py-1),   // top
        this.getPixelOffset(px+1, py-1), // top right
        this.getPixelOffset(px-1, py),   // left
        m,                                         // middle
        this.getPixelOffset(px+1, py),   // right
        this.getPixelOffset(px-1, py+1), // bottom left
        this.getPixelOffset(px, py+1),   // bottom
        this.getPixelOffset(px+1, py+1)  // bottom right
      ];

      var tl = this.interpolate(.5, .5, pixels[0], pixels[1], pixels[3], pixels[4]);
      var tr = this.interpolate(.5, .5, pixels[1], pixels[2], pixels[4], pixels[5]);
      var bl = this.interpolate(.5, .5, pixels[3], pixels[4], pixels[6], pixels[7]);
      var br = this.interpolate(.5, .5, pixels[4], pixels[5], pixels[7], pixels[8]);
      var t = (m + pixels[1]) / 2;
      var l = (m + pixels[3]) / 2;
      var r = (m + pixels[5]) / 2;
      var b = (m + pixels[7]) / 2;

      //var height = pixels[0];
      //var height = pixels[0] + (((pixels[2] - pixels[1]) * dx / 2) + ((pixels[4] - pixels[3]) * dy / 2)) / 2;
      //var height = pixels[0] + (((pixels[4] - pixels[3]) * dy / 2));
      var p1a = this.interpolate(u, v, tl, t, l, m);
      var p1b = this.interpolate(u, v, t, tr, m, r);
      var p1c = this.interpolate(u, v, l, m, bl, b);
      var p1d = this.interpolate(u, v, m, r, b, br);
      var height = this.interpolate(u, v, p1a, p1b, p1c, p1d);
//console.log(height);
if (isNaN(height)) height = 0;

      return height;
    }
    return 0;
  }
  this.getPixelOffset = function(x, y) {
    var offset = ((y * (this.imgdata.width * 4)) + (x * 4));
    return (this.imgdata.data[offset] / 255) * this.variance;
  }
  this.interpolate = function(u, v, a, b, c, d) {
    return ((1 - u) * (1 - v) * a) + (u * (1 - v) * b) + ((1 - u) * v * c) + (u * v * d);
  }
  this.latLonToHeight = function(lat, lon) {
    if (lat.length) {
      lon = lat[1];
      lat = lat[0];
    }

    //console.log(this.getHeight(Math.floor(this.width * ((lon + 180) / 360)), Math.floor(this.height * ((lat + 90) / 180))) * 0.00000005320731022175221);
//console.log('foo', this.getHeight(Math.floor(this.width * ((lon + 180) / 360)), Math.floor(this.height * ((lat + 90) / 180))));
    //return this.getHeight(Math.floor(this.width * ((lon + 180) / 360)), Math.floor(this.height * ((lat + 90) / 180))) * 50;
    return this.getHeight(this.width * ((lon + 180) / 360), this.height * ((lat + 90) / 180)) * this.variance;
  }
  this.init(args);
});
