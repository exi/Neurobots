
function Floor(size,canvas) {
    this.size = size;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.map = new Array(this.size*this.size);
    this.tick = 0;

    this.init = function() {
        this.resetImage();
        for( var x = 0; x<this.size; x++) 
            for( var y = 0; y<this.size; y++) 
                this.set(x,y,0,0,true);
        this.modified();
    }

    this.reset = function() {
        this.resetImage();
        this.modified();
        this.tick = 0;
    }

    this.resetImage = function() {
        this.image = this.ctx.getImageData(0,0,this.size,this.size);
    }
    
    this.modified = function() {
        this.ctx.putImageData(this.image,0,0);
    }

    this.get = function(x,y) {
        if(x>=this.size) x = x % this.size;
        if(y>=this.size) y = y % this.size;
        return this.map[x*this.size+y];
    }

    this.set = function(x,y,value,area,dontblit) {
        if(x>=this.size) x = x % this.size;
        if(y>=this.size) y = y % this.size;
        this.map[x*this.size+y] = value;
        var c = Math.floor((1-value)*127*0.6);
        this.setPixel(x,y,c,c,0,0xff);

        if(area > 0) {
            var mdist = Math.sqrt(Math.pow(area,2)+Math.pow(area,2))
            for( var nx = x - area; nx < x+area; nx++ )
                for( var ny = y - area; ny < y+area; ny++ ) {
                    d = Math.sqrt(Math.pow(nx-x,2)+Math.pow(ny-y,2));
                    this.set(nx,ny,this.get(nx,ny) + value*(mdist-d)/mdist/4,0,true);
                }
        }

        if(dontblit)
            return;
        
        this.modified();   
    }

    this.imageUpdate = function() {
        for( var x = 0; x<this.size; x++) 
            for( var y = 0; y<this.size; y++) 
                this.set(x,y,this.get(x,y),0,true);
        this.modified();
    }

    this.setPixel = function setPixel(x, y, r, g, b, a) {
        index = (x + y * this.image.width) * 4;
        this.image.data[index+0] = r;
        this.image.data[index+1] = g;
        this.image.data[index+2] = b;
        this.image.data[index+3] = a;
    }

    this.step = function() {
        this.tick++;
        if (this.tick >= 500) {
            this.smoothMap();
            this.tick = 0;
        }
    }

    this.smoothMap = function() {
        for( var x = 0; x<this.size; x++) 
            for( var y = 0; y<this.size; y++) 
                this.map[x*this.size+y] = this.get(x,y) * 0.95;
        this.imageUpdate();
    }
}
