function int_pack( value, range )
{
	return Math.round(value/range*2176782335.0).toString( 36 );
}

function int_unpack( value, range )
{
	return (parseInt( value, 36 )/2176782335.0)*range;
}

function generate_checksum( data )
{
	var checksum = 0;
	for( var i in data )
		checksum = ( checksum + data.charCodeAt( i ) * data.length * i ) % 2176782336;
	return checksum.toString( 36 );
}

function randinit( range )
{
	return (Math.random()*2.0-1.0)*(Math.random()*2.0-1.0)*range;
}

function mutate( value, range, rate )
{
	var newval;

	if( Math.random() <= rate )
	{
		if( Math.random() <= 0.001 )
		{
			newval = randinit( range );
		}
		else
		{
			newval = value+(Math.random()*2.0-1.0)*rate;
			if( newval > range ) newval = range;
			if( newval < -range ) newval = -range;
		}
	}
	else
	{
		newval = value;
	}
	
	return newval;
}

var braindepth;
var brainsize;

function neurobot( x, y, rot, parent)
{
	this.alife = true;
	this.rot = rot;
	this.x = x;
	this.y = y;
	this.foodlevel = 500;
	this.age = 0;
	this.children = 0;
	this.dotseaten = 0;
	this.generation;
	this.color = {};
        this.maxage = 10000;
        this.maxfood = 1000;
        this.inputneurons = 34;
        this.outputneurons = 2;
        this.output = new Array(this.outputneurons);
	
	this.vision = new Array(this.inputneurons);

	if( ! parent )
	{
		this.braindepth = braindepth;
		this.brainsize = brainsize;
		this.mutationrate = Math.random()*Math.random();
		this.generation = 0;
		
		this.color.r = Math.random()*255;
		this.color.g = Math.random()*255;
		this.color.b = Math.random()*255;
	}
	else
	{
		this.braindepth = parent.braindepth;
		this.brainsize = parent.brainsize;
		this.generation = parent.generation+1;

		if( Math.random() <= 0.02 )
		{
			this.mutationrate = Math.random()*Math.random();
		}
		else
		{
			this.mutationrate = parent.mutationrate+((Math.random()*2.0-1.0)*parent.mutationrate)*0.1;
			if( this.mutationrate > 1.0 ) this.mutationrate = 1.0;
			if( this.mutationrate < 0.0 ) this.mutationrate = 0.0;
		}
		
		this.color.r = parent.color.r + (Math.random()*2.0-1.0)*this.mutationrate*25;
		if( this.color.r > 255 ) this.color.r = 255;
		if( this.color.r < 0 ) this.color.r = 0;
		this.color.g = parent.color.g + (Math.random()*2.0-1.0)*this.mutationrate*25;
		if( this.color.g > 255 ) this.color.g = 255;
		if( this.color.g < 0 ) this.color.g = 0;
		this.color.b = parent.color.b + (Math.random()*2.0-1.0)*this.mutationrate*25;
		if( this.color.b > 255 ) this.color.b = 255;
		if( this.color.b < 0 ) this.color.b = 0;
	}

        this.brain = new Brain(this.braindepth, this.brainsize, this.inputneurons, this.outputneurons);

	if( ! parent )
	{
                this.brain.randomInit();
	}
	else
	{
                this.brain.mutateFromParent(parent.brain);
	}

	this.step = function()
	{
                var maxSightc = Math.pow(150*150,4);
		for( var i=0; i<this.inputneurons; i++ )
			this.vision[i] = 0.0;

		for( var j in food )
		{
			var d={};
			var f={};
			var p={};
			var t, dist;

			f.x = food[j].x-this.x;
			f.y = food[j].y-this.y;

			dist = f.x*f.x+f.y*f.y;
			if( dist > 150.0*150.0 )
				continue;
                        var distq = dist;

			for( var i=0; i<16; i++ )
			{
				var dir=this.rot+(i-7.5)/12.0;
				d.x = Math.cos( dir );
				d.y = Math.sin( dir );

				t = (d.x*f.x)+(d.y*f.y);
				if( ( t < 0.0 ) || ( t > 150.0 ) )
					continue;
				
				p.x = this.x+t*d.x;
				p.y = this.y+t*d.y;
				
				dist = (p.x-food[j].x)*(p.x-food[j].x)+(p.y-food[j].y)*(p.y-food[j].y);
				
				if( dist <= 25.0 )
					this.vision[i] = 1.0 - Math.pow(distq,4)/maxSightc;
			}
		}

		for( var j in bots )
		{
			if( bots[j] == this ) continue;
			var d={};
			var f={};
			var p={};
			var t, dist;
			
			f.x = bots[j].x-this.x;
			f.y = bots[j].y-this.y;

			dist = f.x*f.x+f.y*f.y;
			if( dist > 150.0*150.0 )
				continue;
                        var distq = dist;

			for( var i=0; i<16; i++ )
			{
				var dir=this.rot+(i-7.5)/12.0;
				d.x = Math.cos( dir );
				d.y = Math.sin( dir );
				
				t = (d.x*f.x)+(d.y*f.y);
				if( ( t < 0.0 ) || ( t > 150.0 ) )
					continue;
				
				p.x = this.x+t*d.x;
				p.y = this.y+t*d.y;
				
				dist = (p.x-bots[j].x)*(p.x-bots[j].x)+(p.y-bots[j].y)*(p.y-bots[j].y);
				
				if( dist <= 25.0 )
					this.vision[i+16] = 1.0 - Math.pow(distq,4)/maxSightc;
			}
		}

                //add ability to see age and food level
                if(this.inputneurons == 34) {
                    this.vision[32] = 1 - this.age/this.maxage;
                    this.vision[33] = 1 - this.foodlevel/this.maxfood;
                }

                this.output = this.brain.step(this.vision);

		var speed = Math.abs(this.output[0]);
		var turnspeed = this.output[1];
		
		this.rot += turnspeed/5.0;

		if( this.rot >= 2.0*Math.PI )
			this.rot -= 2.0*Math.PI;
		if( this.rot <= 0.0 )
			this.rot += 2.0*Math.PI;

		this.x += Math.cos( this.rot )*speed*2.5;
		this.y += Math.sin( this.rot )*speed*2.5;

		if( this.x >= worldsize ) this.x -= worldsize*2.0;
		if( this.x <= -worldsize ) this.x += worldsize*2.0;
		if( this.y >= worldsize ) this.y -= worldsize*2.0;
		if( this.y <= -worldsize ) this.y += worldsize*2.0;

		for( var i in food )
		{
			if( food[i].alife == false ) continue;

			var fx = food[i].x;
			var fy = food[i].y;
			var bx = this.x;
			var by = this.y;
			
			if( (bx-fx)*(bx-fx)+(by-fy)*(by-fy) <= 100.0 )
			{
				food[i].alife = false;
				this.dotseaten++;
				this.foodlevel += food[i].size*2;
			}
		}

		if( this.foodlevel >= this.maxfood )
		{
			this.foodlevel -= 600;
			this.children++;
			bots.push( new neurobot( this.x, this.y, this.rot, this ) );
		}

		this.age++;
		if( this.age >= this.maxage )
			this.alife = false;

		this.foodlevel -= speed/2.5 + Math.abs( turnspeed/5.0 ) + 0.2;
		if( this.foodlevel <= 0 )
			this.alife = false;
	}
	
	this.draw = function( ctx )
	{
		ctx.save();

		ctx.translate( this.x, this.y );
		ctx.rotate( this.rot );

		var r = Math.round(this.color.r);
		var g = Math.round(this.color.g);
		var b = Math.round(this.color.b);
		ctx.fillStyle = "rgb( "+r+", "+g+", "+b+" )"

		if( ( selected != -1 ) && ( bots[selected] == this ) )
		{			
			for( var i=0; i<16; i++ )
			{
				var dir=(i-7.5)/12.0;
				lx = Math.cos( dir )*150.0;
				ly = Math.sin( dir )*150.0;

				ctx.strokeStyle = "rgba( "+Math.round(this.vision[i+16]*127+127)+", "+Math.round(this.vision[i]*127+127)+", 127, 0.25 )"

				ctx.beginPath();
				ctx.moveTo( 0, 0 );
				ctx.lineTo( lx, ly );
				ctx.stroke();
			}
		}

		if( ( selected != -1 ) && ( bots[selected] == this ) )
			ctx.strokeStyle = "rgb( 255, 0, 0 )"
		else
			ctx.strokeStyle = "rgb( 0, 0, 0 )"

		ctx.fillRect( -5, -3, 10, 6 );
		ctx.strokeRect( -5, -3, 10, 6 );

		ctx.restore();
	}
	
	this.getdata = function()
	{
		var data = "EBRAINDATA:1/5;\n";
		
		data += this.brain.layersize.toString(36) + ":" + this.brain.braindepth.toString(36) + ":" + this.generation.toString(36) + ":" + int_pack( this.mutationrate, 1.0 ) + ":";
		data += Math.round(this.color.r).toString(16) + "/" + Math.round(this.color.g).toString(16) + "/" + Math.round(this.color.b).toString(16) + ":" + this.inputneurons.toString(36) + ";\n";
		
		for( var x=0; x<this.brain.braindepth; x++ )
		{
			for( var y=0; y<this.brain.layersize; y++ )
			{
				data += int_pack( this.brain.neurons[x][y].bias, 5.0 ) + "/";
				if( x != 0 )
				{
					for( var i=0; i<this.brain.layersize; i++ )
					{
						data += int_pack( this.brain.neurons[x][y].inputweights[i], 5.0 ) + "/";
						data += int_pack( this.brain.neurons[x][y].feedbackweights[i], 5.0 ) + "/";
					}
				}
				else
				{
					for( var i=0; i<this.inputneurons; i++ )
					{
						data += int_pack( this.brain.neurons[x][y].inputweights[i], 5.0 ) + "/";
					}
				}
				data += ":";
			}
			data += ";\n"
		}

		var csdata = data.toUpperCase().replace( /[^0-9A-Z;:/-]/gm, "" );
		
		data += "!" + generate_checksum( csdata ) + "\n";

		return data.toUpperCase() + "!http://exi.wthack.de/Neurobot/";
	}
	
	this.loaddata = function( data )
	{
                this.inputneurons = 32;
		var result = { success:true, msg:"Huge Success!" };

		var rawdata = data.replace( /[^0-9A-Z!;:/-]/gm, "" ).split( "!" );

		if( rawdata.length != 3 )
			return { success:false, msg:"Wrong format" };

		if( generate_checksum( rawdata[0] ).toUpperCase() != rawdata[1] )
			return { success:false, msg:"Checksum Error" };

		if( rawdata[0].length <= 0 )
			return { success:false, msg:"There are no words there!" };

		data = rawdata[0].split( ";" );

		var header = data.shift().split( ":" );
		if( (( header[0] != "BRAINDATA" ) && ( header[0] != "EBRAINDATA" )) || ( header[1] != "1/5" ) )
			return { success:false, msg:"Broken header or invalid version" };

		var stats = data.shift().split( ":" );
		if( stats.length != 5 && stats.length != 6)
			return { success:false, msg:"Broken header" };

		this.braindepth = parseInt( stats[1], 36 );
		this.brainsize = parseInt( stats[0], 36 );
		this.generation = parseInt( stats[2], 36 );
		this.mutationrate = int_unpack( stats[3], 1.0 );

		var color = stats[4].split( "/" );
		if( color.length != 3 )
			result = { success:false, msg:"Broken color information" };

                if( stats.length == 6) {
                    this.inputneurons = parseInt( stats[5], 36 );
                }
                this.vision = new Array(this.inputneurons);
                console.log("stats:",this.braindepth, this.brainsize,this.generation,this.mutationrate,this.inputneurons);

		this.color.r = parseInt( color[0], 16 );
		this.color.g = parseInt( color[1], 16 );
		this.color.b = parseInt( color[2], 16 );

		if( result.success == false )
		{
			this.alife = false;
			return result;
		}

		if( data.length-1 != this.braindepth )
			result = { success:false, msg:"Corrupted brain data" };

                this.brain = new Brain(this.braindepth, this.brainsize, this.inputneurons, this.outputneurons);
                console.log("creating brain");

		for( var x=0; x<this.braindepth; x++ )
		{
                        console.log("layer:",x);
			var braindata = data[x].split( ":" );
			if( braindata.length-1 != this.brainsize )
				result = { success:false, msg:"Corrupted brain data" };

			for( var y=0; y<this.brainsize; y++ )
			{
                                console.log("neuron:",y);
				this.brain.neurons[x][y] = {};
				this.brain.neurons[x][y].inputweights = new Array();
				this.brain.neurons[x][y].feedbackweights = new Array();
				this.brain.neurons[x][y].activation = 0.0;
				this.brain.neurons[x][y].nextact = 0.0;

				var neurondata = braindata[y].split( "/" );

				this.brain.neurons[x][y].bias = int_unpack( neurondata[0], 5.0 );
				
				neurondata.shift();

				if( x != 0 )
				{
					if( neurondata.length-1 != this.brainsize*2 )
						result = { success:false, msg:"Corrupted brain data" };

					for( var i=0; i<this.brainsize; i++ )
					{
						this.brain.neurons[x][y].inputweights[i] = int_unpack( neurondata[i*2], 5.0 );
						this.brain.neurons[x][y].feedbackweights[i] = int_unpack( neurondata[i*2+1], 5.0 );
					}
				}
				else
				{
					if( neurondata.length-1 != this.inputneurons )
						result = { success:false, msg:"Corrupted brain data" };

					for( var i=0; i<this.inputneurons; i++ )
					{
                                                console.log("inputweight/feedbackweight:",i);
						this.brain.neurons[x][y].inputweights[i] = int_unpack( neurondata[i], 5.0 );						
						this.brain.neurons[x][y].feedbackweights[i] = 0;
					}
				}
			}
                        console.log("done", result.success, result.msg);

			if( result.success == false )
			{
				this.alife = false;
				return result;
			}
		}

                console.log("done", result.success, result.msg);
		if( result.success == false )
		{
			this.alife = false;
			return result;
		}

		this.age = 0;
		this.foodlevel = 500;

		return result;
	}

        this.kill = function() {
            delete this.brain;
        }
}

