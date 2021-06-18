
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta property="og:title" content="DS-Space" />
  <meta
    property="og:image"
    content="https://seanmcginty.space/assets/images/favicon/favicon.ico"
  />
  <meta property="og:locale" content="en_US" />
  <meta
    property="og:description"
    content="An open-source site to simulate oxygen and water management."
  />
  <meta
    property="og:author"
    content="Sean McGinty"
  />

  <link
    rel="icon"
    type="image/png"
    href="https://seanmcginty.space/assets/images/favicon/favicon.ico"
  />
  
  <link rel="stylesheet" href="./css/style.css" />
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" />

  <!-- Scripts -->
  <script
    src="https://code.jquery.com/jquery-3.6.0.js"
    integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk="
    crossorigin="anonymous"
  ></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.min.js"></script>
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"
    integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
    crossorigin="anonymous"
  ></script>
  <script
    src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"
    integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
    crossorigin="anonymous"
  ></script>
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
    rel="stylesheet"
  />

  <title>DS-Space | Simulation</title>
</head>

  <body>
    <div id="fs">
      <h2>Please use fullscreen mode to properly experience this simulation.</h2>
      <span>
        <button onclick="dismiss();" class="button">Ignore</button>
        <button onclick="toggleFullscreen(); delaydismiss();" class="button">Fullscreen</button>
      </span>
    </div>
    <div class="chart-container chart-container-l">
      <div class="canvas-quarter">
        <h4>Agents Alive</h4>
        <canvas id="chart-1"></canvas>
      </div>
      <div class="canvas-quarter">
        <h4>Oxygen Available</h4>
        <canvas id="chart-2"></canvas>
      </div>
      <div class="canvas-quarter">
        <h4>Water Available</h4>
        <canvas id="chart-3"></canvas>
      </div>
      <div class="canvas-quarter">
        <h4>Hydrogen Available</h4>
        <canvas id="chart-4" class="cont-l"></canvas>
      </div>
    </div>
    <div class="chart-container chart-container-r">
      <div class="canvas-quarter">
        <h4>Averages</h4>
        <canvas id="chart-5"></canvas>
      </div>
      <div class="canvas-quarter">
        <h4>Energy</h4>
        <canvas id="chart-6"></canvas>
      </div>
      <div class="canvas-quarter no-canvas">
        <h4>Simulation Settings</h4>
        <div id="simsettings">
          <div class="input-cont">
            <p>Agents: </p>
            <input onchange="updateAgents(this.value);" type="range" min="1" max="1000" value="100" class="slider" id="agentValue">
            <input onchange="updateAgents(this.value);" type="number" min="1" max="1000" value="100" id="agents">
          </div>
          <div class="input-cont">
            <p>Speed: </p>
            <input onchange="updateSpeed(this.value);" type="range" min="0" max="60" value="50" class="slider" id="speedValue">
            <input onchange="updateSpeed(this.value);" type="number" min="0" max="60" value="10" id="speed">
          </div>  
          <div class="input-cont">
            <p>Rate of reaction: </p>
            <input onchange="updateRate(this.value);" type="range" min="0" max="1000" value="250" class="slider" style="width: 70px;" id="rateValue">
            <input onchange="updateRate(this.value);" type="number" min="0" max="1000" value="250" id="rate">
          </div>  
          <div class="input-cont">
            <p>Rate of electrolysis: </p>
            <input onchange="updateElec(this.value);" type="range" min="0" max="100" value="50" class="slider" style="width: 50px;" id="elecValue">
            <input onchange="updateElec(this.value);" type="number" min="0" max="100" value="50" id="elec">
          </div>  
          <div class="input-cont">
            <p>Starting: </p>
            <input onchange="updateStart(this.value,1);" type="number" min="0" max="2000" value="50" id="startingOxygen">|
            <input onchange="updateStart(this.value,2);" type="number" min="0" max="2000" value="50" id="startingWater">|
            <input onchange="updateStart(this.value,3);" type="number" min="0" max="2000" value="200" id="startingHydrogen">
          </div>  
        </div>
      </div>
      <div class="canvas-quarter no-canvas">
        <div id="controls">
          <button onclick="toggleSim();" class="button">Pause</button>
          <button onclick="toggleFullscreen();" class="button">Toggle Fullscreen</button>
          <button onclick="removeActiveNode();" class="button">Remove Active</button>
          <button onclick="reset();" class="button">Reset</button>
          <button onclick="toggleDebugMode();" class="button">Toggle Debug Mode</button>
          <button onclick="exportData();" class="button">Export</button>
        </div>
      </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.3.1/lib/p5.js"></script>
    <script src="./js/p5.asciiart.js"></script>
    <script src="./js/simulation.js<?='?v=1.0.2';?>"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.min.js"></script>
    <script src="https://cdn.jsdelivr.net/alasql/0.3/alasql.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.7.12/xlsx.core.min.js"></script>
  </body>