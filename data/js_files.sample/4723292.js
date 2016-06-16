function go(n) {
    var novaPoziceX = poziceX + n*Math.sin(uhel/360*Math.PI*2);
    var novaPoziceY = poziceY - n*Math.cos(uhel/360*Math.PI*2);
    turtle.drawLine(poziceX, poziceY, novaPoziceX, novaPoziceY);
    poziceX = novaPoziceX;
    poziceY = novaPoziceY;
}

function right(u) {
    uhel = (uhel + u) % 360;
}

function left(u) {
    right(360 - u);
}

function repeat(n, f) {
    for (var i = 0; i < n; i++) {
        f.apply(this, [].slice.call(arguments, 2));
    }
}

turtle = {
    run: function(code, canvas) {
        poziceX = 0;
        poziceY = 0;
        uhel = 0;

        if (turtle.paper)
        {
            turtle.paper.remove();
        }

        var paper = Raphael(canvas, 380, 200);
        turtle.paper = paper;
        paper.rect(0, 0, 380, 200).attr({ fill: "#fff" });
        eval(code);
        turtle.drawTurtle();
    },

    drawLine: function(fromX, fromY, toX, toY) {
        turtle.paper.path("M" + (fromX+100) + " " + (fromY+100) + "L" + (toX+100) + " " + (toY+100));
    },

    drawTurtle: function() {
        im = turtle.paper.image("examples/zelva/zelva.png", poziceX+90, poziceY+84, 20, 30);
        im.rotate(uhel);
    }
}