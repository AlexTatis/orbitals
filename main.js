canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
time = 0;
rydberg_cost = 10967758.3141;
color_codes = ["#FF0000", "#00F6FF", "#39FF00", "#FF00F7"];


function clearCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function orbital(frequency){
    output = [];
    initial_orbital = document.getElementById("starting-orbital").value;
    atomic_number = document.getElementById("atomic-number").value;
    
    console.log(initial_orbital)
    //output[0] = Math.sqrt(4*rydberg_cost/(rydberg_cost-4*frequency)).toPrecision(7);          
    //output[0] = Math.floor(Math.sqrt((initial_orbital**2)*rydberg_cost/(rydberg_cost-(initial_orbital**2)*frequency)).toPrecision(7));   
    output[0] = Math.floor(Math.sqrt((initial_orbital**2*rydberg_cost*atomic_number**2)/(rydberg_cost*atomic_number**2-initial_orbital**2*frequency)).toPrecision(7));  //That's the orbital that electron will land in
    output[1] = ((10**9)*((atomic_number**2*rydberg_cost*(1/(initial_orbital**2)-(1/output[0]**2)))**-1)).toPrecision(7);                                               //That's the wavelength of the absorbed spectrum
    output[2] = (1/frequency*10**9).toPrecision(7);                                                                                                                     //Wavelength of the photon
    output[3] = output[1]-output[2];                                                                                                                                    //Wavelenth of the emmited photon
    return output;
    
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function setColor(wavelength, particle){
    /* 
        https://www.desmos.com/calculator/d1dxkna6op
    */
    blue = 255*Math.E**(-1*((wavelength-430)**2/(2*60**2)));    //Gaussian function for blue
    green = 255*Math.E**(-1*((wavelength-540)**2/(2*55**2)));   //Gaussian function for green
    red = 255*Math.E**(-1*((wavelength-600)**2/(2*43**2)));     //Gaussian function for red
    if(wavelength <= 415 && wavelength >= 380){
        red = 126;
        green = 0;
        blue = 219;
    } else if(wavelength <= 700 && wavelength >= 650){
        red = 255;
        green, blue = 0;
    }
    particle.color = `rgb(${red}, ${green}, ${blue})`;
    console.log(`rgb(${red}, ${green}, ${blue})`);
}

Electron = function(x, y) {
    this.x = x;
    this.y = y;
    this.excited = false;
    this.color;
    this.gotexcited = 0;
    this.draw = () => {
        ctx.save();
        ctx.beginPath();
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
        ctx.fillStyle = this.excited ? color_codes[getRndInteger(0, 3)] : this.color;
        ctx.arc(this.x, this.y, 100, 0, 2*Math.PI);
        ctx.fill();
        ctx.restore();
    }
}

Photon = function (x, y, wavelength){
    this.x = x;
    this.y = y;
    this.finished = false;
    this.wavelength = wavelength;
    this.draw = () => {
        ctx.save();
        ctx.beginPath();
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
        ctx.fillStyle = color_codes[getRndInteger(0, 3)];
        ctx.arc(this.x, this.y, 10, 0, 2*Math.PI);
        ctx.fill();
        ctx.restore();
    }
}

electron = new Electron(window.innerWidth/2, window.innerHeight/2);

setInterval(() => {
    clearCanvas();
    electron.draw();
    try{
        if(photon.y < (window.innerHeight/2) && !photon.finished){
            photon.draw();
            photon.x += 7;
            photon.y = photon.x*(window.innerHeight/2)/(window.innerWidth/2);
    
        } else {
            //electron.excited = true;
            electron.gotexcited = time;
            photon.finished = true;
            console.log((1/photon.wavelength)*10**9);
            console.log(orbital((1/photon.wavelength)*10**9));
    
            if(!Number.isNaN(orbital((1/photon.wavelength)*10**9)[0]) && orbital((1/photon.wavelength)*10**9)[0] != Infinity){
                document.getElementById("final-orbital-output").innerHTML = "Orbital final: "+ orbital((1/photon.wavelength)*10**9)[0];
            }else{
                document.getElementById("final-orbital-output").innerHTML = "Orbital final: No-determinado";
            }
            
            if(orbital((1/photon.wavelength)*10**9)[1] != "NaN" && orbital((1/photon.wavelength)*10**9)[1] != "Infinity"){
                document.getElementById("emitted-wavelength").innerHTML = "λ emitida: "+ orbital((1/photon.wavelength)*10**9)[1];
            }else{
                document.getElementById("emitted-wavelength").innerHTML = "λ emitida: No-determinado";
            }
    
            if(orbital((1/photon.wavelength)*10**9)[1] <= 300 && orbital((1/photon.wavelength)*10**9)[1] != "Infinity"){
                document.getElementById("spectrum").innerHTML = "Color: Ultravioleta";
            }else if(orbital((1/photon.wavelength)*10**9)[1] >= 780 && orbital((1/photon.wavelength)*10**9)[1] != "Infinity"){
                document.getElementById("spectrum").innerHTML = "Color: Infrarrojos";
            }else if(orbital((1/photon.wavelength)*10**9)[1] != "NaN" && orbital((1/photon.wavelength)*10**9)[1] != "Infinity"){
                document.getElementById("spectrum").innerHTML = "Color: Visible";
            }else{
                document.getElementById("spectrum").innerHTML = "Color: No-determinado";
            }
    
            //setColor(orbital((1/photon.wavelength)*10**9)[3] != 0 ? orbital((1/photon.wavelength)*10**9)[3]: photon.wavelength, electron);  
            setColor(orbital((1/photon.wavelength)*10**9)[1], electron);
            if(photon.y > 0){
                photon.draw();
                photon.x += 7;
                photon.y = photon.x*((-1*window.innerHeight/2)/(window.innerWidth/2))+window.innerWidth/2;
            
            }
        }
    }catch(error){
        console.log("Waiting for photon creation...")
    }
    
    time += 1/60;
}, 1000/60)