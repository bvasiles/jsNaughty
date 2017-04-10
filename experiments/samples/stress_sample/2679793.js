(function () {

/*
var fun = function(x) {
    return x * x - 1;
};
*/
var x = 2;
var fun = function(x) {
    return Math.sin(x);
};

fun.derivative = function(x) {
    return Math.cos(x);
};


//var x = 1.5709381282926045;
//given a function and an x-value, returns graph parameters to appropriately center the point 
var computeBox = function(fun, x) {
    var y = fun(x);
    var absy = Math.abs(y);
    var ymax = Math.max(absy * 2, 1e-8);
    ymin = -ymax;
    xmax = x + ymax;
    xmin = x + ymin;
    return {
        box: [xmin, ymax, xmax, ymin],
        funPoint: [x, y]
    };
};


var makeObjects = function(brd, fun, fx, fy, ymax) {
    var C, circ, A, interval, startx, endx, snippet, lin, rad;
    var ret = {};

    ret.C = brd.create('point', [fx, fy], {
        fixed: true,
        name: "C",
        color: "grey"
    });

    interval = ymax / 3; //(xmax - xmin) / 20;
    startx = fx - 0.7 * interval;
    endx = fx + 0.7 * interval;


    rad = interval / 2;
    ret.circ = brd.create('circle', [ret.C, rad], {
        strokeWidth: 1,
        strokeColor: "grey"
    });

    ret.tan = brd.create('line', [[fx, fy], [fx + 1e-10, fun(fx + 1e-10)]], {
        visible: false
    });

    ret.start = brd.create('intersection', [ret.tan, ret.circ, 0], {
        visible: false
    });
    ret.end = brd.create('intersection', [ret.tan, ret.circ, 1], {
        visible: false
    });


    //draw function
    ret.snippet = brd.create('functiongraph', [fun, Math.min(ret.start.X(), ret.end.X()),
                                                                                       Math.max(ret.start.X(), ret.end.X())], {
        strokewidth: 5
    });

    ret.A = brd.create('glider', [fx, fy - ((fy < 0) ? -1 : 1) * rad, ret.circ], {
        name: "A"
    });
    ret.inter = brd.create('point', [function() {
        var slope = (ret.A.Y() - fy) / (ret.A.X() - fx);
        var newx = -ret.A.Y() / slope + ret.A.X();
        return [newx, 0];}], {
        name: "B",
        color: "grey"
    });

    ret.inter2 = brd.create('point', [function() {
        return [ret.inter.X(), ret.inter.Y()]}], {
        visible: false,
        face: 'x',
        name: "",
        size: 8
    });

    // Create the line
    ret.lin = brd.create('segment', [ret.C, ret.inter], {
        dash: 3,
        color: "grey"
    });

    //axes, ticks
    //vertical
    ret.vAxis = brd.create('segment', [[startx - interval, ymax], [startx - interval, -ymax]], {
        strokeColor: "black"
    });
    ret.vUpTick = brd.create('segment', [[startx - interval - interval / 10, ymax / 2], [startx - interval + interval / 10, ymax / 2]], {
        strokeColor: "black",
    });
    ret.vUpTickLabel = brd.create('text', [startx - interval - 8 * interval / 10, ymax / 2 + interval / 10, (ymax / 2).toExponential(2)]);
    ret.vDownTick = brd.create('segment', [[startx - interval - interval / 10, -ymax / 2], [startx - interval + interval / 10, -ymax / 2]], {
        strokeColor: "black"
    });
    ret.vDownTickLabel = brd.create('text', [startx - interval - 8 * interval / 10, -ymax / 2 + interval / 10, (-ymax / 2).toExponential(2)]);

    //horizontal
    ret.hAxis = brd.create('segment', [[fx - ymax, 0], [fx + ymax, 0]], {
        strokeColor: "black"
    });
    ret.hLeftTick = brd.create('segment', [[fx - ymax / 2, -interval / 10], [fx - ymax / 2, interval / 10]], {
        strokeColor: "black"
    });
    ret.hLeftTickLabel = brd.create('text', [fx - ymax / 2, -3 * interval / 10, (fx - ymax / 2).toPrecision(7)]);
    ret.hRightTick = brd.create('segment', [[fx + ymax / 2, -interval / 10], [fx + ymax / 2, interval / 10]], {
        strokeColor: "black"
    });
    ret.hRightTickLabel = brd.create('text', [fx + ymax / 2, -3 * interval / 10, (fx + ymax / 2).toPrecision(7)]);

    var orderMag = 8 + Math.round(Math.log(ymax) / Math.LN10);
    if (orderMag > 1) {
        $("#currentGuess").html("Current guess is " + fx + ".<br/>You have  " + orderMag + " orders of magnitude remaining.");
    } else {
        $("#currentGuess").text("You win! " + fx + " is close enough!");
    }

    $('#xy > tbody').append('<tr><td>' + fx.toFixed(8) + "</td><td>" + fy.toExponential(4) + '</tr>');

    return ret;
};

var clearObjects = function(graphObjects) {
    for (key in graphObjects) {
        graphObjects[key].setProperty({
            visible: false
        });
    }
};


var opacObjects = function(graphObjects, level) {
    for (key in graphObjects) {
        graphObjects[key].setProperty({
            strokeOpacity: level
        });
    }
};


// Initialize the board
var initBox = [-10, 10, 10, -10];
var brd = JXG.JSXGraph.initBoard('graphLine', {
    axis: false,
    showCopyright: false,
    showNavigation: false,
    boundingbox: initBox
}); //bounding box has format [left, top, right, bottom]
var funGraph = brd.create('functiongraph', [fun], {
    visible: false,
    strokeWidth: 2
});

var xax = brd.create('line', [[0, 0], [1, 0]], {
    strokeColor: "grey"
});
var origin = brd.create('point', [0, 0], {
    name: "O",
    color: "grey",
    visible: true
});
var yax = brd.create('line', [[0, 0], [0, 1]], {
    strokeColor: "grey"
});


var data = computeBox(fun, x);

//brd.setBoundingBox(data.box);
var graphObjects = [makeObjects(brd, fun, x, data.funPoint[1], data.box[1])];

var mix = function(left, right, ratio) {
    var n = left.length;
    var ret = [];
    for (var i = 0; i < n; i += 1) {
        ret[i] = left[i] * ratio + right[i] * (1 - ratio);
    }
    return ret;
};



var animate = function(fadeobjs, showobjs, oldbox, newbox, delay) {
    var opacity = 1;
    $("button").attr("disabled", true);
    (fadeobjs) ? toggleLabels(fadeobjs, false) : (fadeobjs = {});
    toggleLabels(showobjs, false);
    funGraph.setProperty({
        visible: true
    });
    if ((Math.max(oldbox[0], newbox[0]) < 0) && (Math.max(oldbox[2], newbox[2]) > 0)) {
        origin.setProperty({
            visible: true
        });
    }
    var inter = window.setInterval(function() {
        opacObjects(fadeobjs, opacity);
        //opacObjects(showobjs, 1 - opacity);
        brd.setBoundingBox(mix(oldbox, newbox, opacity));
        opacity = opacity - (opacity > 0.09 ? 0.01 : 0.002);
        //console.log(opacity);
        if (opacity <= 0) {
            clearInterval(inter);
            clearObjects(fadeobjs);
            toggleLabels(showobjs, true);
            funGraph.setProperty({
                visible: false
            });
            origin.setProperty({
                visible: false
            });
            brd.setBoundingBox(newbox);
            $("button").removeAttr("disabled");
            brd.update();
        }
    }, delay);
};

var toggleLabels = function(graphO, bool) {
    graphO.hRightTickLabel.setProperty({
        visible: bool
    });
    graphO.hLeftTickLabel.setProperty({
        visible: bool
    });
    graphO.vUpTickLabel.setProperty({
        visible: bool
    });
    graphO.vDownTickLabel.setProperty({
        visible: bool
    });
    graphO.A.setProperty({
        visible: bool
    });
    graphO.inter.setProperty({
        visible: bool
    });
    graphO.C.setProperty({
        visible: bool
    });
    graphO.inter2.setProperty({
        visible: (!(bool))
    });


};

animate(false, graphObjects[0], initBox, data.box, 20);
window.setTimeout(function() {
    yax.setProperty({
        visible: false
    });
    origin.setProperty({
        visible: false
    });
}, 3000);

var togAni = true;

$("#animation").click(function() {
    togAni = !togAni;
});

$("#history").click(function() {
    $("#xy").toggle();
});

$("#tangent").click(function() {
    var go = graphObjects[graphObjects.length - 1];
    var tang = brd.create('line', [go.C, [go.C.X() + 0.1, 0.1 * fun.derivative(go.C.X()) + go.C.Y()]], {
        visible: false
    });
    var inTang0 = brd.create('intersection', [tang, go.circ, 0], {
        visible: false
    });
    var inTang1 = brd.create('intersection', [tang, go.circ, 1], {
        visible: false
    });
    var inTang = (Math.abs(inTang0.Y()) < Math.abs(inTang1.Y())) ? inTang0 : inTang1;
    go.A.moveTo([inTang.X(), inTang.Y()], 200);
    clearObjects({
        b: tang,
        c: inTang0,
        d: inTang1
    });
});

$("#reset").click(function() {

    clearObjects(brd.objects);
    brd.setBoundingBox(initBox);
    brd.create('line', [[0, 0], [1, 0]], {
        strokeColor: "grey"
    });
    origin = brd.create('point', [0, 0], {
        name: "O",
        color: "grey",
        visible: true
    });
    brd.create('line', [[0, 0], [0, 1]], {
        strokeColor: "grey"
    });

    x = 2;

    data = computeBox(fun, x);
    $('#xy > tbody').empty();

    if (funGraph) {
        funGraph.remove();
    }
    funGraph = brd.create('functiongraph', [fun], {
        strokewidth: 2,
        visible: false //!($("#snippet").is(":checked"))
    });
    graphObjects = [makeObjects(brd, fun, x, data.funPoint[1], data.box[1])];

    if (togAni) {
        brd.setBoundingBox(initBox);
        origin.setProperty({
            visible: true
        });
        animate(false, graphObjects[graphObjects.length - 1], initBox, data.box, 30);
        window.setTimeout(function() {
            origin.setProperty({
                visible: false
            });
        }, 3000);
    } else {
        brd.setBoundingBox(data.box);
    }
    flag = true;
}); //.click();
$("#newGuess").click(function() {
    var ind = graphObjects.length - 1;
    var newx = graphObjects[ind].inter.X();

    var newdata = computeBox(fun, newx);
    graphObjects.push(makeObjects(brd, fun, newx, newdata.funPoint[1], newdata.box[1]));
    if (togAni) {
        animate(graphObjects[ind], graphObjects[ind + 1], data.box, newdata.box, 10);
    } else {
        clearObjects(graphObjects[ind]);
        brd.setBoundingBox(newdata.box);
    }
    data = newdata;
    x = newx;
    return false;
});
}());