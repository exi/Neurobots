var running;
var timer;

var ctx;
var zoom, camx, camy;

var bots;
var food;
var maxfood = 400;

var fooddelay;
var foodrate;

var lastdraw = 0;

const worldsize = 600;
const foodradius = 500;

var floor;

function draw()
{
	ctx.save();
	ctx.fillStyle = "rgb( 0, 0, 0 )";
	ctx.fillRect( 0, 0, 800, 600 );

	ctx.translate( 400, 300 );
	ctx.scale( zoom, zoom );
	ctx.translate( camx, camy );

        ctx.drawImage(floor.canvas, 0, 0, floor.size, floor.size, -worldsize, -worldsize, worldsize*2, worldsize*2); 

	ctx.strokeStyle = "rgb( 0, 0, 0 )"
	ctx.strokeRect( -worldsize, -worldsize, worldsize*2, worldsize*2 );

	for( var i in food )
		food[i].draw( ctx );

	for( var i in bots )
		bots[i].draw( ctx );
	
	ctx.restore();
}

function generateFood(px,py) {
    fooddelay = foodrate;

    var x,y;
    if( !px || !py) {
        x = Math.round(Math.random()*floor.size);
        y = Math.round(Math.random()*floor.size);
    } else {
        x = px;
        y = py;
    }

    var f = floor.get(x,y);
    if( f < 0.8 ) {
        floor.set(x,y,f+0.5,40);
        var zooming = worldsize/floor.size;
        food.push( new plant( (x*2)*zooming-worldsize, (y*2)*zooming-worldsize ) );
    } else {
        x++;
        if( x >= floor.size ) {
            x = x % floor.size;
            y++;
        }
        if( y >= floor.size) {
            y = y % floor.size;
        }
        generateFood(x,y);
    }
}

function loop()
{
        var update = false;
        var distcache = {};

	(function checkbots() {
        for( var i=0; i<bots.length; i++ )
	{
		if( bots[i].alife == false )
		{
			if( selected == i )
				selected = -1;
			if( selected > i )
				selected -= 1;

			bots.splice( i, 1 );
			i--;
		}
		else
		{
			bots[i].step(distcache);
		}
	}
        })();

        (function checkfood() {
	for( var i=0; i<food.length; i++ )
	{
		if(food[i].alife == false )
		{
			food.splice( i, 1 );
			i--;
		}
		else
		{
			food[i].step();
		}
	}
        })();

        floor.step();

	if( bots.length < 5 )
		bots.push( new neurobot( worldsize*2.0*(Math.random()-0.5), worldsize*2.0*(Math.random()-0.5), Math.PI*2*Math.random() ) );

	if( ( fooddelay <= 0 ) && ( food.length < maxfood ) )
	{
            generateFood();
	}

	if( fooddelay > 0 )
		fooddelay--;

        var date = new Date();

        if( date.getTime() - lastdraw > 40 )
        {
            update = true;
            lastdraw = date.getTime();
        }
        if( update)
            draw();
	
	var now = new Date().getTime();
	fps = 1000/(now-time);
	time = now;

	statdelay--;
	if( statdelay <= 0 )
	{
                if( update )
                    do_stats();
		statdelay = 10;
	}
        timer = setTimeout(loop, 1);
}

function resetsim()
{
	selected = -1;

	var value = parseInt( document.getElementById( "bdepthbox" ).value );
	if( ( value <= 64 ) && ( value >= 2 ) )
		braindepth = value;
	else
	{
		alert( "Brain size out of range (2-64)" );
		return;
	}
	
	value = parseInt( document.getElementById( "bsizebox" ).value );
	if( ( value <= 64 ) && ( value >= 4 ) && ( value%2 == 0 ) )
		brainsize = value;
	else
	{
		alert( "Brain complexity out of range (4-64) or not a multiple of 2" );
		return;
	}

	bots = new Array();
	for( var i=0; i<25; i++ )
		bots.push( new neurobot( worldsize*2.0*(Math.random()-0.5), worldsize*2.0*(Math.random()-0.5), Math.PI*2*Math.random() ) );

	food = new Array();
        floor.reset();
	for( var i=0; i<maxfood; i++ )
	{
            generateFood();
	}

	fooddelay = 0;
	
	draw();
}

function init()
{
	var canvas = document.getElementById( "canvas" );
	floorcanvas = document.getElementById( "floor" );

	if( canvas.getContext && floorcanvas.getContext)
	{
		ctx = canvas.getContext( "2d" );
                floor = new Floor(600,floorcanvas,food);
                floor.init();

		mousedown = false;
		canvas.onmousewheel = wheelzoom;
		canvas.onmousedown = mouse_down;
		canvas.onclick = mouse_click;
		document.onmouseup = mouse_up;
		document.onmousemove = movecam;

		resetcam();

		resetsim();

		fooddelay = 0;
		foodrate = 10;

		draw();

		statdelay = 0;

		running = true;
                loop();
	} else {
                console.log("no context");
        }
}

