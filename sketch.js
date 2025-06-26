let myPicker;
let strokePicker;
let sfondoPicker;
let wStroke, hStroke, contorno, NumElements1, NumElements2, Rotolone;
let exportSVG = false;
let exportPNG = false;
let xy = []; 
let previewGraphics;
let mainCanvas;

// Variabile per la forma attiva
let activeShape = '1'; // Inizializza con forma 1 (stella)

function setup() {
  // Canvas principale
  mainCanvas = createCanvas(540, 540);
  mainCanvas.parent("canvasContainer");

  // Graphics buffer per l'anteprima - dimensione aumentata
  previewGraphics = createGraphics(400, 400);

  // Slider controlli
  wStroke = createSlider(1, 100, 30, 0.5);
  wStroke.parent("wStrokeContainer");

  hStroke = createSlider(1, 100, 10, 0.5);
  hStroke.parent("hStrokeContainer");

  contorno = createSlider(0, 20, 0.5, 0.5);
  contorno.parent("contornoContainer");

  NumElements1 = createSlider(1, 50, 1, 1); 
  NumElements1.parent("numElements1Container");

  Rotolone = createSlider(0, 360, 0, 0.5);
  Rotolone.parent('rotoloneContainer');

  angleMode(DEGREES);

  // Color pickers
  myPicker = createColorPicker("black");
  myPicker.parent("fillPickerContainer");

  strokePicker = createColorPicker("black");
  strokePicker.parent("strokePickerContainer");
  
  sfondoPicker = createColorPicker("white");
  sfondoPicker.parent("sfondoPickerContainer");

  // Bottoni
  let bSavesvg = createButton("Save SVG");
  bSavesvg.parent("saveButtonContainer");
  bSavesvg.mousePressed(saveSVG);
  
  let bSavePNG = createButton("Save PNG"); 
  bSavePNG.parent("savePNGButtonContainer");
  bSavePNG.mousePressed(triggerSavePNG); 

  // Setup del menu a tendina
  let shapeSelect = select('#shapeSelect');
  shapeSelect.changed(function() {
    activeShape = shapeSelect.value();
    console.log("Forma selezionata dal menu: " + activeShape);
  });

  // Crea il canvas di anteprima nel DOM
  let previewCanvas = createDiv();
  previewCanvas.parent('previewContainer');
  previewCanvas.id('preview-canvas');
}

function draw() {
  // Disegna sul canvas principale
  background(sfondoPicker.color());
  
  if (exportSVG == true) {
    beginRecordSVG(this, "K.svg");
  }

  push();
  noFill(); 
  strokeWeight(2);
  stroke(0); 
  rect(0, 0, width, height);
  pop();

  fill(myPicker.color());   
  stroke(strokePicker.color()); 
  strokeWeight(contorno.value());

  xy = K3; // Array di punti dal file K3.js

  let numElem1Val = NumElements1.value(); 
  
  let wStrokeVal = wStroke.value(); 
  let hStrokeVal = hStroke.value();

  // Disegna le forme lungo il percorso
  for (let i = 0; i < xy.length; i += 2) {
    let elementIndex = i / 2; 
    let shouldDraw = false; 

    // Logica densità
    if (numElem1Val === 1) { 
        shouldDraw = true;
    } else if (numElem1Val > 1) { 
        if (elementIndex % numElem1Val === 0) { 
            shouldDraw = true;
        }
    } else {
        shouldDraw = true;
    }

    if (shouldDraw) {
      let shapeWidth = wStrokeVal;
      let shapeHeight = hStrokeVal;

      push();
      translate(xy[i], xy[i + 1]);
      rotate(Rotolone.value());

      // Disegna la forma selezionata
      drawSelectedShape(0, 0, shapeWidth, shapeHeight);

      pop();
    }
  }
  
  if (exportSVG == true) {
    endRecordSVG();
    exportSVG = false;
  }

  // Aggiorna l'anteprima
  updatePreview();
}

// Funzione per aggiornare l'anteprima
function updatePreview() {
  previewGraphics.clear();
  previewGraphics.background(255);
  
  previewGraphics.push();
  previewGraphics.translate(200, 200); // Centro del canvas di anteprima
  previewGraphics.fill(myPicker.color());
  previewGraphics.stroke(strokePicker.color());
  
  // Prendi i valori degli slider
  let sliderW = wStroke.value();
  let sliderH = hStroke.value();
  
  // Calcola quale dimensione è più grande
  let maxDim = max(sliderW, sliderH);
  
  // Scala basandosi sulla dimensione più grande per farla stare in 80 pixel (aumentato da 45)
  let scaleFactor = 80 / maxDim;
  
  // Applica lo stesso fattore a entrambe le dimensioni
  let previewW = sliderW 
  let previewH = sliderH 
  
  // Scala anche lo strokeWeight
  let previewStrokeWeight = contorno.value() * scaleFactor;
  previewGraphics.strokeWeight(max(0, previewStrokeWeight));
  
  previewGraphics.push();
  previewGraphics.angleMode(DEGREES);
  previewGraphics.rotate(Rotolone.value());
  
  // Disegna la forma nell'anteprima
  switch(activeShape) {
    case '1':
      drawStarPreview(0, 0, previewW, previewH, 8);
      break;
    case '2':
      previewGraphics.rectMode(CENTER);
      previewGraphics.rect(0, 0, previewW, previewH);
      break;
    case '3':
      previewGraphics.ellipseMode(CENTER);
      previewGraphics.ellipse(0, 0, previewW, previewH);
      break;
    case '4':
      drawTrianglePreview(0, 0, previewW, previewH);
      break;
    case '5':
      drawDiamondPreview(0, 0, previewW, previewH);
      break;
    case '6':
      drawStarPreview(0, 0, previewW, previewH, 5);
      break;
    case '7':
      drawSemicirclePreview(0, 0, previewW, previewH);
      break;
  }
  
  previewGraphics.pop();
  previewGraphics.pop();
  
  // Mostra l'anteprima nel DOM
  let previewDiv = select('#preview-canvas');
  if (previewDiv) {
    previewDiv.html('');
    let img = createImg(previewGraphics.canvas.toDataURL());
    img.parent('preview-canvas');
    img.style('max-width', '100%');
    img.style('height', 'auto');
  }
}

// Funzioni di disegno per l'anteprima
function drawStarPreview(x, y, radius1, radius2, npoints) {
  let angle = 360 / npoints;
  let halfAngle = angle / 2.0;
  previewGraphics.beginShape();
  for (let a = 0; a < 360; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    previewGraphics.vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    previewGraphics.vertex(sx, sy);
  }
  previewGraphics.endShape(CLOSE);
}

function drawTrianglePreview(x, y, w, h) {
  previewGraphics.beginShape();
  previewGraphics.vertex(x, y - h/2);
  previewGraphics.vertex(x - w/2, y + h/2);
  previewGraphics.vertex(x + w/2, y + h/2);
  previewGraphics.endShape(CLOSE);
}

function drawDiamondPreview(x, y, w, h) {
  previewGraphics.beginShape();
  previewGraphics.vertex(x, y - h/2);
  previewGraphics.vertex(x + w/2, y);
  previewGraphics.vertex(x, y + h/2);
  previewGraphics.vertex(x - w/2, y);
  previewGraphics.endShape(CLOSE);
}

function drawSemicirclePreview(x, y, w, h) {
  previewGraphics.beginShape();
  // Inizia dal lato sinistro
  previewGraphics.vertex(x - w/2, y);
  // Disegna l'arco superiore
  for (let angle = 180; angle >= 0; angle -= 10) {
    let px = x + cos(angle) * (w/2);
    let py = y + sin(angle) * (h/2);
    previewGraphics.vertex(px, py);
  }
  previewGraphics.endShape(CLOSE);
}

// Funzione per disegnare la forma selezionata
function drawSelectedShape(x, y, w, h) {
  switch(activeShape) {
    case '1':
      star(x, y, w, h, 8);
      break;
    case '2':
      rectMode(CENTER);
      rect(x, y, w, h);
      break;
    case '3':
      ellipseMode(CENTER);
      ellipse(x, y, w, h);
      break;
    case '4':
      drawTriangle(x, y, w, h);
      break;
    case '5':
      drawDiamond(x, y, w, h);
      break;
    case '6':
      star(x, y, w, h, 5);
      break;
    case '7':
      drawSemicircle(x, y, w, h);
      break;
  }
}

// Funzione per disegnare una stella
function star(x, y, radius1, radius2, npoints) {
  let angle = 360 / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < 360; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// Funzione per disegnare un triangolo
function drawTriangle(x, y, w, h) {
  beginShape();
  vertex(x, y - h/2);
  vertex(x - w/2, y + h/2);
  vertex(x + w/2, y + h/2);
  endShape(CLOSE);
}

// Funzione per disegnare un rombo
function drawDiamond(x, y, w, h) {
  beginShape();
  vertex(x, y - h/2);
  vertex(x + w/2, y);
  vertex(x, y + h/2);
  vertex(x - w/2, y);
  endShape(CLOSE);
}

// Funzione per disegnare un semicerchio
function drawSemicircle(x, y, w, h) {
  beginShape();
  // Inizia dal lato sinistro
  vertex(x - w/2, y);
  // Disegna l'arco superiore
  for (let angle = 180; angle >= 0; angle -= 10) {
    let px = x + cos(angle) * (w/2);
    let py = y + sin(angle) * (h/2);
    vertex(px, py);
  }
  endShape(CLOSE);
}

// Funzioni per il salvataggio
function saveSVG() {
  exportSVG = true;
}

function triggerSavePNG() {
  exportPNG = true;
  setTimeout(() => {
    saveCanvas(mainCanvas, "K_export", "png");
    exportPNG = false;
  }, 100);
}