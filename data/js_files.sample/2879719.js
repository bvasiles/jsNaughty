// subset of moai

function to02x(i) {
    if(i<16) {
        return "0" + i.toString(16);
    } else {
        return i.toString(16);
    }
}

function Vec2(x,y) {
    this.x = x;
    this.y = y;
}

// 0 ~ 1
function Color(r,g,b,a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}
Color.prototype.toStyle = function() {
    var ri = parseInt(this.r * 255);
    var gi = parseInt(this.g * 255);
    var bi = parseInt(this.b * 255);
    var s = "#" + to02x(ri) + to02x(gi) + to02x(bi);
    return s;
}

function Texture() {
    this.img = null;
}
Texture.prototype.load = function(url) {
    this.img = new Image();
    this.img.onload = function() {
        this.ready = true;
        $(this.img).attr("image-rendering","-webkit-optimize-contrast");                    
        print("img onload:", url);
    }
    this.img.src = url;
}

function TileDeck() {
    this.tex = null;
    this.numgrid_x = this.numgrid_y = null;
    this.spritesize_x = this.spritesize_y = null;
    this.imagesize_x = this.imagesize_y = null;
}
TileDeck.prototype.setTexture = function(t) {
    this.tex = t;
}
TileDeck.prototype.setSize = function( numgrid_x, numgrid_y, spritesize_x, spritesize_y, imagesize_x, imagesize_y ) {
    this.numgrid_x = numgrid_x;
    this.numgrid_y = numgrid_y;
    this.spritesize_x = spritesize_x;
    this.spritesize_y = spritesize_y;
    this.imagesize_x = imagesize_x;
    this.imagesize_y = imagesize_y;
}
TileDeck.prototype.getCoords = function( ind ) {
    var col = ind % this.numgrid_x;
    var row = Math.floor( ind / this.numgrid_y );
    return {
        x0 : col * this.spritesize_x,
        y0 : row * this.spritesize_y,
        w : this.spritesize_x,
        h : this.spritesize_y
    };
}


function Grid() {
    this.deck = null;
    this.width = this.height = null;
    this.changed = false;
    this.buf = null;
    this.bufctx = null;    
}
Grid.prototype.setDeck = function(dk) { this.deck = dk; }
Grid.prototype.setSize = function(w,h) {
    this.width = w;
    this.height = h;
    this.tbl = new Array(h);
    for(var i=0;i<h;i++) {
        this.tbl[i] = new Array(w);
    }
}
Grid.prototype.set = function(x,y,ind) {
    if( x >= 0 && x < this.width && y >= 0 && y < this.height ) {
        this.tbl[Math.floor(y)][Math.floor(x)] = ind;
    }
    this.changed = true;
}
Grid.prototype.ensure = function( pixw, pixh ) {
    if( this.buf == null ) {
        this.buf = document.createElement("canvas");            
        this.buf.width = pixw * this.width;
        this.buf.height = pixh * this.height;
        this.bufctx = this.buf.getContext("2d");
    }
    if( this.changed ) {
        for(var y=0;y<this.height;y++) {
            for(var x=0;x<this.width;x++) {
                var ind = this.tbl[y][x];
                var coords = this.deck.getCoords(ind);
                this.bufctx.drawImage( this.deck.tex.img,
                                       coords.x0, coords.y0,
                                       coords.w, coords.h,
                                       x * pixw, y * pixh,
                                       pixw, pixh );
            }
        }
    }
    this.changed = false;
}
Grid.prototype.draw = function(ctx) {
    ctx.drawImage( this.buf, 0,0 );
}

function Animation() {
    this.keys = [0];
    this.loop = false;
    this.step_time = 0.016667;
    this.total_time = 0;
}
Animation.prototype.setKeys = function( step_time, inds ) {
    assert( inds instanceof Array );
    this.keys = inds;
    this.step_time = step_time;
    this.total_time = step_time * inds.length;
}
Animation.prototype.getIndex = function( t ) {
    if(t<0) t=0;
    var ind = Math.floor(t / this.step_time);
    assert(ind>=0);
    if(this.loop){
        return this.keys[ ind % this.keys.length ];
    } else {
        if( ind >= this.keys.length ) {
            return this.keys[ this.keys.length - 1 ];
        } else {
            return this.keys[ ind ];
        }
    }
}

var prop_idgen = 0;
function Prop() {
    prop_idgen ++;
    this.id = prop_idgen;
    this.parent_layer = null;
    this.accum_time = 0;
    this.tex = null;
    this.loc = new Vec2(0,0);
    this.scl = new Vec2(16,16);
    this.index = null;
    this.anim = null;
    this.rot = 0;
    this.grids = new Array();
    this.onUpdate = null;
}

Prop.prototype.setTexture = function(t) {
    this.tex = t;
}
Prop.prototype.setIndex = function(ind) {
    this.index = ind;
}
Prop.prototype.setDeck = function(dk) {
    this.deck = dk;
    this.index = 0;
}
Prop.prototype.setAnim = function(anm) {
    this.anim = anm;
}
Prop.prototype.setLoc = function(a,b) {
    if( b != null ) {
        this.loc.x = a;
        this.loc.y = b;
    } else {
        this.loc = a;
    }
}
Prop.prototype.setScl = function(a,b) {
    if( b != null ) {
        this.scl.x = a;
        this.scl.y = b;
    } else {
        this.scl = a;
    }
};
Prop.prototype.poll = function(dt) {
    this.accum_time += dt;
    var keep = true;
    if( this.onUpdate) keep = this.onUpdate.apply(this, [dt]);
    if(keep == false ) {
        this.parent_layer.removeProp(p);
        return;
    }
    if( this.anim ) {
        var ind = this.anim.getIndex(this.accum_time);
        this.setIndex( ind );
    }
}
Prop.prototype.addGrid = function(g) {
    this.grids.push(g);
}
// 右下が+X,+Y
Prop.prototype.render = function() {
    assert( this.parent_layer != null );
    
    var center_x = this.parent_moai.canvas.width/2;
    var center_y = this.parent_moai.canvas.height/2;

    var x = this.loc.x - this.parent_layer.camera.loc.x + center_x;
    var y = this.loc.y - this.parent_layer.camera.loc.y + center_y;

    var ctx = this.parent_moai.ctx;

    var x = Math.floor(x); 
    var y = Math.floor(y);
    ctx.translate(x,y);
    if( this.rot != 0 ) ctx.rotate(this.rot);

    if( this.deck ) {
        assert( this.deck.tex );
        var coords = this.deck.getCoords( this.index );        
        ctx.drawImage( this.deck.tex.img,
                       coords.x0, coords.y0,
                       coords.w, coords.h,
                       - this.scl.x/2, - this.scl.y/2,
                       this.scl.x, this.scl.y
                     );
    } else if( this.tex ){
        ctx.drawImage( this.tex.img,
                       0,0,
                       16,16,
                       - this.scl.x/2, - this.scl.y/2,
                       this.scl.x, this.scl.y
                     );
    }

    for(var i=0;i<this.grids.length;i++) {
        var grid = this.grids[i];
        grid.ensure( this.scl.x, this.scl.y );
        grid.draw(ctx)
    }

    if( this.rot != 0 ) ctx.rotate(-this.rot);
    ctx.translate(-x,-y);            
    //        print("render:", this.loc.x, this.loc.y, this.scl.x, this.scl.y, center_x, center_y );
}

function Camera () {
    Prop.call(this);
}
Camera.prototype.__proto__ = Prop.prototype;


function Layer() {
    var l = {};
    l.props = [];
    l.camera = null;
    l.parent_moai = null;
    l.insertProp = function(p) {
        assert( l.parent_moai != null );
        p.parent_layer = l;
        p.parent_moai = l.parent_moai;
        l.props.push(p);
    };
    l.removeProp = function(p) {
        var ind = l.props.indexOf(p);
        l.props.splice(ind,1);
    }
    l.setCamera = function(cam) {
        l.camera = cam;
    }
    l.poll = function(dt) {
        for(var i=0;i<l.props.length;i++) {
            var prop = l.props[i];
            prop.poll(dt);
        }
        return l.props.length;
    };
    l.render = function() {
        for(var i=0;i<l.props.length;i++) {
            var prop = l.props[i];
            prop.render();
        }
        return l.props.length;        
    };
    return l;
}


function SoundSystem() {
    try {
        this.ctx = new webkitAudioContext();
    } catch(e) {
        alert( "web audio api is not supported" );
    }
}

SoundSystem.prototype.newSound = function(url) {
    var snd = {};
    var req = new XMLHttpRequest();
    snd.req = req;
    
    req.open( "GET", url, true );
    req.responseType = "arraybuffer";

    var sndsys = this;
    req.onload = function() {
        sndsys.ctx.decodeAudioData( req.response, function(buffer) {
            snd.buffer = buffer;
            print("newSound onload", url );

            snd.play = function(vol) {
                if( vol == null ) vol = 1;

                var source = snd.parent.ctx.createBufferSource() ;
                source.buffer = snd.buffer;
                
                var gain_node = snd.parent.ctx.createGainNode();
                source.connect(gain_node);
                gain_node.connect( snd.parent.ctx.destination);
                gain_node.gain.value = vol;

                source.noteOn(0);

                snd.source = source;
                snd.gain_node = gain_node;
                
            };
            
            
        }, function(e){ print(e); } );
    }
    req.send();
    snd.parent = this;

    return snd;
}

//////////////

function MoaiJS() {
}
MoaiJS.prototype.setCanvas = function( canvas ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;        
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.layers = [];
    this.clear_color = new Color(0,0,0,1);
    this.accum_time = 0;    
}
MoaiJS.prototype.setClearColor = function( c ) {
    this.clear_color = c;
};
MoaiJS.prototype.insertLayer = function( l ) {
    l.parent_moai = this;
    this.layers.push(l);
}
MoaiJS.prototype.poll = function( dt ) {
    this.accum_time += dt;
    var tot=0;
    for(var i=0;i<this.layers.length;i++) {
        var layer = this.layers[i];
        tot+=layer.poll(dt);
    }
    return tot;
};
MoaiJS.prototype.render = function() {
    this.ctx.fillStyle = this.clear_color.toStyle();
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    var tot=0;
    for(var i=0;i<this.layers.length;i++) {
        var layer = this.layers[i];
        tot+=layer.render();
    }
    return tot;
};




