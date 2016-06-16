var canvas;
var c;
var objs = new Array();
var vars = {};

var state;
var stateTime;
var nbStates = 0;
var States = {};

var medias = {};

var interval;


//--- Vars Manager ------------------------------------------------------------
function addVar(name, value) {
   vars[name] = value;
}

function removeVar(name) {
   delete vars[name];
}
//-----------------------------------------------------------------------------

//--- States Manager ----------------------------------------------------------
function addState(str) {
   States[str] = nbStates += 1;
}

function switchState(str, callback) {
   console.log("State: "+str);
   animations = 0;
   finished = 0;
   animationsComplete = function() {};
   eval("if (typeof "+state+"_end == 'function') "+state+"_end();");
   state = str;
   stateTime = new Date();
   eval("if (typeof "+state+"_init == 'function') "+state+"_init();");
}

function dt() {
   return new Date() - stateTime;
}
//-----------------------------------------------------------------------------

function fw_paint() {
   c.clearRect(0, 0, canvas.width, canvas.height);

   if (typeof pre_paint == 'function') pre_paint();

   eval("if (typeof "+state+"_paint == 'function') "+state+"_paint();");

   for (var i in objs)
      objs[i].paint();

   eval("if (typeof "+state+"_post_paint == 'function') "+state+"_post_paint();");

   if (typeof post_paint == 'function') post_paint();
}

function fw_update() {
   eval("if (typeof "+state+"_update == 'function') "+state+"_update();");

   for (var i in objs)
      objs[i].update();
}

function fw_cycle() {
   fw_update();
   fw_paint();
}

//--- Medias Manager ----------------------------------------------------------
function Loader() {
   this.pre_complete = function() {
      interval = setInterval(fw_cycle, 1000/30);
      this.complete();
   };

   this.loaded = this.total = 0;

   this.load = function(paths) {
      var loader = this;
      for (var i in paths) {
         if (typeof(paths[i]) != "string") continue;
         var name = paths[i].substring(0, paths[i].indexOf("."))
         var extension = paths[i].substring(paths[i].indexOf(".")+1, paths[i].length)
         this.total++;
         var fn = paths[i];
         switch (extension) {
            case "png":
               medias[i] = new Image();
               medias[i].src = fn;
               medias[i].onload = function() {
                  loader.loaded++;
                  if (loader.loaded == loader.total)
                     loader.pre_complete();
               };
               break;
            case "ogg":
            case "wav":
               medias[i] = new Audio();
               medias[i].src = fn;
               medias[i].load();
               loader.loaded++;
               if (loader.loaded == loader.total)
                  loader.pre_complete();
               break;
         }
      }
   };
}
//-----------------------------------------------------------------------------

function fw_init() {
   canvas = document.getElementById("canvas");
   c = canvas.getContext("2d");

   init();
}

window.addEventListener("load", fw_init, false);
