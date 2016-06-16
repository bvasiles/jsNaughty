/*
 * Uses Enemy: anim - feld wird missbraucht
 */

function copy_obj(o) {
    var c = new Object();

    for(var e in o) {
        c[e] = o[e];
    }
    return c;
}

var Editor = {};

//window.addEventListener('keyup', Editor.keyUpEvent, false);
Editor.fps = 1000 / 5;
Editor.w = 900;
Editor.h = 600;
Editor.leftOffset = 50;
(Editor.bg = new Image()).src = "gfx/level1_bg.png";
Editor.background_y = 9400;
Editor.time = 0;
Editor.buttons = new Array();
Editor.enemies = new Array();
Editor.script = new Array();
Editor.shots = new Array();
Editor.tool = "simple_draw";
Editor.mouseBuffer = undefined;
Editor.selectedEnemy = undefined;
Editor.dragging = false;
Editor.addButton = function(anim, filename) {
    var i = new Image();
    i.src = filename;
    Editor.buttons.push([anim, i]);
}
Editor.addEnemy = function(enemy, x, y, leftOffset, topOffset) {
    e = new Enemy(undefined, null, enemy, x - leftOffset, topOffset + y);
    Editor.enemies.push(e);
    return e;
}
Editor.addShot = function(anim, filename) {
    var i = new Image();
    i.src = filename;
    Editor.shots.push([anim,i]);
}
Editor.addButton("asteroid_1", "gfx/asteroid_1/as_00.png");
Editor.addButton("asteroid_2", "gfx/asteroid_2/as2_00.png");
Editor.addButton("asteroid_3", "gfx/asteroid_3/as3_00.png");
Editor.addButton("asteroid_4", "gfx/asteroid_4/as4_00.png");
Editor.addButton("asteroid_5", "gfx/asteroid_5/as5_00.png");
Editor.addButton("as_all", "gfx/editor/as_all.png");
Editor.addButton("enemy_1", "gfx/enemy_1/feind_00.png");
Editor.addButton("enemy_2", "gfx/enemy_2/ufo_00.png");
Editor.addButton("enemy_3", "gfx/enemy_3/enemy_00.png");
Editor.addButton("enemy_6", "gfx/enemy_6/en_00.png");
Editor.addButton("enemy_7", "gfx/enemy_7/en7_00.png");
Editor.addButton("clear", "gfx/editor/clear.png");
Editor.addButton("write", "gfx/editor/write.png");
Editor.addButton("load", "gfx/editor/load.png");
Editor.addShot("shot_1", "gfx/enemy_shot_1/shot_00.png")
Editor.mainLoop = function() {
    // Draw background
    e = Editor;
    e.context.fillStyle = "rgb(100,100,100)";
    e.context.fillRect(0, 0, Editor.w, Editor.h);
    e.context.drawImage(Editor.bg, 0, Editor.background_y, 800, 600, 50, 0, 800, 600);

    // draw a line all 600 pixel
    for(var i = e.time; i < e.time + 600; i++) {
        if((i % 600) == 0) {
            e.context.strokeStyle = "rgb(255,255,0)";
            e.context.beginPath();
            e.context.moveTo(0, 600 - (i - e.time));
            e.context.lineTo(50, 600 - (i - e.time));
            e.context.closePath();
            e.context.stroke();
            //draw Time
            e.context.fillStyle = "white";
            e.context.font = "bold 20px sans-serif";
            e.context.fillText(i.toString(), 1, 600 - (i - e.time));

        }
    }

    // draw enemies and their properties
    for(var i = 0; i < e.enemies.length; i++) {
        en = e.enemies[i];
        // calculate x and y for time e.time
        en.time = 0;
        var x = en.x;
        var y = en.y;
        for(var j = 0; j < e.time; j++) {
            cords = en.tick();
            x += cords[0];
            y += cords[1];
        }
        e.context.drawImage(en.anim[1], x + e.leftOffset, y - e.background_y);
        if(en == e.enemies[e.selectedEnemy]) {
            en = e.enemies[e.selectedEnemy];
            e.context.strokeStyle = "rgb(255,255,0)";
            e.context.strokeRect(x + e.leftOffset, y - e.background_y, en.anim[1].width, en.anim[1].height);
            e.context.fillStyle = "rgb(60,0,0)";
            e.context.beginPath();
            e.context.arc(en.x + e.leftOffset + en.anim[1].width / 2, en.y + (en.anim[1].height / 2) - e.background_y, 5, 0, Math.PI * 2, false);
            e.context.closePath();
            e.context.fill();
        }
        //draw shots
        if(en.params.shootLeft != undefined) {
            var idx = -1;
            for (var j = 0; j<e.shots.length; j++) {
                if(e.shots[j][0] == en.params.shootLeft) idx = j;
            }
            if (idx != -1 ) {
                var w = e.shots[idx][1].width;
                var h = e.shots[idx][1].height;
                e.context.drawImage(e.shots[idx][1],  x + e.leftOffset, y - e.background_y);
            }
        }
        if(en.params.shootMiddle != undefined) {
            var idx = -1;
            for (var j = 0; j<e.shots.length; j++) {
                if(e.shots[j][0] == en.params.shootMiddle) idx = j;
            }
            if (idx != -1 ) {
                var w = e.shots[idx][1].width;
                var h = e.shots[idx][1].height;
                e.context.drawImage(e.shots[idx][1],  x + e.leftOffset + (en.anim[1].width / 2) -(w/2) , y - e.background_y);
            }
        }
        if(en.params.shootRight != undefined) {
            var idx = -1;
            for (var j = 0; j<e.shots.length; j++) {
                if(e.shots[j][0] == en.params.shootRight) idx = j;
            }
            if (idx != -1 ) {
                var w = e.shots[idx][1].width;
                var h = e.shots[idx][1].height;
                e.context.drawImage(e.shots[idx][1],  x + e.leftOffset + en.anim[1].width - w, y - e.background_y);
            }
        }

    }

    // draw availiable buttons
    for(var i = 0; i < e.buttons.length; i++) {
        if(e.mouseBuffer == i)
            e.context.fillStyle = "rgb(200,255,200)";
        else
            e.context.fillStyle = "rgb(200,200,200)";
        e.context.fillRect(10 + i * 50, 10, 49, 49);
        e.context.drawImage(e.buttons[i][1], 10 + i * 50, 10, 49, 49);
    }

    //draw Time
    e.context.fillStyle = "white";
    e.context.font = "bold 20px sans-serif";
    e.context.fillText(e.time.toString(), 850, 20);
}
Editor.keyDownEvent = function(event) {
    switch (event.keyCode) {
        case 37:
            // Left
            if(Editor.background_y < 9400 && Editor.time >= 0) {
                Editor.background_y += 10;
                if(Editor.background_y > 9400)
                    Editor.background_y = 9400;
                Editor.time -= 10;
                if(Editor.time < 0)
                    Editor.time = 0;
            }
            break;
        case 38:
            // Up
            if(Editor.background_y > 0) {
                Editor.background_y -= 100;
                if(Editor.background_y < 0)
                    Editor.background_y = 0;
                Editor.time += 100;
                if(Editor.time > 9400)
                    Editor.time = 9400;
            }
            break;
        case 39:
            // Right
            if(Editor.background_y > 0 && Editor.time <= 9400) {
                Editor.background_y -= 10;
                if(Editor.background_y < 0)
                    Editor.background_y = 0;
                Editor.time += 10;
                if(Editor.time > 9400)
                    Editor.time = 9400;
            }
            break;
        case 40:
            // Down
            if(Editor.background_y < 9400) {
                Editor.background_y += 100;
                if(Editor.background_y > 9400)
                    Editor.background_y = 9400;
                Editor.time -= 100;
                if(Editor.time < 0)
                    Editor.time = 0;
            }
            break;
        case 85:
            // u - remove last
            Editor.enemies = Editor.enemies.slice(0, Editor.enemies.length - 1);
            Editor.selectedEnemy = undefined;
            break;
        case 88:
            // x - delete a seleceted object
            if(Editor.selectedEnemy != undefined) {
                Editor.enemies.splice(Editor.selectedEnemy, 1);
                Editor.selectedEnemy = undefined;
            }
            break;
        case 87:
            // w - move selected object 1 pixel up
            if(Editor.selectedEnemy != undefined) {
                Editor.enemies[Editor.selectedEnemy].y--;
            }
            break;
        case 65:
            // a - move selected object 1 pixel left
            if(Editor.selectedEnemy != undefined) {
                Editor.enemies[Editor.selectedEnemy].x--;
            }
            break;
        case 83:
            // s - move selected object 1 pixel down
            if(Editor.selectedEnemy != undefined) {
                Editor.enemies[Editor.selectedEnemy].y++;
            }
            break;
        case 68:
            if(event.shiftKey) {
                // Shift d - dubplicate selected objects
                if(Editor.selectedEnemy != undefined) {
                    Editor.enemies.push(copy_obj(Editor.enemies[Editor.selectedEnemy]));
                    Editor.enemies[Editor.enemies.length - 1].x += 40;
                    Editor.enemies[Editor.enemies.length - 1].y += 40;
                }
            } else {
                // d - move selected object 1 pixel left
                if(Editor.selectedEnemy != undefined) {
                    Editor.enemies[Editor.selectedEnemy].x++;
                }
            }
            break;

    }
}
Editor.mouseUpEvent = function(event) {
    if(event.button != 0)
        return;
    if(event.x < 0 || event.x > Editor.w || event.y < 0 || event.y > Editor.h)
        return;
    Editor.dragging = false;
    col = Math.round((10 + event.x) / 50);
    row = Math.round((10 + event.y) / 50);
    for(var i = 0; i < Editor.buttons.length; i++) {
        if(i == col)
            break;
    }

    // ist es ein button?
    if(col <= Editor.buttons.length && row == 1) {
        // check for spezial buttons
        if(Editor.buttons[col-1][0] == "clear") {
            Editor.mouseBuffer = undefined;
            Editor.selectedEnemy = undefined;
            Editor.tool = "simple_draw";
        } else if(Editor.buttons[col-1][0] == "write") {
            Editor.writeScript();
        } else if(Editor.buttons[col-1][0] == "load") {
            Editor.readScript();
        } else if(Editor.buttons[col-1][0] == "as_all") {
            Editor.mouseBuffer = col - 1;
            Editor.tool = "asteroids";
        } else {
            Editor.tool = "simple_draw";
            Editor.mouseBuffer = col - 1;
        }
        return;
    }

    // selektiere ein objekt
    sel = undefined;
    for(var i = 0; i < Editor.enemies.length; i++) {
        en = Editor.enemies[i];
        x = en.x + Editor.leftOffset;
        y = en.y - Editor.background_y;
        w = en.anim[1].width;
        h = en.anim[1].height;
        if(event.x >= x && event.x <= x + w && event.y >= y && event.y <= y + h) {
            sel = i;
            break;
        }
    }
    Editor.selectedEnemy = sel;
    Editor.fillSelectForm();

    // male ein schiff mit shift-klick
    if(Editor.mouseBuffer != undefined && sel == undefined && Editor.tool == "simple_draw") {
        en = Editor.buttons[Editor.mouseBuffer];
        x = event.x - en[1].width / 2;
        y = event.y - en[1].height / 2;
        Editor.addEnemy(en, x, y, Editor.leftOffset, Editor.background_y);
        // selektiere das schiff direkt
        Editor.selectedEnemy = Editor.enemies.length - 1;
        Editor.fillSelectForm();
    }

    if(Editor.tool == "asteroids") {
        Editor.randomAsteroids(event.x, event.y);
    }

}
Editor.mouseDownEvent = function(event) {
    if(Editor.selectedEnemy != undefined) {
        en = Editor.enemies[Editor.selectedEnemy];
        x = en.x + Editor.leftOffset;
        y = en.y - Editor.background_y;
        w = en.anim[1].width;
        h = en.anim[1].height;
        if(event.x >= x && event.x <= x + w && event.y >= y && event.y <= y + h) {
            Editor.dragging = true;
        }
    }
}
Editor.mouseMoveEvent = function() {
    if(Editor.dragging == true) {
        en = Editor.enemies[Editor.selectedEnemy];
        en.x = event.x - Editor.leftOffset - en.anim[1].width / 2;
        en.y = event.y - (en.anim[1].height / 2) + Editor.background_y;
    }
}
Editor.writeScript = function() {
    ed_script = document.getElementById("ed_script");
    ed_script.value = "";
    for(var i = 0; i < Editor.enemies.length; i++) {
        en = Editor.enemies[i];
        ed_script.value += "en" + i + " = this.createEnemy('" + en.anim[0] + "',";
        ed_script.value += "[" + en.x + ", " + en.y + "], undefined, ";
        ed_script.value += "[" + en.params.points + ", " + en.params.energy + ", " + en.params.shooting + ",";
        ed_script.value += "" + en.params.shootingFrequency + ", " + en.params.shootingEnergy + ", ";
        ed_script.value += "'" + en.params.shootLeft + "', '" + en.params.shootMiddle + "', '" + en.params.shootRight + "'";
        ed_script.value += "], [";
        for( j = 0; j < en.timeline.length; j++) {
            ed_script.value += "['" + en.timeline[j].moveX + "', " + en.timeline[j].paramX + ",";
            ed_script.value += "'" + en.timeline[j].moveY + "', " + en.timeline[j].paramY + ",";
            ed_script.value += "" + en.timeline[j].time + "],";
        }
        ed_script.value += "]);";
        ed_script.value += "\n";
    }
    // entferne das letzte komma in der liste der inneren for-schleife ],] wird zu ]]
    ed_script.value = ed_script.value.replace(/\],\]\);/, "]]);");
}
Editor.readScript = function() {
    this.createEnemy = function(anim, pos, relId, parameters, timeline) {
        an = 0;
        for(var i = 0; i < Editor.buttons.length; i++) {
            if(Editor.buttons[i][0] == anim) {
                an = i;
                break;
            }
        }
        en = Editor.addEnemy(Editor.buttons[an], pos[0], pos[1], 0, 0);
        en.params.fromArray(parameters);
        for(var i = 0; i < timeline.length; i++) {
            en.timeline[i] = new EnemyEvt().fromArray(timeline[i]);
        }

    }
    Editor.enemies = new Array();
    ed_script = document.getElementById("ed_script");
    eval(ed_script.value);
}
Editor.fillSelectForm = function() {
    if(Editor.selectedEnemy == undefined)
        return;
    en = Editor.enemies[Editor.selectedEnemy];
    document.getElementById("ed_points").value = en.params.points;
    document.getElementById("ed_energy").value = en.params.energy;
    document.getElementById("ed_shooting").checked = en.params.shooting;
    document.getElementById("ed_shootingFrequency").value = en.params.shootingFrequency;
    document.getElementById("ed_shootingEnergy").value = en.params.shootingEnergy;
    document.getElementById("ed_shootLeft").value = en.params.shootLeft;
    document.getElementById("ed_shootMiddle").value = en.params.shootMiddle;
    document.getElementById("ed_shootRight").value = en.params.shootRight;
    document.getElementById("ed_timeline").innerHTML = "";
    for(var i = 0; i < en.timeline.length; i++) {
        Editor.addTrigger(i);
        document.getElementById("ed_m" + i + "_xmove").value = en.timeline[i].moveX;
        document.getElementById("ed_m" + i + "_xparam").value = en.timeline[i].paramX;
        document.getElementById("ed_m" + i + "_ymove").value = en.timeline[i].moveY;
        document.getElementById("ed_m" + i + "_yparam").value = en.timeline[i].paramY;
        document.getElementById("ed_m" + i + "_time").value = en.timeline[i].time;
    }
}
Editor.addTrigger = function(id) {
    if(id == undefined) {
        if(Editor.selectedEnemy == undefined)
            return;
        en = Editor.enemies[Editor.selectedEnemy];
        new_id = en.timeline.length;
        en.timeline.push([undefined, 0, undefined, 0, 0]);
    } else {
        new_id = id;
    }
    last = document.getElementById("ed_timeline");
    new_li = document.createElement("li");
    new_li.id = "ed_m" + new_id;
    h = "";
    h += '<input type="button" value="Del" id="ed_m0_del_trigger" onclick="Editor.delTrigger(' + new_id + ');" />';
    h += '        Time: <input id="ed_m0_time" value="0" /><br>';
    h += '        X-Move: <select id="ed_m0_xmove" size="1">';
    h += '            <option>noChange</option>';
    h += '            <option>linear</option>';
    h += '            <option>sine</option>';
    h += '            <option>parabel</option>';
    h += '        </select>';
    h += '        X-Param: <input id="ed_m0_xparam" /><br>';
    h += '        Y-Move: <select id="ed_m0_ymove" size="1">';
    h += '            <option>noChange</option>';
    h += '            <option>linear</option>';
    h += '            <option>sine</option>';
    h += '            <option>parabel</option>';
    h += '        </select>';
    h += '        Y-Param: <input id="ed_m0_yparam" />';
    h = h.replace(/_m0_/g, "_m" + new_id + "_");
    new_li.innerHTML = h;
    last.insertBefore(new_li);
}
Editor.delTrigger = function(id) {
    // Element rausfiletieren aus dem array und aus der Liste
    document.getElementById("ed_timeline").removeChild(document.getElementById("ed_m" + id));

}
Editor.saveCurrent = function() {
    if(Editor.selectedEnemy == undefined)
        return;
    en = Editor.enemies[Editor.selectedEnemy];
    en.params.points = Math.round(document.getElementById("ed_points").value);
    en.params.energy = Math.round(document.getElementById("ed_energy").value);
    en.params.shooting = document.getElementById("ed_shooting").checked;
    en.params.shootingFrequency = Math.round(document.getElementById("ed_shootingFrequency").value);
    en.params.shootingEnergy = Math.round(document.getElementById("ed_shootingEnergy").value);
    en.params.shootLeft = document.getElementById("ed_shootLeft").value;
    en.params.shootMiddle = document.getElementById("ed_shootMiddle").value;
    en.params.shootRight = document.getElementById("ed_shootRight").value;
    en.timeline = new Array();
    for(var i = 0; i < document.getElementById("ed_timeline").childElementCount; i++) {
        var evt = new EnemyEvt();
        evt.moveX = document.getElementById("ed_m" + i + "_xmove").value;
        evt.paramX = Number(document.getElementById("ed_m" + i + "_xparam").value);
        evt.moveY = document.getElementById("ed_m" + i + "_ymove").value;
        evt.paramY = Number(document.getElementById("ed_m" + i + "_yparam").value);
        evt.time = Number(document.getElementById("ed_m" + i + "_time").value);
        en.timeline.push(evt);
    }
}
Editor.randomAsteroids = function(x, y) {
    // draw 5 random asteroids in a circle raduis 100px
    for(var i = 0; i < 5; i++) {
        winkel = Math.random() * Math.PI * 2;
        laenge = Math.random() * 100;
        ast = Math.random() * 4;
        en = Editor.buttons[Math.round(ast)];
        x = x + (Math.sin(winkel) * laenge);
        y = y + (Math.cos(winkel) * laenge);
        Editor.addEnemy(en, x, y, Editor.leftOffset, Editor.background_y);
    }
    // selektiere letzten
    Editor.selectedEnemy = Editor.enemies.length - 1;
    Editor.fillSelectForm();
}
function start_editor() {
    canvas = document.getElementById('gcanvas');
    Editor.context = canvas.getContext('2d');
    Editor.stateID = utils.setInterval(Editor.mainLoop, Editor.fps);
    window.addEventListener('keydown', Editor.keyDownEvent, false);
    canvas.addEventListener('mousedown', Editor.mouseDownEvent, false);
    canvas.addEventListener('mouseup', Editor.mouseUpEvent, false);
    canvas.addEventListener('mousemove', Editor.mouseMoveEvent, false);
    document.getElementById('tab1').style.visibility = 'hidden';
    document.getElementById('tab2').style.visibility = 'visible';

    for (var i = 0; i<Editor.shots.length; i++) {
        ol = document.getElementById("ed_shootLeft");
        om = document.getElementById("ed_shootMiddle");
        or = document.getElementById("ed_shootRight");
        option = document.createElement("option");
        option.innerHTML = Editor.shots[i][0];
        ol.appendChild(option);
        option = document.createElement("option");
        option.innerHTML = Editor.shots[i][0];
        om.appendChild(option);
        option = document.createElement("option");
        option.innerHTML = Editor.shots[i][0];
        or.appendChild(option);
    }

}

function stop_editor() {
    window.clearInterval(Editor.stateID);
    window.removeEventListener('keydown', Editor.keyDownEvent, false);
    canvas.removeEventListener('mousedown', Editor.mouseDownEvent, false);
    canvas.removeEventListener('mouseup', Editor.mouseUpEvent, false);
    canvas.removeEventListener('mousemove', Editor.mouseMoveEvent, false);
}
