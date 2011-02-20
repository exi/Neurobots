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

function Brain(p_braindepth, p_layersize, p_inputneurons, p_outputneurons) {
    this.neurons = new Array();
    this.braindepth = p_braindepth;
    this.layersize = p_layersize;
    this.inputneurons = p_inputneurons;
    this.outputneurons = p_outputneurons;

    for( var i = 0; i<this.braindepth; i++)
        this.neurons.push(new Array(p_layersize));

    this.mutateFromParent = function(parent, mutationrate) {
        for( var x=0; x<this.neurons.length; x++ ) {
            for( var y=0; y<this.neurons[x].length; y++ ) {
                this.neurons[x][y] = {};
                this.neurons[x][y].inputweights = new Array();
                this.neurons[x][y].feedbackweights = new Array();
                this.neurons[x][y].activation = 0.0;
                this.neurons[x][y].nextact = 0.0;

                this.neurons[x][y].bias = mutate( parent.neurons[x][y].bias, 5.0, mutationrate );

                if( x != 0 ) {
                    for( var i=0; i<this.layersize; i++ ) {
                        this.neurons[x][y].inputweights[i] = mutate( parent.neurons[x][y].inputweights[i], 5.0, mutationrate );
                        this.neurons[x][y].feedbackweights[i] = mutate( parent.neurons[x][y].feedbackweights[i], 5.0, mutationrate );
                    }
                } else {
                    for( var i=0; i<this.inputneurons; i++ ) {
                        this.neurons[x][y].inputweights[i] = mutate( parent.neurons[x][y].inputweights[i], 5.0, mutationrate );
                        this.neurons[x][y].feedbackweights[i] = 0;
                    }
                }
            }
        }
    };

    this.randomInit = function() {
        for( var x=0; x<this.neurons.length; x++ ) {
            for( var y=0; y<this.neurons[x].length; y++ ) {
                this.neurons[x][y] = {};
                this.neurons[x][y].inputweights = new Array();
                this.neurons[x][y].feedbackweights = new Array();
                this.neurons[x][y].activation = 0.0;
                this.neurons[x][y].nextact = 0.0;

                if( x != 0 ) {
                    this.neurons[x][y].bias = randinit( 5.0 );
                    for( var i=0; i<this.layersize; i++ ) {
                        this.neurons[x][y].inputweights[i] = randinit( 5.0 );
                        this.neurons[x][y].feedbackweights[i] = randinit( 5.0 );
                    }
                } else {
                    this.neurons[x][y].bias = randinit( 5.0 );
                    for( var i=0; i<this.inputneurons; i++ ) {
                        this.neurons[x][y].inputweights[i] = randinit( 5.0 );
                        this.neurons[x][y].feedbackweights[i] = 0;
                    }
                }
            }
        }
    }

    this.step = function(input) {
	for( y=0; y<this.layersize; y++ ) {
		this.neurons[0][y].nextact = this.neurons[0][y].bias;
		for( i=0; i<input.length; i++ )
			this.neurons[0][y].nextact += input[i] * this.neurons[0][y].inputweights[i];
	}
	
        for( x=1; x<this.braindepth; x++ ) {
	    for( y=0; y<this.layersize; y++ ) {
	    	this.neurons[x][y].nextact = this.neurons[x][y].bias;
	    	for( i=0; i<this.layersize; i++ ) {
                    this.neurons[x][y].nextact += this.neurons[x-1][i].activation * this.neurons[x][y].inputweights[i];
                    this.neurons[x-1][y].nextact += this.neurons[x][i].activation * this.neurons[x][y].feedbackweights[i];
	    	}
	    }
        }

        for( x=0; x<this.braindepth; x++ ) {
            for( y=0; y<this.layersize; y++ ) {
                if( this.neurons[x][y].nextact > 0.0 )
                    this.neurons[x][y].activation = this.neurons[x][y].nextact/(1.0+this.neurons[x][y].nextact);
                else
                    this.neurons[x][y].activation = 0.0;
            }
	}

        var output = new Array(this.outputneurons);

        for( var i=0; i<this.outputneurons; i++) {
            var stepsize = Math.floor(this.layersize/this.outputneurons);
            output[i] = 0;
            for( var j=i*stepsize; j<stepsize*(i+1); j++) {
                output[i] += this.neurons[this.neurons.length-1][j].activation;
            }
            output[i] /= stepsize;
        }

        return output;
    }

}
