var uid = (function() { 
    var c = 1;
    return function uid() { 
        return c++;
    };
})();


function dashed_line(ctx, x1, y1, x2, y2) { 
    var g = 2, 
        s = true, 
        horiz,
        s1, s2;
    ctx.moveTo(x1, y1);

    if( x1 == x2 ) { 
        horiz = false;
    } else if( y1 == y2 ) { 
        horiz = true;
    } else {
        throw "cant draw bent lines!";
    }

    if( horiz ) { 
        for( var x = x1; x < x2; x+=g ) { 
            s = !s;
            if( s ) { 
                ctx.lineTo(x, y1);
            } else {
                ctx.moveTo(x, y1);
            }
        }
    } else {
        for( var y = y1; y < y2; y+=g ) { 
            s = !s;
            if( s ) { 
                ctx.lineTo(x1, y);
            } else {
                ctx.moveTo(x1, y);
            }
        }
    }
    ctx.stroke();
}


function Win(owner, opts) { 
    this.owner = owner;
    this.options = $.extend({}, Win.default_options, opts);
    this.options.id = this.options.id || uid();

    this.placed = false;

    var s = owner.options.size;

    this.element = ($('<div class="jsdesk-window-wrapper"><div class="jsdesk-window"/></div>')
        .attr({
            'data-jsd-id': this.options.id
        })
        .css({
            width:  s * this.options.width,
            height: s * this.options.height,
            left:   s * this.options.left,
            top:    s * this.options.top
        })
        .appendTo(owner.element)
    );
}

Win.default_options = {
    left: 0, 
    top: 0,
    width: 1,
    height: 1
}

Win.prototype.start_move = function() { 
    var self = this,
        $window = $(window),
        element = (this.element
            .addClass('moving')
        ),
        options = this.options,
        owner = this.owner,
        s = owner.options.size,
        nleft = this.options.left,
        ntop  = this.options.top,
        y,
        x;

    owner.state = states.MOVING;

    $.each(owner.windows, function(id, win) { 
        if( id == options.id ) { return; }
        win.options.orig_left = win.options.left;
        win.options.orig_top = win.options.top;
    });

    var handler = {
        mousemove: function(e) { 
            var nl = Math.floor(e.clientX / s),
                nt = Math.floor(e.clientY / s);
            if( nl === nleft && nt === ntop ) { return; }
    
            nleft = nl;
            ntop  = nt;

            $.each(owner.windows, function(id, win) { 
                if( win == self ) { return; } 
                if(    win.options.left !== win.options.orig_left
                    || win.options.top  !== win.options.orig_top ) { 

                    win.options.left = win.options.orig_left;
                    win.options.top = win.options.orig_top;
                    win.element.css({ 
                        left: win.options.left*s,
                        top:  win.options.top *s
                    });
                }
            });

            self.move_to(nleft, ntop);
        },
        mousedown: function(e) { 
            handler.jsdesk_abort_move();
            options.left = nleft;
            options.top  = ntop;
        },
        jsdesk_abort_move: function(e) { 
            $window.unbind(handler);
            element.removeClass('moving');
            self.placed = true;
            owner.state = states.NONE;
        }
    };

    $window.bind(handler);
};

Win.prototype.move_to = function(left, top, ctx) { 
    var self = this,
        o = this.options;
        
    if( ctx === undefined ) { 
        ctx = {
            recur: 0,
            done: {},
        };
    }

    if( ++ctx.recur > 100 ) { throw "its broken jim"; }
    //ctx.done[this.options.id] = true;

    o.left = left;
    o.top = top;

    this.element.css({
        left: left*this.owner.options.size,
        top:  top *this.owner.options.size
    });

    $.each(this.owner.windows, function(idx, win) {
        if( win === self ) /*ctx.done[win.options.id] )*/ { return; }
        var ow = win.options;
        if( left+o.width >= ow.left
         && left < ow.left+ow.width 
         && top+o.height >= ow.top
         && top < ow.top + ow.height ) { 
            //win.move_to( ow.left - (left - ow.left), ow.top - (top - ow.top), ctx );
            // this could surely be betterer.. but this works ok for the moment
            win.move_to(o.left+o.width, ow.top, ctx);
        }
    });
};

Win.prototype.remove = function() { 
    this.element.remove();
    delete this.owner.windows[this.options.id];
};

var states = {
    NONE: 0,
    MOVING: 1
}

$.widget('ui.jsdeskgrid', {
    options: {
        size: 100
    },

    _get_win_from_el: function(el) { 
        var jsdw = el.closest('.jsdesk-window-wrapper');
        if( !jsdw.length ) { throw "cant find jsdesk-window-wrapper"; }
        var id = jsdw.attr('data-jsd-id'),
            win = this.windows[id];
        if( !win ) { throw "cant find window with id '"+id+"'"; }
        return win;
    },

    _init: function() {
        var self = this, 
            o = this.options,
            hover_timer = null,
            $el = (this.element
                .delegate('.jsdesk-window-wrapper', 'jsdesk-move', function(e) { 
                    self._get_win_from_el($(this)).start_move();
                })
                .delegate('.jsdesk-window-wrapper', 'jsdesk-delete', function(e) { 
                    self._remove_win(self._get_win_from_el($(this)));
                })
            );

        this.state = states.NONE;

        this.windows = {};
        this.windows_arr = [];
        this._make_bg();

        if( o.window_options ) { 
            (o.window_options
                .hide()
                .mouseleave(function() { 
                    $(this).hide('fast');
                })
            );

            ($el
                .delegate('.jsdesk-window-wrapper:not(.moving)', 'mouseenter', function() { 
                    var $this = $(this);
                    if( hover_timer ) { 
                        clearTimeout(hover_timer);
                    }
                    if( self.state != states.NONE ) {
                        return;
                    }
                    setTimeout(function() { 
                        var win = self.windows[$this.attr('data-jsd-id')];
                        if( win === undefined ) { 
                            throw "cant find window!";
                        }
                        (o.window_options
                            .appendTo(win.element)
                            .show('fast')
                        );
                    }, 500);
                })
                .delegate('.jsdesk-window-wrapper:not(.moving)', 'mouseleave', function(e) { 
                    if( hover_timer ) { 
                        clearTimeout(hover_timer);
                    }
                    if( self.state != states.NONE ) {
                        return;
                    }
                    if( e.relatedTarget != o.window_options[0] && o.window_options.is(':visible') ) { 
                        o.window_options.hide('fast');
                    }
                })
            );
        }
    },

    _make_bg: function() { 
        var s = this.options.size,
            $canvas = ($('<canvas/>')
                .attr({
                    width: s,
                    height: s
                })
            ),
            canvas = $canvas[0],
            ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000';
        dashed_line(ctx, 0, 0, s, 0);
        dashed_line(ctx, 0, 0, 0, s);
        this.element.css({
            'background-image': 'url('+canvas.toDataURL()+')'
        });
    },

    new_window: function(opts, start_move) { 
        var win = new Win(this, opts);
        this.windows[win.options.id] = win;    
        this.windows_arr.push(win);
        if( start_move === undefined || start_move === true ) { 
            win.start_move();
        }
    },
    
    _remove_win: function(win) { 
        if( this.options.window_options ) { 
            this.options.window_options.detach();
        }
        win.remove();
    }
}); //widget
