joo.classLoader.prepare(




























"package com.bit101.components",




"public class ListItem extends com.bit101.components.Component",function($$l,$$private){var is=joo.is,assert=joo.assert,trace=joo.trace,$$bound=joo.boundMethod,$super=$$l+'super',$init=$$l+'init',$addChildren=$$l+'addChildren',$draw=$$l+'draw';return[function(){joo.classLoader.init(com.bit101.components.Label,String,flash.events.MouseEvent);},

"protected var",{_data: undefined},
"protected var",{_label: undefined},
"protected var",{_defaultColor:0xffffff},
"protected var",{_selectedColor:0xdddddd},
"protected var",{_rolloverColor:0xeeeeee},
"protected var",{_selected: undefined},
"protected var",{_mouseOver:false},








"public function ListItem",function(parent,xpos,ypos,data)
{if(arguments.length<4){if(arguments.length<3){if(arguments.length<2){if(arguments.length<1){parent=null;}xpos=0;}ypos=0;}data=null;}
this._data=data;
this[$super](parent,xpos,ypos);
},




"protected override function init",function()
{
this[$init]();
this.addEventListener(flash.events.MouseEvent.MOUSE_OVER,$$bound(this,"onMouseOver"));
this.setSize(100,20);
},




"protected override function addChildren",function()
{
this[$addChildren]();
this._label=new com.bit101.components.Label(this,5,0);
},








"public override function draw",function()
{
this[$draw]();
this.graphics.clear();
if(this._selected)
{
this.graphics.beginFill(this._selectedColor);
}
else if(this._mouseOver)
{
this.graphics.beginFill(this._rolloverColor);
}
else
{
this.graphics.beginFill(this._defaultColor);
}
this.graphics.drawRect(0,0,this.width,this.height);
this.graphics.endFill();
if(is(this._data,String))
{
this._label.text=this._data;
}
else if(is(this._data.label,String))
{
this._label.text=this._data.label;
}
else
{
this._label.text=this._data.toString();
}
},











"protected function onMouseOver",function(event)
{
this.addEventListener(flash.events.MouseEvent.MOUSE_OUT,$$bound(this,"onMouseOut"));
this._mouseOver=true;
this.invalidate();
},




"protected function onMouseOut",function(event)
{
this.removeEventListener(flash.events.MouseEvent.MOUSE_OUT,$$bound(this,"onMouseOut"));
this._mouseOver=false;
this.invalidate();
},










"public function set data",function(value)
{
this._data=value;
this.invalidate();
},
"public function get data",function()
{
return this._data;
},




"public function set selected",function(value)
{
this._selected=value;
this.invalidate();
},
"public function get selected",function()
{
return this._selected;
},




"public function set defaultColor",function(value)
{
this._defaultColor=value;
this.invalidate();
},
"public function get defaultColor",function()
{
return this._defaultColor;
},




"public function set selectedColor",function(value)
{
this._selectedColor=value;
this.invalidate();
},
"public function get selectedColor",function()
{
return this._selectedColor;
},




"public function set rolloverColor",function(value)
{
this._rolloverColor=value;
this.invalidate();
},
"public function get rolloverColor",function()
{
return this._rolloverColor;
},

];},[],["com.bit101.components.Component","flash.events.MouseEvent","com.bit101.components.Label","String"]
);