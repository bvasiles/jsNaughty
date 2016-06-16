/**
This notice must be untouched at all times.
This is the COMPRESSED version of Draw2D
WebSite: http://www.draw2d.org
Copyright: 2006 Andreas Herz. All rights reserved.
Created: 5.11.2006 by Andreas Herz (Web: http://www.freegroup.de )
LICENSE: LGPL
**/

Oval=function(){VectorFigure.call(this);};Oval.prototype=new VectorFigure();Oval.prototype.type="Oval";Oval.prototype.paint=function(){if(this.html===null){return;}try{VectorFigure.prototype.paint.call(this);this.graphics.setStroke(this.stroke);if(this.bgColor!==null){this.graphics.setColor(this.bgColor.getHTMLStyle());this.graphics.fillOval(0,0,this.getWidth()-1,this.getHeight()-1);}if(this.lineColor!==null){this.graphics.setColor(this.lineColor.getHTMLStyle());this.graphics.drawOval(0,0,this.getWidth()-1,this.getHeight()-1);}this.graphics.paint();}catch(e){pushErrorStack(e,"Oval.prototype.paint=function()");}};