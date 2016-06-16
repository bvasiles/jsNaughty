/*
Copyright DHTMLX LTD. http://www.dhtmlx.com
To use this component please contact sales@dhtmlx.com to obtain license
*/

if (window.dhtmlXMenuObject){


/**
*   @desc: set right-to-left mode
*   @param: state - true|false
*   @type: public
*/
dhtmlXMenuObject.prototype.setRTL = function(state) {
	if (this._rtl == state) return;
	// this.setAlign("left");
	this._rtl = state;
	// toplevel
	if (!this.context && this.base != null) {
		this.base.className = "dhtmlxMenu_"+this.skin+"_Middle "+(this._rtl?"dir_right":"dir_left");
	}
	// subpolygons
	for (var a in this.idPull) {
		if (String(a).search("polygon_") == 0) this.idPull[a].className = "dhtmlxMenu_"+this.skin+"_SubLevelArea_Polygon "+(this._rtl?"dir_right":"");
	}
	// complex arrows
	for (var a in this.itemPull) {
		// swap icons with text
		if (this.idPull[a] != null) {
			if (this.itemPull[a]["parent"] == this.idPrefix+this.topId) {
				if (this.idPull[a].childNodes.length == 2) {
					var t = this.idPull[a].childNodes[0];
					this.idPull[a].appendChild(t);
					t = null;
				}
			} else {
				if (this.idPull[a].childNodes.length == 3) {
					var t1 = (this.idPull[a].childNodes[0].childNodes[0]||null);
					var t2 = (this.idPull[a].childNodes[2].childNodes[0]||null);
					if (t1 != null) this.idPull[a].childNodes[2].appendChild(t1);
					if (t2 != null) this.idPull[a].childNodes[0].appendChild(t2);
					var p = this.idPull[a].childNodes[0].className;
					this.idPull[a].childNodes[0].className = this.idPull[a].childNodes[2].className;
					this.idPull[a].childNodes[2].className = p;
					
				}
			}
		}
		if (this.itemPull[a]["complex"]) { this._updateItemComplexState(a, true, false); }
	}
	// top level text
	if (this._topText != null) { this._topText.className = "dhtmlxMenu_TopLevel_Text_"+(this._rtl?"left":"right"); }
	// change sublevel open type
	this.dirSubLevel = (this._rtl?"left":"right");
}

};



if (window.dhtmlXToolbarObject){

/* dhtmlxToolbar RTL extension */
dhtmlXToolbarObject.prototype.setRTL = function(mode) {
	if (!this.rtl) this.rtl = false;
	if (mode == this.rtl) return;
	this.rtl = (mode==true?true:false);
	this.cont.className = "dhx_toolbar_base_"+this.skin+(this.rtl?" rtl":"");
	this.base.className = (this.rtl?"float_right":"float_left");
	for (var a in this.objPull) {
		var item = this.objPull[a];
		if (item["type"] == "buttonSelect") {
			item.polygon.className = "dhx_toolbar_poly_"+this.skin+(this.rtl?" rtl":"");
			for (var a in item._listOptions) {
				var p = item._listOptions[a];
				if (p.td_a != null && p.td_b != null) {
					var a = (p.td_a.childNodes[0]||null);
					var b = (p.td_b.childNodes[0]||null);
					while (p.td_a.childNodes.length > 0) p.td_a.removeChild(p.td_a.childNodes[0]);
					while (p.td_b.childNodes.length > 0) p.td_b.removeChild(p.td_b.childNodes[0]);
					if (b != null) p.td_a.appendChild(b);
					if (a != null) p.td_b.appendChild(a);
					var t = p.td_a.className;
					p.td_a.className = p.td_b.className;
					p.td_b.className = t;
				}
				p = null;
			}
		}
		if (item["type"] == "slider") item.label.className = className = "dhx_toolbar_slider_label_"+this.skin+(this.rtl?"_rtl":"");
		//
		if (item.type == "button" || item.type == "buttonSelect" || item.type == "buttonTwoState") {
			if (item.obj.childNodes.length > 1) {
				var img = null;
				for (var q=0; q<item.obj.childNodes.length; q++) if (item.obj.childNodes[q].tagName != null) if (String(item.obj.childNodes[q].tagName).toLowerCase() == "img") img = item.obj.childNodes[q]; 
				if (img != null) if (this.rtl == true) item.obj.appendChild(img); else item.obj.insertBefore(img, item.obj.childNodes[0]);
			}
		}
	}
}
dhtmlXToolbarObject.prototype._rtlParseBtn = function(t1, t2) {
	return (this.rtl?t2+t1:t1+t2);
}

};



if (window.dhtmlXWindows){

dhtmlXWindows.prototype.setRTL = function(state) {
	if (!this._r) this._r = false;
	if (state == this._r) return;
	this._r = (state===true?true:false);
	this.vp.className = "dhtmlx_winviewport dhtmlx_skin_"+this.skin+(this._r?" dhx_wins_rtl":"");
};

};


if (window.dhtmlXLayoutObject){
	
dhtmlXLayoutObject.prototype.setRTL = function(state) {
	if (!this._r) this._r = false;
	if (state == this._r) return;
	this._r = (state===true?true:false);
	this.tpl.className = "dhtmlxLayoutPolyContainer_"+this.skin+(this._r?" dhxlayout_rtl":"");
};

};


if (window.dhtmlXAccordion){
	
dhtmlXAccordion.prototype.setRTL = function(state) {
	if (!this._r) this._r = false;
	if (state == this._r) return;
	this._r = (state===true?true:false);
	this.base.className = "dhx_acc_base_"+this.skin+(this._r?" dhx_acc_rtl":"");
};

};


if (window.dhtmlXCombo){
	dhtmlXCombo.prototype.setRTL = function(state){
		this.DOMlist.className = 'dhx_combo_list'+(state?"_rtl":"")+' '+(dhtmlx.skin?dhtmlx.skin+"_list":"");
		this.DOMelem_button.className = 'dhx_combo_img'+(state?"_rtl":"");
		var z = this.DOMelem_input;
		if (state){
			if (_isIE){
				var e=document.createElement('textarea');
				e.style.overflow = "hidden";
				e.style.whiteSpace="nowrap";
				e.className = 'dhx_combo_input';
				
				z.parentNode.insertBefore(e, z);
				z.parentNode.removeChild(z);
				z=e;
			}
		
			z.style.left = "18px";
			z.style.direction = "rtl";
			z.style.unicodeBidi = "bidi-override";  
		}
	};
};


if (window.dhtmlXDataView){
	dhtmlXDataView.prototype.setRTL = function(state){
		if (state)
			this._obj.className += " dhx_dataview_rtl";
	};
};


if (window.dhtmlXGridObject){
	
dhtmlXGridObject.prototype.setRTL=function(){//non-reversable
   
    this.hdrBox.style.direction="rtl";
    this.hdr.style.marginRight="17px"
    this.hdr.style.paddingRight="0px"
    this.objBox.style.direction="rtl";
    this.sortImg.style.zIndex="3";
    
    var updater= function(){
        if (_isOpera) return;
        if (this.objBox.scrollHeight>this.objBox.offsetHeight){
           if (_isFF) this.hdr.style["marginRight"]="16px";
           if (_isIE) this.hdr.style["marginRight"]="17px";
          this.hdrBox.scrollLeft = this.objBox.scrollLeft;
        }
        else
            this.hdr.style["marginRight"]="0px";
        };
        
    this.attachEvent("onGridReconstructed",updater);
    this.attachEvent("onXLE",updater);
    this.attachEvent("onClearAll",updater);

    
    
   // this.objBox.style.overflowX='hidden';
    
    this.changeCursorState=function(ev){
      var el = ev.target||ev.srcElement;

      if (el.tagName != "TD")
         el=this.getFirstParentOfType(el, "TD")

      if ((el.tagName == "TD")&&(this._drsclmn)&&(!this._drsclmn[el._cellIndex]))
         return el.style.cursor="default";
      var check = (ev.layerX||0)+(((!_isIE)&&(ev.target.tagName == "DIV")) ? el.offsetLeft : 0);
      check=((ev.offsetX||(parseInt(this.getPosition(el, this.hdrBox))-check)*-1));
      if (!_isIE) check=ev.offsetX||ev.layerX;
      if (check < (_isOpera?20:10)){
         el.style.cursor="E-resize";
      }
      else{
          el.style.cursor="default";
      }

      if (_isOpera)
         this.hdrBox.scrollLeft=this.objBox.scrollLeft;
   }
   
   this.doColResize=function(ev, el, startW, x, tabW){
      el.style.cursor="E-resize";
      this.resized=el;
      var fcolW = startW+(x-ev.clientX);
      var wtabW = tabW+(x-ev.clientX)

      if (!(this.callEvent("onResize", [
         el._cellIndex,
         fcolW,
         this
      ])))
         return;

      if (el.colSpan > 1){
         var a_sizes = new Array();

         for (var i = 0;
            i < el.colSpan;
            i++)a_sizes[i]=Math.round(fcolW*this.hdr.rows[0].childNodes[el._cellIndexS+i].offsetWidth/el.offsetWidth);

         for (var i = 0; i < el.colSpan; i++)
            this._setColumnSizeR(el._cellIndexS+i*1, a_sizes[i]);
      } else
         this._setColumnSizeR(el._cellIndex, fcolW);
      this.doOnScroll(0, 1);

    //    this.objBuf.childNodes[0].style.width="";
        if (_isOpera || _isFF)
            this.setSizes();
   }
   
   this._detectHeight=function(d,td,h){
      var l=td.offsetWidth;
         d.style.left=0+"px";
         d.style.width=Math.max(0,this.entBox.offsetWidth-l-4)+"px"
         var h=h||d.scrollHeight;
         d.style.overflow="hidden";
         d.style.height=h+"px";      
         var row=td.parentNode;
         td.parentNode.style.height=(row.oldHeight||20)+3+h*1+"px";   
         td.style.height=(row.oldHeight||20)+3+h*1+"px";   
         if (this._fake){
            var tr=this._fake.rowsAr[td.parentNode.idd];
            tr.style.height=(row.oldHeight||20)+3+h*1+"px";   
         }
   }
   this._correctMonolite=function(mode){
      for (var a in this._flow)
         if (this._flow[a] && this._flow[a].tagName=="DIV")
            if (this.rowsAr[a]){         
               if (this.rowsAr[a].style.display=="none") {
                  this.cells4(this._flow[a].ctrl).close();
                  continue;
               }
               this._flow[a].style.top=this.rowsAr[a].offsetTop+(this.rowsAr[a].oldHeight||20)+"px";
               if (mode) {
                  var l=this._flow[a].ctrl.offsetRight+this._flow[a].ctrl.offsetWidth;
                  this._flow[a].style.left=l+"px";
                  this._flow[a].style.width=this.rowsAr[a].offsetWidth-l-4+"px"
               }
            }
            else{
               this._flow[a].ctrl=null;
               this.objBox.removeChild(this._flow[a]);
               delete this._flow[a];
            }
   }   
   this.attachEvent("onSubGridLoaded",function(sub){
      sub.setRTL();
      sub.hdr.style.marginRight="0px";
   })
   var that=this;
    window.setTimeout(function(){
      that.obj.border=1;
      that.obj.border=0;
    },1)
    
    window.eXcell_ed=function(cell){
      if (cell){
         this.cell=cell;
         this.grid=this.cell.parentNode.grid;
      }
      this.edit=function(){
         this.cell.atag=((!this.grid.multiLine)&&(_isKHTML||_isMacOS||_isFF)) ? "INPUT" : "TEXTAREA";
         this.val=this.getValue();
         this.obj=document.createElement(this.cell.atag);
         this.obj.setAttribute("autocomplete", "off");
         this.obj.style.height=(this.cell.offsetHeight-(_isIE ? 4 : 2))+"px";
         this.obj.className="dhx_combo_edit";
         this.obj.wrap="soft";
         this.obj.style.textAlign=this.cell.style.textAlign;
         this.obj.onclick=function(e){
            (e||event).cancelBubble=true
         }
         this.obj.onmousedown=function(e){
            (e||event).cancelBubble=true
         }
         this.obj.value=this.val
         this.cell.innerHTML="";
         this.cell.appendChild(this.obj);
   
         if (_isFF){
            this.obj.style.overflow="visible";
   
            if ((this.grid.multiLine)&&(this.obj.offsetHeight >= 18)&&(this.obj.offsetHeight < 40)){
               this.obj.style.height="36px";
               this.obj.style.overflow="scroll";
            }
         }
         this.obj.onselectstart=function(e){
            if (!e)
               e=event;
            e.cancelBubble=true;
            return true;
         };
         if (_isIE)
             this.obj.focus();
         this.obj.focus()
      }
      this.getValue=function(){
         if ((this.cell.firstChild)&&((this.cell.atag)&&(this.cell.firstChild.tagName == this.cell.atag)))
            return this.cell.firstChild.value;
   
         if (this.cell._clearCell)
            return "";
   
         return this.cell.firstChild.innerHTML.toString()._dhx_trim();
      }
   
      this.detach=function(){
         this.setValue(this.obj.value);
         return this.val != this.getValue();
      }
   }
   eXcell_ed.prototype=new eXcell;
    eXcell_ed.prototype.setValue = function(val){
      this.cell.innerHTML="<span>"+val+"</span>";
      this.grid.callEvent("onCellChanged", [
         this.cell.parentNode.idd,
         this.cell._cellIndex,
         (arguments.length > 1 ? val2 : val)
      ]);
   }      
   
   window.eXcell_ro=function(cell){
      if (cell){
         this.cell=cell;
         this.grid=this.cell.parentNode.grid;
      }
      this.edit=function(){
      }
   
      this.isDisabled=function(){
         return true;
      }
      this.getValue=function(){
         return this.cell._clearCell?"":this.cell.firstChild.innerHTML.toString()._dhx_trim();
      }
   }
   eXcell_ro.prototype=new eXcell;
   eXcell_ro.prototype.setValue = function(val, val2){
      this.cell.innerHTML="<span>"+val+"</span>";
      this.grid.callEvent("onCellChanged", [
         this.cell.parentNode.idd,
         this.cell._cellIndex,
         (arguments.length > 1 ? val2 : val)
      ]);
   }
   
   var txt_old = eXcell_txt;
   window.eXcell_txt=function(cell){
      txt_old.call(this,cell);
      
      this.getValue  = function(){
         if (this.obj){
            if (_isFF)
               return this.obj.firstChild.value;
            else
               return this.obj.value;
         }
               
         if (this.cell._clearCell)
            return "";
   
         if ((!this.grid.multiLine))
            return this.cell._brval||this.cell.firstChild.innerHTML;
         else
            return this.cell.firstChild.innerHTML.replace(/<br[^>]*>/gi, "\n")._dhx_trim(); //innerText;
      }
      
      return this;
   }
   eXcell_txt.prototype = new eXcell;
   eXcell_txt.prototype.setValue = function(val, val2){
      if (!val||val.toString()._dhx_trim() == ""){
         val="&nbsp;"
         this.cell._clearCell=true;
      } else
         this.cell._clearCell=false;
   
      this.cell._brval=val;
   
      if ((!this.grid.multiLine))
         this.setCValue("<span>"+val+"</span>", val);
      else
         this.setCValue("<span>"+val.replace(/\n/g, "<br/>")+"</span>", val);
   }
    
}	
	
};

if (window.dhtmlXTreeObject){
	dhtmlXTreeObject.prototype.setRTL = function(){
		this.rtlMode=true;
		this.allTree.className=
		this._ltr_line=this.lineArray;
		this._ltr_min=this.minusArray;
		this._ltr_plus=this.plusArray;
		this.lineArray=new Array("line2_rtl.gif","line3_rtl.gif","line4_rtl.gif","blank.gif","blank.gif","line1_rtl.gif");
		this.minusArray=new Array("minus2_rtl.gif","minus3_rtl.gif","minus4_rtl.gif","minus.gif","minus5_rtl.gif");
		this.plusArray=new Array("plus2_rtl.gif","plus3_rtl.gif","plus4_rtl.gif","plus.gif","plus5_rtl.gif");
		this.allTree.className="containerTableStyleRTL";
		
		if (this.htmlNode.childsCount)
			this._redrawFrom(this,this.htmlNode);
        }
};


if (window.dhtmlXTabBar){
	dhtmlXTabBar.prototype.setRTL = function() {
		this.setAlign("right");
	};
};









































	
