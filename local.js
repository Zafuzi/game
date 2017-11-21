var boxPos = 10,
    boxVelocity = 0.08,
    limit = window.innerWidth,
    lastFrameTimeMs = 0,
    maxFPS = 120,
    delta = 0,
    timestep = 1000 / maxFPS,
    fps = maxFPS,
    framesThisSecond = 0,
    lastFpsUpdate = 0,
    mouseX = 0,
    mouseY = 0,
    mouseMoved = false
    objects = []

// Empty function to add to global mousemove event
// Can be changed to affect the behavior of objects
function objectCode(){}

/*********************************************
  CLASSES FUNCTIONS
***********************************************/
var svgns = "http://www.w3.org/2000/svg";
class Button{
  constructor(id, name, enable_drag, svgType, parentContainer){
    this.id = id
    this.name = name
    this.enable_drag = enable_drag;
    this.elem = document.createElementNS(svgns, svgType);
    this.elem.classList.add('button')
    let base  = document.createElementNS(svgns, 'svg')
    base.appendChild(this.elem)
    document.getElementById(parentContainer || 'container').appendChild(base)
    this.init()
  }
  init(){
    let self = this;
    self.elem.addEventListener('mouseover', function(){
      self.elem.setAttributeNS(null, 'stroke-width', 2)
      self.elem.setAttributeNS(null, 'stroke', '#29B6F6');
    })
    self.elem.addEventListener('mouseleave', function(){
      self.elem.setAttributeNS(null, 'stroke', 'none');
    })
    if(self.enable_drag){
      self.elem.addEventListener('mouseup', function(e){
        objectCode = function(){}
        let bounds = self.elem.getBoundingClientRect();
        if(bounds.x - 5 < 200){
          self.elem.remove()
        }
      })
    }
  }
  click(cb){
    let self = this
    let elem = self.getElement()
    elem.onclick = cb
  }
  drag(x,y){
    let self = this
    let xVal = 'x', yVal = 'y'
    switch(self.elem.tagName.toLowerCase()){
      case 'circle':
        self.elem.setAttributeNS(null, 'cx', mouseX - (self.elem.getAttributeNS(null, "radius") / 2) )
        self.elem.setAttributeNS(null, 'cy', mouseY - (self.elem.getAttributeNS(null, "radius") / 2) )
        break
      case 'rect':
        self.elem.setAttributeNS(null, 'x', mouseX - (self.elem.getBBox().width / 2) )
        self.elem.setAttributeNS(null, 'y', mouseY - (self.elem.getBBox().height / 2) )
        break
      // Triangle
      case 'polygon':
        let points = self.elem.getAttributeNS(null, 'points').split(' ').map(p => { return p.split(',').map(i => { return parseInt(i)})})
        points[0][0] = mouseX
        points[0][1] = mouseY - self.hw/2
        points[1][0] = mouseX - (self.hw/2)
        points[1][1] = mouseY + (self.hw/2)
        points[2][0] = mouseX + self.hw/2
        points[2][1] = mouseY + self.hw/2
        let pointString = ""
        for(let p in points){
          pointString += points[p][0] + "," + points[p][1] + " "
        }
        self.elem.setAttributeNS(null, 'points', pointString.trim())
        break
    }

    //console.log(self.elem.getAttributeNS(null, "cx"))
  }
  getElement(){
    let self = this
    return document.getElementById(self.id)
  }
}

class Box extends Button{
  constructor(id, name, height, width, bgColor, position, canInstance){
    super(id, name, true, 'rect', 'container')
    this.position = position
    this.height = height
    this.width = width
    this.bgColor = bgColor
    this.canInstance = canInstance

    this.elem.setAttributeNS(null, 'x', position.x);
    this.elem.setAttributeNS(null, 'y', position.y);
    this.elem.setAttributeNS(null, 'height', height);
    this.elem.setAttributeNS(null, 'width', width);
    this.elem.setAttributeNS(null, 'fill', bgColor);
    this.elem.style.height = height
    this.elem.style.width = width

    this.elem.classList.add('box')

    let self = this;
    this.elem.addEventListener('mousedown', function(){
      if(self.canInstance){
        let newb = new Box('b', 'b', self.height, self.width, self.bgColor, self.position, false)
        objects.push(newb)
        objectCode = function(e){
          newb.drag(mouseX, mouseY)
        }
        console.log("CAN INSTANCE")
      }else{
        objectCode = function(e){
          self.drag(mouseX, mouseY)
        }
      }
    })
  }
}

class Circle extends Button{
  // canInstance means this object creates a new instance when mousedown and drag
  constructor(id, name, radius, bgColor, position, canInstance){
    super(id, name, true, 'circle', 'container')
    this.position = position
    this.radius = radius
    this.bgColor = bgColor
    this.canInstance = canInstance

    this.elem.setAttributeNS(null, 'cx', position.x);
    this.elem.setAttributeNS(null, 'cy', position.y);
    this.elem.setAttributeNS(null, 'r', radius);
    this.elem.setAttributeNS(null, 'fill', bgColor);

    this.elem.classList.add('circle')
    let self = this;

    this.elem.addEventListener('mousedown', function(){
      if(self.canInstance){
        let newc = new Circle('a', 'a', self.radius, self.bgColor, self.position, false)
        objects.push(newc)
        objectCode = function(e){
          newc.drag(mouseX, mouseY)
        }
        console.log("CAN INSTANCE")
      }else{
        objectCode = function(e){
          self.drag(mouseX, mouseY)
        }
      }
    })
  }
}

class Triangle extends Button{
  constructor(id, name, points, bgColor, hw, canInstance){
    super(id, name, true, 'polygon', 'container')
    this.points = points
    this.hw = hw
    this.bgColor = bgColor
    this.canInstance = canInstance

    this.elem.setAttributeNS(null, 'points', points);
    this.elem.setAttributeNS(null, 'fill', bgColor);

    this.elem.classList.add('circle')

    let self = this;
    this.elem.addEventListener('mousedown', function(){
      if(self.canInstance){
        let newt = new Triangle('t', 't', self.points, self.bgColor, self.hw, false)
        objects.push(newt)
        objectCode = function(e){
          newt.drag(mouseX, mouseY)
        }
        console.log("CAN INSTANCE")
      }else{
        objectCode = function(e){
          self.drag(mouseX, mouseY)
        }
      }
    })
    this.elem.addEventListener('mouseup', function(){
      let bounds = self.elem.getBoundingClientRect();
      if(bounds.x - 5 < 200){
        self.elem.setAttributeNS(null, 'points', self.points)
      }
    })
  }
}

//const fpsDisplay = new Button('fpsDisplay', "FPS Display", false);

// fpsDisplay.click(e => {
//   console.log("FPS Clicked")
// })
// fpsDisplay.getElement().style.color = "#fff"

function init(){
  objectCode = function(){return}
  document.onmousemove = handleMouseMove

  let shelf = document.createElementNS(svgns, 'rect');
  shelf.setAttributeNS(null, 'x', 0);
  shelf.setAttributeNS(null, 'y', 0);
  shelf.setAttributeNS(null, 'width', 200)
  shelf.setAttributeNS(null, 'height', window.innerHeight)
  shelf.setAttributeNS(null, 'fill', 'rgba(0,0,0,.18)')
  document.getElementById("container").appendChild(shelf)

  objects.push(new Box('box1', 'Box 1', 50, 50, '#eee', {x: 10, y: 70}, true) )
  objects.push(new Box('solarPanel1', 'Solar Panel', 200, 50, '#90A4AE', {x: 10, y: 130}, true) )
  objects.push(new Circle('circle1', 'Circle 1', 25, '#eee', {x: 95, y: 95}, true) )
  objects.push(new Triangle('triangle1', 'Triangle 1', "155,70 130,120 180,120", '#eee', 50, true) )
}

function startUpdate(e){
  limit = window.innerWidth

}
function update(delta) {
    boxPos += boxVelocity * delta;
    // Switch directions if we go too far
    if (boxPos >= limit - 50 || boxPos <= 0) boxVelocity = -boxVelocity;
    endUpdate()
}
function endUpdate(){
}

function draw() {
    //box.style.left = (mouseX - 25) + 'px'
    //box.style.top = (mouseY - 25) + 'px'
    //fpsDisplay.getElement().textContent = Math.round(fps) + ' FPS'; // display the FPS
}

function panic() {
    delta = 0;
    console.log("PANIC")
}

/*********************************************
  MOUSE FUNCTIONS
***********************************************/

function handleMouseMove(e){
  let dot, eventDoc, doc, body, pageX, pageY;
  // If pageX/Y is null and clientX/Y is not
  // XXX OLD IE support / Probably not needed
  if(e.pageX == null && e.clientX != null){
    eventDoc = (e.target && e.target.ownerDocument) || document
    doc = eventDoc.documentElement
    body = eventDoc.body
    mouseX = e.clientX +
      (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
      (doc && doc.clientLeft || body && body.clientLeft || 0)
    mouseY = e.clientY +
      (doc && doc.scrollTop || body && body.scrollTop || 0) -
      (doc && doc.clientTop || body && body.clientTop || 0)
  }
  mouseX = e.pageX
  mouseY = e.pageY
  objectCode();
}

function mainLoop(timestamp) {
    // Throttle the frame rate.
    if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
        requestAnimationFrame(mainLoop);
        return;
    }
    delta += timestamp - lastFrameTimeMs;
    lastFrameTimeMs = timestamp;
    // Update
    var numUpdateSteps = 0;
    while (delta >= timestep) {
        startUpdate();
        update(timestep);
        delta -= timestep;
        if (++numUpdateSteps >= 240) {
            panic();
            break;
        }
    }
    // Calc FPS
    if (timestamp > lastFpsUpdate + 1000) { // update every second
        fps = 0.25 * framesThisSecond + (1 - 0.25) * fps; // compute the new FPS
        lastFpsUpdate = timestamp;
        framesThisSecond = 0;
    }
    framesThisSecond++;
    draw();
    requestAnimationFrame(mainLoop);
}

init()
requestAnimationFrame(mainLoop)
