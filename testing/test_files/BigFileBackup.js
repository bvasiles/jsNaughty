goog.provide("goog.graphics.VmlGraphics");

goog.require("goog.array");

goog.require("goog.dom");

goog.require("goog.events.EventHandler");

goog.require("goog.events.EventType");

goog.require("goog.graphics.AbstractGraphics");

goog.require("goog.graphics.Font");

goog.require("goog.graphics.LinearGradient");

goog.require("goog.graphics.SolidFill");

goog.require("goog.graphics.Stroke");

goog.require("goog.graphics.VmlEllipseElement");

goog.require("goog.graphics.VmlGroupElement");

goog.require("goog.graphics.VmlImageElement");

goog.require("goog.graphics.VmlPathElement");

goog.require("goog.graphics.VmlRectElement");

goog.require("goog.graphics.VmlTextElement");

goog.require("goog.math.Size");

goog.require("goog.string");

goog.require("goog.style");

goog.graphics.VmlGraphics = function(o, e, t, i, r) {
    goog.graphics.AbstractGraphics.call(this, o, e, t, i, r);
    this.handler_ = new goog.events.EventHandler(this);
};

goog.inherits(goog.graphics.VmlGraphics, goog.graphics.AbstractGraphics);

goog.graphics.VmlGraphics.VML_PREFIX_ = "g_vml_";

goog.graphics.VmlGraphics.VML_NS_ = "urn:schemas-microsoft-com:vml";

goog.graphics.VmlGraphics.VML_IMPORT_ = "#default#VML";

goog.graphics.VmlGraphics.IE8_MODE_ = document.documentMode && document.documentMode >= 8;

goog.graphics.VmlGraphics.COORD_MULTIPLIER = 100;

goog.graphics.VmlGraphics.toCssSize = function(o) {
    return goog.isString(o) && goog.string.endsWith(o, "%") ? o : parseFloat(o.toString()) + "px";
};

goog.graphics.VmlGraphics.toPosCoord = function(o) {
    return Math.round((parseFloat(o.toString()) - .5) * goog.graphics.VmlGraphics.COORD_MULTIPLIER);
};

goog.graphics.VmlGraphics.toPosPx = function(o) {
    return goog.graphics.VmlGraphics.toPosCoord(o) + "px";
};

goog.graphics.VmlGraphics.toSizeCoord = function(o) {
    return Math.round(parseFloat(o.toString()) * goog.graphics.VmlGraphics.COORD_MULTIPLIER);
};

goog.graphics.VmlGraphics.toSizePx = function(o) {
    return goog.graphics.VmlGraphics.toSizeCoord(o) + "px";
};

goog.graphics.VmlGraphics.setAttribute = function(o, e, t) {
    if (goog.graphics.VmlGraphics.IE8_MODE_) {
        o[e] = t;
    } else {
        o.setAttribute(e, t);
    }
};

goog.graphics.VmlGraphics.prototype.handler_;

goog.graphics.VmlGraphics.prototype.createVmlElement = function(o) {
    var e = this.dom_.createElement(goog.graphics.VmlGraphics.VML_PREFIX_ + ":" + o);
    e.id = goog.string.createUniqueString();
    return e;
};

goog.graphics.VmlGraphics.prototype.getVmlElement = function(o) {
    return this.dom_.getElement(o);
};

goog.graphics.VmlGraphics.prototype.updateGraphics_ = function() {
    if (goog.graphics.VmlGraphics.IE8_MODE_ && this.isInDocument()) {
        this.getElement().innerHTML = this.getElement().innerHTML;
    }
};

goog.graphics.VmlGraphics.prototype.append_ = function(o, e) {
    var t = e || this.canvasElement;
    t.getElement().appendChild(o.getElement());
    this.updateGraphics_();
};

goog.graphics.VmlGraphics.prototype.setElementFill = function(o, e) {
    var t = o.getElement();
    this.removeFill(t);
    if (e instanceof goog.graphics.SolidFill) {
        if (e.getColor() == "transparent") {
            t.filled = false;
        } else if (e.getOpacity() != 1) {
            t.filled = true;
            var i = this.createVmlElement("fill");
            i.opacity = Math.round(e.getOpacity() * 100) + "%";
            i.color = e.getColor();
            t.appendChild(i);
        } else {
            t.filled = true;
            t.fillcolor = e.getColor();
        }
    } else if (e instanceof goog.graphics.LinearGradient) {
        t.filled = true;
        var r = this.createVmlElement("fill");
        r.color = e.getColor1();
        r.color2 = e.getColor2();
        if (goog.isNumber(e.getOpacity1())) {
            r.opacity = e.getOpacity1();
        }
        if (goog.isNumber(e.getOpacity2())) {
            r.opacity2 = e.getOpacity2();
        }
        var g = goog.math.angle(e.getX1(), e.getY1(), e.getX2(), e.getY2());
        g = Math.round(goog.math.standardAngle(270 - g));
        r.angle = g;
        r.type = "gradient";
        t.appendChild(r);
    } else {
        t.filled = false;
    }
    this.updateGraphics_();
};

goog.graphics.VmlGraphics.prototype.setElementStroke = function(o, e) {
    var t = o.getElement();
    if (e) {
        t.stroked = true;
        var i = e.getWidth();
        if (goog.isString(i) && i.indexOf("px") == -1) {
            i = parseFloat(i);
        } else {
            i = i * this.getPixelScaleX();
        }
        var r = t.getElementsByTagName("stroke")[0];
        if (i < 1) {
            r = r || this.createVmlElement("stroke");
            r.opacity = i;
            r.weight = "1px";
            r.color = e.getColor();
            t.appendChild(r);
        } else {
            if (r) {
                t.removeChild(r);
            }
            t.strokecolor = e.getColor();
            t.strokeweight = i + "px";
        }
    } else {
        t.stroked = false;
    }
    this.updateGraphics_();
};

goog.graphics.VmlGraphics.prototype.setElementTransform = function(o, e, t, i, r, g) {
    var a = o.getElement();
    a.style.left = goog.graphics.VmlGraphics.toPosPx(e);
    a.style.top = goog.graphics.VmlGraphics.toPosPx(t);
    if (i || a.rotation) {
        a.rotation = i;
        a.coordsize = goog.graphics.VmlGraphics.toSizeCoord(r * 2) + " " + goog.graphics.VmlGraphics.toSizeCoord(g * 2);
    }
};

goog.graphics.VmlGraphics.prototype.removeFill = function(o) {
    o.fillcolor = "";
    var e = o.childNodes.length;
    for (var t = 0; t < o.childNodes.length; t++) {
        var i = o.childNodes[t];
        if (i.tagName == "fill") {
            o.removeChild(i);
        }
    }
};

goog.graphics.VmlGraphics.setPositionAndSize = function(o, e, t, i, r) {
    var g = o.style;
    g.position = "absolute";
    g.left = goog.graphics.VmlGraphics.toPosPx(e);
    g.top = goog.graphics.VmlGraphics.toPosPx(t);
    g.width = goog.graphics.VmlGraphics.toSizePx(i);
    g.height = goog.graphics.VmlGraphics.toSizePx(r);
    if (o.tagName == "shape") {
        o.coordsize = goog.graphics.VmlGraphics.toSizeCoord(i) + " " + goog.graphics.VmlGraphics.toSizeCoord(r);
    }
};

goog.graphics.VmlGraphics.prototype.createFullSizeElement_ = function(o) {
    var e = this.createVmlElement(o);
    var t = this.getCoordSize();
    goog.graphics.VmlGraphics.setPositionAndSize(e, 0, 0, t.width, t.height);
    return e;
};

try {
    eval("document.namespaces");
} catch (o) {}

goog.graphics.VmlGraphics.prototype.createDom = function() {
    var o = this.dom_.getDocument();
    if (!o.namespaces[goog.graphics.VmlGraphics.VML_PREFIX_]) {
        if (goog.graphics.VmlGraphics.IE8_MODE_) {
            o.namespaces.add(goog.graphics.VmlGraphics.VML_PREFIX_, goog.graphics.VmlGraphics.VML_NS_, goog.graphics.VmlGraphics.VML_IMPORT_);
        } else {
            o.namespaces.add(goog.graphics.VmlGraphics.VML_PREFIX_, goog.graphics.VmlGraphics.VML_NS_);
        }
        var e = o.createStyleSheet();
        e.cssText = goog.graphics.VmlGraphics.VML_PREFIX_ + "\\:*" + "{behavior:url(#default#VML)}";
    }
    var t = this.width;
    var i = this.height;
    var r = this.dom_.createDom("div", {
        style: "overflow:hidden;position:relative;width:" + goog.graphics.VmlGraphics.toCssSize(t) + ";height:" + goog.graphics.VmlGraphics.toCssSize(i)
    });
    this.setElementInternal(r);
    var g = this.createVmlElement("group");
    var a = g.style;
    a.position = "absolute";
    a.left = a.top = 0;
    a.width = this.width;
    a.height = this.height;
    if (this.coordWidth) {
        g.coordsize = goog.graphics.VmlGraphics.toSizeCoord(this.coordWidth) + " " + goog.graphics.VmlGraphics.toSizeCoord(this.coordHeight);
    } else {
        g.coordsize = goog.graphics.VmlGraphics.toSizeCoord(t) + " " + goog.graphics.VmlGraphics.toSizeCoord(i);
    }
    if (goog.isDef(this.coordLeft)) {
        g.coordorigin = goog.graphics.VmlGraphics.toSizeCoord(this.coordLeft) + " " + goog.graphics.VmlGraphics.toSizeCoord(this.coordTop);
    } else {
        g.coordorigin = "0 0";
    }
    r.appendChild(g);
    this.canvasElement = new goog.graphics.VmlGroupElement(g, this);
    goog.events.listen(r, goog.events.EventType.RESIZE, goog.bind(this.handleContainerResize_, this));
};

goog.graphics.VmlGraphics.prototype.handleContainerResize_ = function() {
    var o = goog.style.getSize(this.getElement());
    var e = this.canvasElement.getElement().style;
    if (o.width) {
        e.width = o.width + "px";
        e.height = o.height + "px";
    } else {
        var t = this.getElement();
        while (t && t.currentStyle && t.currentStyle.display != "none") {
            t = t.parentNode;
        }
        if (t && t.currentStyle) {
            this.handler_.listen(t, "propertychange", this.handleContainerResize_);
        }
    }
    this.dispatchEvent(goog.events.EventType.RESIZE);
};

goog.graphics.VmlGraphics.prototype.handlePropertyChange_ = function(o) {
    var e = o.getBrowserEvent().propertyName;
    if (e == "display" || e == "className") {
        this.handler_.unlisten(o.target, "propertychange", this.handlePropertyChange_);
        this.handleContainerResize_();
    }
};

goog.graphics.VmlGraphics.prototype.setCoordOrigin = function(o, e) {
    this.coordLeft = o;
    this.coordTop = e;
    this.canvasElement.getElement().coordorigin = goog.graphics.VmlGraphics.toSizeCoord(this.coordLeft) + " " + goog.graphics.VmlGraphics.toSizeCoord(this.coordTop);
};

goog.graphics.VmlGraphics.prototype.setCoordSize = function(o, e) {
    goog.graphics.VmlGraphics.superClass_.setCoordSize.apply(this, arguments);
    this.canvasElement.getElement().coordsize = goog.graphics.VmlGraphics.toSizeCoord(o) + " " + goog.graphics.VmlGraphics.toSizeCoord(e);
};

goog.graphics.VmlGraphics.prototype.setSize = function(o, e) {
    goog.style.setSize(this.getElement(), o, e);
};

goog.graphics.VmlGraphics.prototype.getPixelSize = function() {
    var o = this.getElement();
    return new goog.math.Size(o.style.pixelWidth || o.offsetWidth || 1, o.style.pixelHeight || o.offsetHeight || 1);
};

goog.graphics.VmlGraphics.prototype.clear = function() {
    this.canvasElement.clear();
};

goog.graphics.VmlGraphics.prototype.drawEllipse = function(o, e, t, i, r, g, a) {
    var s = this.createVmlElement("oval");
    goog.graphics.VmlGraphics.setPositionAndSize(s, o - t, e - i, t * 2, i * 2);
    var h = new goog.graphics.VmlEllipseElement(s, this, o, e, t, i, r, g);
    this.append_(h, a);
    return h;
};

goog.graphics.VmlGraphics.prototype.drawRect = function(o, e, t, i, r, g, a) {
    var s = this.createVmlElement("rect");
    goog.graphics.VmlGraphics.setPositionAndSize(s, o, e, t, i);
    var h = new goog.graphics.VmlRectElement(s, this, r, g);
    this.append_(h, a);
    return h;
};

goog.graphics.VmlGraphics.prototype.drawImage = function(o, e, t, i, r, g) {
    var a = this.createVmlElement("image");
    goog.graphics.VmlGraphics.setPositionAndSize(a, o, e, t, i);
    goog.graphics.VmlGraphics.setAttribute(a, "src", r);
    var s = new goog.graphics.VmlImageElement(a, this);
    this.append_(s, g);
    return s;
};

goog.graphics.VmlGraphics.prototype.drawTextOnLine = function(o, e, t, i, r, g, a, s, h, p) {
    var c = this.createFullSizeElement_("shape");
    var l = this.createVmlElement("path");
    var n = "M" + goog.graphics.VmlGraphics.toPosCoord(e) + "," + goog.graphics.VmlGraphics.toPosCoord(t) + "L" + goog.graphics.VmlGraphics.toPosCoord(i) + "," + goog.graphics.VmlGraphics.toPosCoord(r) + "E";
    goog.graphics.VmlGraphics.setAttribute(l, "v", n);
    goog.graphics.VmlGraphics.setAttribute(l, "textpathok", "true");
    var m = this.createVmlElement("textpath");
    m.setAttribute("on", "true");
    var d = m.style;
    d.fontSize = a.size * this.getPixelScaleX();
    d.fontFamily = a.family;
    if (g != null) {
        d["v-text-align"] = g;
    }
    if (a.bold) {
        d.fontWeight = "bold";
    }
    if (a.italic) {
        d.fontStyle = "italic";
    }
    goog.graphics.VmlGraphics.setAttribute(m, "string", o);
    c.appendChild(l);
    c.appendChild(m);
    var V = new goog.graphics.VmlTextElement(c, this, s, h);
    this.append_(V, p);
    return V;
};

goog.graphics.VmlGraphics.prototype.drawPath = function(o, e, t, i) {
    var r = this.createFullSizeElement_("shape");
    goog.graphics.VmlGraphics.setAttribute(r, "path", goog.graphics.VmlGraphics.getVmlPath(o));
    var g = new goog.graphics.VmlPathElement(r, this, e, t);
    this.append_(g, i);
    return g;
};

goog.graphics.VmlGraphics.getVmlPath = function(o) {
    var e = [];
    o.forEachSegment(function(o, t) {
        switch (o) {
          case goog.graphics.Path.Segment.MOVETO:
            e.push("m");
            Array.prototype.push.apply(e, goog.array.map(t, goog.graphics.VmlGraphics.toSizeCoord));
            break;

          case goog.graphics.Path.Segment.LINETO:
            e.push("l");
            Array.prototype.push.apply(e, goog.array.map(t, goog.graphics.VmlGraphics.toSizeCoord));
            break;

          case goog.graphics.Path.Segment.CURVETO:
            e.push("c");
            Array.prototype.push.apply(e, goog.array.map(t, goog.graphics.VmlGraphics.toSizeCoord));
            break;

          case goog.graphics.Path.Segment.CLOSE:
            e.push("x");
            break;

          case goog.graphics.Path.Segment.ARCTO:
            var i = t[2] + t[3];
            var r = goog.graphics.VmlGraphics.toSizeCoord(t[4] - goog.math.angleDx(i, t[0]));
            var g = goog.graphics.VmlGraphics.toSizeCoord(t[5] - goog.math.angleDy(i, t[1]));
            var a = goog.graphics.VmlGraphics.toSizeCoord(t[0]);
            var s = goog.graphics.VmlGraphics.toSizeCoord(t[1]);
            var h = Math.round(t[2] * -65536);
            var p = Math.round(t[3] * -65536);
            e.push("ae", r, g, a, s, h, p);
            break;
        }
    });
    return e.join(" ");
};

goog.graphics.VmlGraphics.prototype.createGroup = function(o) {
    var e = this.createFullSizeElement_("group");
    var t = o || this.canvasElement;
    t.getElement().appendChild(e);
    return new goog.graphics.VmlGroupElement(e, this);
};

goog.graphics.VmlGraphics.prototype.getTextWidth = function(o, e) {
    return 0;
};

goog.graphics.VmlGraphics.prototype.enterDocument = function() {
    goog.graphics.VmlGraphics.superClass_.enterDocument.call(this);
    this.handleContainerResize_();
    this.updateGraphics_();
};

goog.graphics.VmlGraphics.prototype.disposeInternal = function() {
    this.canvasElement = null;
    goog.graphics.VmlGraphics.superClass_.disposeInternal.call(this);
};
