// #hours_wasted_debugging_code = 12;

// Main Config
const site = 'https://uat.seanmcginty.space/next/';
var w = window.innerWidth;
var h = window.innerHeight;
var size = (h < w) ? h : w;
var fps = 60;
var speedMultiplier = 2;
var deadTime = 0;
var secondsElapsed = 0;
var textMargin = 10;
var fpsData = [];
var active = true; //loop //noLoop
var loadingProgress = 0;
// var loadState = false;
var loadState = true;
var numAgents = 50;
var elecRate = 50;
var reactionRate = 250;
var agents = [];
var curAgent = {};
var debug = false;
var prevMillis = 0;
var energy = 0;
var versionInfo = {
  'author' : '\r\nEthan Kealley,\r\nSean McGinty,\r\nLuke Carpenter',
  'version' : '1.0.0'
}
var button, button2, button3;
var numGenerators = 1;
var generators = [];
// In kgs
class StartingGlobals {
  constructor() {
  this.hydrogen = 200, // => 4m^2 space
  this.water = 50; // 50L in 0.05m^3
  this.oxygen = 50; // 1.4kg / m^3
  }
};
var globals = new StartingGlobals();

class Generator {
  // setting the co-ordinates, radius and the
  // speed of a particle in both the co-ordinates axes.
  // The amount of water / o that is added is equiavlent to energy and then track that energy.
  // Create graphs for current simulation activity and past simulations
    constructor() {
      // this.type = (random() >= 0.5) ? 1 : 2;
      this.amount = random(0,4) / fps;
    }

    generate() {
      if (globals.hydrogen >= ((0.008064*reactionRate) + ((elecRate/100)*reactionRate*0.004032 + 0.004032*reactionRate)) && agents.length > 0) {
        globals.water += ((0.036032*reactionRate) - ((elecRate/100)*reactionRate*0.036032))*speedMultiplier / fps;
        globals.oxygen += ((elecRate/100)*reactionRate*0.032)*speedMultiplier / fps;
        globals.hydrogen -= ((0.008064*reactionRate) + ((elecRate/100)*reactionRate*0.004032 + 0.004032*reactionRate))*speedMultiplier / fps;
        energy += ((elecRate/100 * reactionRate * 285.83) + (reactionRate * 74.85) - (reactionRate * 165))*speedMultiplier / fps;
      } else if (globals.water >= 3*globals.oxygen && agents.length > 0) {  
        globals.water -= (elecRate/100)*reactionRate*0.036032;
        globals.oxygen += (elecRate/100)*reactionRate*0.032;
        globals.hydrogen += ((elecRate/100)*reactionRate*0.004032);
        energy += ((elecRate/100) * reactionRate * 285.83)*speedMultiplier / fps;
      }
    }
}

class Agent {
  // setting the co-ordinates, radius and the
  // speed of a particle in both the co-ordinates axes.
    constructor(){
      this.x = random(0,width);
      this.y = random(0,height);
      this.r = random(10,80);
      this.xSpeed = random(-2,2);
      this.ySpeed = random(-1,1.5);
      this.water = 1;
      this.oxygen = 1;
      // this.waterLoss = 0.05 / fps * random(0,0.2);
      // this.oxygenLoss = 1 / (fps * 7.5) * random(0,1.2);
      this.waterLoss = random(2,3) / (fps * 24);
      this.oxygenLoss = random(0.75,1) / (fps * 24); // 0.84kg needed per day
      // second = hour
      this.id = uuid();
      // this.oxygenLoss = 2 * 3.75 = 7.5 which is the amount of time before an Agent needs to take another breath;
      // If reaches 0 then they die within 3s 
    }

    renderAgent() {
      noStroke();
      fill('rgba(200,169,169,0.1)');
      circle(this.x,this.y,this.r);
      fill('rgba(255,0,0,'+(1-this.oxygen)+')');
      circle(this.x,this.y,this.r);
      fill('rgba(196,0,111,'+(1-this.water)+')');
      circle(this.x,this.y,this.r);
    }
  
    moveAgent() {
      if(this.x < 0 || this.x > width)
        this.xSpeed*=-1;
      if(this.y < 0 || this.y > height)
        this.ySpeed*=-1;
      // this.x+=this.xSpeed*speedMultiplier;
      // this.y+=this.ySpeed*speedMultiplier;
      this.x+=this.xSpeed;
      this.y+=this.ySpeed;
    }

    updateStats() {
      // check globals
      if (globals.water < 0) globals.water = 0;
      if (globals.oxygen < 0) globals.oxygen = 0;
      this.oxygen -= this.oxygenLoss*speedMultiplier;
      if (this.oxygen < 0) this.oxygen = 0;
      this.water -= this.waterLoss*speedMultiplier;
      if (this.water < 0) this.water = 0;
      // if at certain level, consume global resources
      if (this.water < 0.5 && globals.water >= 0.5) {
        globals.water -= 0.5;
        this.water += 0.5;
      }
      if (this.oxygen < 0.5 && globals.oxygen >= 0.5) {
        globals.oxygen -= 0.5;
        this.oxygen += 0.5;
    }
    }
}

function uuid(){
  var dt = new Date().getTime();
  var uuid = 'xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function(c) {
      var r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c=='x' ? r :(r&0x3|0x8)).toString(16);
  });
  return uuid;
}

function globalStats() {
  let totals = {
    'water' : 0,
    'oxygen' : 0
  };
  for (let i=0; i<agents.length; i++) {
    totals.water += agents[i].water;
    totals.oxygen += agents[i].oxygen;
  }
  return totals;
}

// Ascii Loader
var asciiart_width = parseInt(size / 4)
var asciiart_height = parseInt(size / 4)
var images = [0,0];
var wesleyArt, gfx, ascii_arr, cyclic_t;

function imageLoader() {
  loadingProgress++;
  logData(`${Math.round(loadingProgress / images.length * 1000)/10}%`);
  return () => {};
}

function preload() {
  images[0] = loadImage(site+'images/wesley.png', imageLoader());
  images[1] = loadImage(site+'images/fnext.png', imageLoader());
}

function setup(reset = false) {
  if (!reset) {
    createCanvas(size, size)
    gfx = createGraphics(asciiart_width, asciiart_height);
    gfx.pixelDensity(1);
    wesleyArt = new AsciiArt(this);
    // wesleyArt.printWeightTable();
    textAlign(CENTER, CENTER); textFont('monospace', 8); textStyle(NORMAL);
    noStroke();
    frameRate(fps);
  }
  // Setup agents / generators
  for(let i = 0;i<numAgents;i++){
    agents.push(new Agent());
  }
  for(let i = 0;i<numGenerators;i++){
    generators.push(new Generator());
  }
  if (!reset) {
    logData(`Loaded in ${floor(millis())} milliseconds`);
  }
}

function draw() {
  let fontSize = "1.5rem";
  if (windowHeight <= 700) {
    fontSize = "0.7rem";
  }
  let a = $('.canvas-quarter h4');
  for (let i=0; i<a.length; i++) {
    a[i].style.fontSize = fontSize;
  }
  if (loadState) {
    background(0);
    fill(255);
    cyclic_t = millis() * 0.0002 % images.length;
    // cyclic_t = 0.1
    gfx.image(images[floor(cyclic_t)], 0, 0, gfx.width, gfx.height);
    gfx.filter(POSTERIZE, 3);
    ascii_arr = wesleyArt.convert(gfx);
    wesleyArt.typeArray2d(ascii_arr, this);
    // tint(255, pow(1.0 - (cyclic_t % 1.0), 4) * 255);
    tint(255, 0);
    // logData(`powCalc: ${(1.0-(cyclic_t % 1.0))} | pt2: ${pow(1.0 - (cyclic_t % 1.0), 4)}`)
    image(images[floor(cyclic_t)], 0, 0, width, height);
    noTint();
  } else {
    // Updates
    if (Math.floor(millis()/(1000/speedMultiplier)) != Math.floor(prevMillis/(1000/speedMultiplier))) {
      update();
    }
    prevMillis = millis();
    // alert(prevMillis)
    
    background('#0f0f0f');
    textSize(14);
    let selected = {};
    for(let i=0; i<generators.length;i++) {
      generators[i].generate();
    }

    for(let i = 0;i<agents.length;i++) {
      agents[i].moveAgent();
      // Update oxygen + water stats
      agents[i].updateStats();
      agents[i].renderAgent();
      // Check for agent interaction
      if (dist(mouseX, mouseY, agents[i].x,agents[i].y) < agents[i].r / 2) {
 
        if (mouseIsPressed) {
          if (selected.id == null) { 
            selected = agents[i];
            curAgent = selected;
          }
        } else {
          fill(0, 255, 0);
          ellipse(agents[i].x, agents[i].y, agents[i].r,agents[i].r);
        }
      }
      // check if 'dead'
      if (agents[i].oxygen == 0 || agents[i].water == 0) {
        if (curAgent.id == agents[i].id) removeActiveNode();
        agents = agents.filter(function(item) {
          return item !== agents[i]
        })
      }
    }
    if (curAgent.id != null) {
      // Draw selected agent
      fill(0, 100, 255);
      ellipse(curAgent.x, curAgent.y, curAgent.r, curAgent.r);
      fill(255, 204, 0);
      textAlign(RIGHT, TOP);
        debugText = [`Agent ID: ${curAgent.id}`, `Oxygen: ${curAgent.oxygen.toString().slice(0,10)}`, `Water: ${curAgent.water.toString().slice(0,10)}`, `Oxygen L: ${curAgent.oxygenLoss.toString().slice(0,10)}`, `Water L: ${curAgent.waterLoss.toString().slice(0,10)}`, `X Pos: ${curAgent.x.toString().slice(0,10)}`, `Y Pos: ${curAgent.y.toString().slice(0,10)}`, `X Vel: ${curAgent.xSpeed.toString().slice(0,10)}`, `Y Vel: ${curAgent.ySpeed.toString().slice(0,10)}`, `Size: ${curAgent.r.toString().slice(0,10)}`];
        if (!debug) debugText = debugText.slice(0,3)
        for (let i=0;i<debugText.length;i++) {
          text(debugText[i],size-textMargin,(i+((debug) ? 6 : 0))*20+textMargin) 
        }
    }
    fill(255, 204, 0);
    if (debug) {
      textAlign(LEFT, TOP);
      drawFPS();
      debugText = [`True: ${Math.floor(frameRate())}`, `Delta: ${deltaTime.toString().slice(0,10)}`, `Active: ${isLooping()}`, `Focused: ${focused}`, `Dev Res: ${displayWidth}x${displayHeight}`, `Sim Res: ${windowWidth}x${windowHeight}`, `DS Dens: ${displayDensity()}`, `PX Dens: ${pixelDensity()}`, `Version: ${versionInfo.version}`, `Authors: ${versionInfo.author}`];
      for (let i=0;i<debugText.length;i++) {
        text(debugText[i],textMargin,(i+1)*20+textMargin)
      }
      textAlign(RIGHT, TOP);
      let totals = globalStats();
      text(`Average Oxygen: ${((agents.length == 0) ? 0 : (totals.oxygen/agents.length).toString().slice(0,10))}`,size-textMargin,textMargin)
      text(`Average Water: ${((agents.length == 0) ? 0 : (totals.water/agents.length).toString().slice(0,10))}`,size-textMargin,20+textMargin)
      text(`Available Oxygen: ${(globals.oxygen).toString().slice(0,10)}`,size-textMargin,40+textMargin)
      text(`Available Water: ${(globals.water).toString().slice(0,10)}`,size-textMargin,60+textMargin)
      text(`Available Hydrogen: ${(globals.hydrogen).toString().slice(0,10)}`,size-textMargin,80+textMargin)
      text(`Agents Alive: ${agents.length}`,size-textMargin,100+textMargin)
    }
  }
}

function removeActiveNode() {
  curAgent = {};
}

function toggleSim() {
  if (isLooping()) {
    noLoop();
  } else {
    loop();
  }
}

function drawFPS(duration) {
  let avgFps = 0;
  
  fpsData.push(frameRate());
  if (fpsData.length > fps*duration) { fpsData.splice(0, 1); }
  
  for (let i = 0; i < fpsData.length; i++) {
    avgFps += fpsData[i];
  }
  avgFps = avgFps/fpsData.length;
  
  push();
    fill(255, 204, 0);
    text("FPS: "+int(avgFps), textMargin, textMargin);
  pop();
}

// function mouseReleased() {
//  logData(wesleyArt.convert2dArrayToString(ascii_arr));
// }

function mouseClicked() {
  loadState = false;
}

typeArray2d = function(_arr2d, _dst, _x, _y, _w, _h) {
  if(_arr2d === null) {
    logData('[typeArray2d] _arr2d === null');
    return;
  }
  if(_arr2d === undefined) {
    logData('[typeArray2d] _arr2d === undefined');
    return;
  }
  switch(arguments.length) {
    case 2: _x = 0; _y = 0; _w = width; _h = height; break;
    case 4: _w = width; _h = height; break;
    case 6: /* nothing to do */ break;
    default:
      logData(
        '[typeArray2d] bad number of arguments: ' + arguments.length
      );
      return;
  }

  if(_dst.canvas === null) {
    logData('[typeArray2d] _dst.canvas === null');
    return;
  }
  if(_dst.canvas === undefined) {
    logData('[typeArray2d] _dst.canvas === undefined');
    return;
  }
  var temp_ctx2d = _dst.canvas.getContext('2d');
  if(temp_ctx2d === null) {
    logData('[typeArray2d] _dst canvas 2d context is null');
    return;
  }
  if(temp_ctx2d === undefined) {
    logData('[typeArray2d] _dst canvas 2d context is undefined');
    return;
  }
  var dist_hor = _w / _arr2d.length;
  var dist_ver = _h / _arr2d[0].length;
  var offset_x = _x + dist_hor * 0.5;
  var offset_y = _y + dist_ver * 0.5;
  for(var temp_y = 0; temp_y < _arr2d[0].length; temp_y++)
    for(var temp_x = 0; temp_x < _arr2d.length; temp_x++)
      /*text*/temp_ctx2d.fillText(
        _arr2d[temp_x][temp_y],
        offset_x + temp_x * dist_hor,
        offset_y + temp_y * dist_ver
      );
}

window.onresize = function() {
  w = window.innerWidth;
  h = window.innerHeight;  
  size = (h < w) ? h : w;
  resizeCanvas(size, size);
}

// Back Canvas
var backCanvas = function( sketch ) {
  sketch.setup = function() {
    let canvas1 = sketch.createCanvas(w, h);
    canvas1.position(0,0);
    canvas1.style('z-index',-1)
    sketch.frameRate(fps);
  }
  sketch.draw = function() {
    //for canvas 1
    sketch.background(getComputedStyle(document.body).getPropertyValue("--background"));
  }

  sketch.windowResized = function() {
      sketch.resizeCanvas(w, h);
  }
};

new p5(backCanvas);

// Charts


$(document).ready(function(){
  function createChart(HeaderLabel, chartID, labelColor = '#ff5050', special = false, energyCheck = false) {
  var labels = [];
  let sugMin = 0;
  let sugMax = 1;
  if (energyCheck) {
    let tmp = new StartingGlobals().hydrogen;
    sugMin = (tmp*14304*380 + (tmp*1000/2.016/4*44.01/1000)*839*380 + (tmp*1000/2.016/4*16.042/1000)*2225.4*800) / 1000;
    sugMax = sugMin + 1;
  }
  let ds = [{
    label: HeaderLabel,
    backgroundColor: labelColor,
    borderColor: labelColor,
    data: [],
    fill: false,
    lineTension: 0,
  }]
  if (special) {
    ds.push({
      label: 'Average Water',
      backgroundColor: 'blue',
      borderColor: 'blue',
      data: [],
      fill: false,
      lineTension: 0,
    })
    ds[0].label = 'Average Oxygen';
  }
  var config = {
      type: 'line',
      
      data: {
          labels: labels,
          datasets: ds
      },
      options: {
          responsive: true,
          bezierCurve: false,
          tooltips: {
              mode: 'index',
              intersect: false,
          },
          elements: {
              point: {
                  radius: 0
              }
          },
          animation: {
              duration: 0  
          },
          legend: {
              display: false
          },
          hover: {
              mode: 'nearest',
              intersect: false
          },
          tooltips: {
              callbacks: {
                 title: function(t, d) {
                    return "Time: "+d.labels[t[0].index]+" hours";
                 }
              }
           },
           
          scales: {
              xAxes: [{
                  display: true,
                  scaleLabel: {
                      display: true,
                      labelString: 'Hours',
                      fontColor: '#cacaca'
                  },
                  ticks: {
                      fontColor: '#cacaca'
                  }
              }],
              yAxes: [{
                  display: true,
                  scaleLabel: {
                      display: true,
                      labelString: HeaderLabel,
                      fontColor: '#cacaca'
                  },
                  ticks: {
                      suggestedMin: sugMin,
                      suggestedMax: sugMax,
                      fontColor: '#cacaca',
                      maxTicksLimit: 5
                  }
              }]
          }
      }
  };

      var ctx = document.getElementById(chartID).getContext('2d');
      return new Chart(ctx, config);
    }
    window.chart1 = createChart('Agents','chart-1','#ff0000');
    window.chart2 = createChart('Mass (kg)','chart-2','#00ff00');
    window.chart3 = createChart('Mass (kg)','chart-3','blue');
    window.chart4 = createChart('Hydrogen (kg)','chart-4');
    window.chart5 = createChart('Averages','chart-5','#00ff00',true);
    window.chart6 = createChart('Energy (kJ)','chart-6','yellow',false,true);
})

function update() {
  if (isLooping()) {
    window.chart1.data.datasets[0].data.push(agents.length);
    window.chart2.data.datasets[0].data.push(Math.round(globals.oxygen*1000)/1000);
    window.chart3.data.datasets[0].data.push(Math.round(globals.water*1000)/1000);
    window.chart4.data.datasets[0].data.push(Math.round(globals.hydrogen*1000)/1000);
    window.chart5.data.datasets[0].data.push(((agents.length == 0) ? 0 : (globalStats().oxygen/agents.length).toString().slice(0,5)));
    window.chart5.data.datasets[1].data.push(((agents.length == 0) ? 0 : (globalStats().water/agents.length).toString().slice(0,5)));
    if (secondsElapsed == 0) {
      let BeginningHydrogenValue = new StartingGlobals().hydrogen;
      energy = ((BeginningHydrogenValue*14304*380 + (BeginningHydrogenValue*1000/2.016/4*44.01/1000)*839*380 + (BeginningHydrogenValue*1000/2.016/4*16.042/1000)*2225.4*800) / 1000);
    }
    window.chart6.data.datasets[0].data.push(energy)
    window.chart1.data.labels.push(secondsElapsed);
    window.chart1.update();
    window.chart2.data.labels.push(secondsElapsed);
    window.chart2.update();
    window.chart3.data.labels.push(secondsElapsed);
    window.chart3.update();
    window.chart4.data.labels.push(secondsElapsed);
    window.chart4.update();
    window.chart5.data.labels.push(secondsElapsed);
    window.chart5.update();
    window.chart6.data.labels.push(secondsElapsed);
    window.chart6.update();
    secondsElapsed++;
    if (agents.length > 0) {
      deadTime = secondsElapsed;
    }
  }
}

function logData(msg) {
  console.log(
    "%cInfo%c "+msg,
    "background: #ff0000; color: #fff; border-radius: 3px; padding: 3px",""
  );
}

function delaydismiss() {
  setTimeout(() => {
    dismiss();
  }, 500);
}

function dismiss() {
  $('#fs').fadeOut();
}

// Initial Load 
if((window.fullScreen) || (window.innerWidth == screen.width && window.innerHeight == screen.height)) {
  logData('Already in full screen')
  document.getElementById('fs').style.display = 'none';
}

function toggleDebugMode() {
  debug = !debug;
}


function toggleFullscreen(event) {
  var element = document.body;

	if (event instanceof HTMLElement) {
		element = event;
	}

	var isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || false;

	element.requestFullScreen = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || function () { return false; };
	document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || function () { return false; };

	isFullscreen ? document.cancelFullScreen() : element.requestFullScreen();
}

function updateSpeed(amount) {
  if (amount >= 60) amount=60;
  if (amount < 0) amount=0;
  speedMultiplier = amount;
  document.getElementById('speed').value = speedMultiplier;
  document.getElementById('speedValue').value = speedMultiplier;
  if(speedMultiplier == 0) {
    noLoop();
  } else {
    loop();
  }
}

function updateAgents(amount) {
  if (amount >= 1000) amount=1000;
  if (amount < 0) amount=0;
  numAgents = amount;
  document.getElementById('agents').value = numAgents;
  document.getElementById('agentValue').value = numAgents;
  reset();
}

function updateRate(amount) {
  if (amount >= 1000) amount=1000;
  if (amount < 0) amount=0;
  reactionRate = amount;
  document.getElementById('rate').value = reactionRate;
  document.getElementById('rateValue').value = reactionRate;
  reset();
}

function updateElec(amount) {
  if (amount >= 100) amount=100;
  if (amount < 0) amount=0;
  elecRate = amount;
  document.getElementById('elec').value = elecRate;
  document.getElementById('elecValue').value = elecRate;
  reset();
}

function updateStart(amount, type) {
  if (amount >= 2000) amount=2000;
  if (amount < 0) amount=0;
  if (type == 1) {
    document.getElementById('startingOxygen').value = parseInt(amount);
  } else if (type == 2) {
    document.getElementById('startingWater').value = parseInt(amount);
  } else {
    globals.hydrogen = document.getElementById('startingHydrogen').value = parseInt(amount);
  }
  reset(true);
}

function reset(typeChange = false) {
  // Charts
  chart1.data.labels = [];
  chart1.data.datasets[0].data = [];
  chart2.data.labels = [];
  chart2.data.datasets[0].data = [];
  chart3.data.labels = [];
  chart3.data.datasets[0].data = [];
  chart4.data.labels = [];
  chart4.data.datasets[0].data = [];
  chart5.data.labels = [];
  chart5.data.datasets[0].data = [];
  chart5.data.datasets[1].data = [];
  chart6.data.labels = [];
  chart6.data.datasets[0].data = [];
  // Vars
  agents = [];
  generators = [];
  setup(true);
  secondsElapsed = 0;
  prevMillis = 0;
  globals = new StartingGlobals();
  if (typeChange) {
    globals.oxygen = parseInt(document.getElementById('startingOxygen').value);
    globals.water = parseInt(document.getElementById('startingWater').value);
    globals.hydrogen = parseInt(document.getElementById('startingHydrogen').value);
  }
  removeActiveNode();
}

function exportData() {
  var sheet_1_data = [];
  for (let i=0; i<secondsElapsed;i++) {
    sheet_1_data.push({
      'Time (hours)': i,
      'Agents Alive': chart1.data.datasets[0].data[i],
      'Oxygen Avaialable': chart2.data.datasets[0].data[i],
      'Water Avaialable': chart3.data.datasets[0].data[i],
      'Hydrogen Avaialable': chart4.data.datasets[0].data[i],
      'Water Average': chart5.data.datasets[0].data[i],
      'Oxygen Average': chart5.data.datasets[1].data[i],
      'Energy': chart6.data.datasets[0].data[i]
    })
  }
  var sheet_2_data = [{
    'Authors': 'Ethan Kealley',
    'Total Time': secondsElapsed,
    'Alive Time': deadTime,
    'Starting Agents': numAgents,
    'Rate of Reaction': reactionRate,
    'Rate of Electrolysis': elecRate,
    'Starting Oxygen': parseInt(document.getElementById('startingOxygen').value),
    'Starting Water': parseInt(document.getElementById('startingWater').value),
    'Starting Hydrogen': parseInt(document.getElementById('startingHydrogen').value)
  }, {
    'Authors': 'Sean McGinty'
  }, {
    'Authors': 'Luke Carpenter'
  }
];
  var opts = [{sheetid:'Data',header:true},{sheetid:'Simulation',header:false}];
  var result = alasql('SELECT * INTO XLSX("DS-Space-'+new Date().toTimeString().slice(0,8)+" "+new Date().toLocaleDateString("en-US")+'.xlsx",?) FROM ?', [opts,[sheet_1_data,sheet_2_data]]);
}

document.getElementById('speed').value = speedMultiplier;
document.getElementById('speedValue').value = speedMultiplier;
document.getElementById('agents').value = numAgents;