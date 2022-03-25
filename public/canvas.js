let canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let pencilColorCont = document.querySelectorAll('.pencil-color');
let pencilWidthElem = document.querySelector('.pencil-width');
let eraserWidthElem = document.querySelector('.eraser-width');
let penColor = "red";
let eraserColor = "white";
let penWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;
let download = document.querySelector('.download');
let undoRedoTracker = [];
let track = 0; // Represnt which action from tracker array
let redo = document.querySelector('.redo');
let undo = document.querySelector('.undo');

let mouseDown = false;


// API
let tool = canvas.getContext('2d');

tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

// mousedown --> start new path, mousemove---> path fill (graphics)
canvas.addEventListener('mousedown', (e) => {
    mouseDown = true;
    // beginPath({
    // x: e.clientX,
    // y: e.clientY
    // });
    let data = {
        x: e.clientX,
        y: e.clientY
    }

    socket.emit('beginPath', data);
})

canvas.addEventListener('mousemove', (e) => {
    if (mouseDown) {
        let data = {
            x: e.clientX,
            y: e.clientY,
            color: eraserFlag ?eraserColor: penColor,
            width: eraserFlag ?eraserWidth: penWidth

        }
        socket.emit('drawStroke', data);
    }
    // send data to server
})

canvas.addEventListener('mouseup', (e) => {
    mouseDown = false;
    let url = canvas.toDataURL();
    undoRedoTracker.push(url);
    track = undoRedoTracker.length - 1;
})

function beginPath(strokeObj) {
    tool.beginPath();
    tool.moveTo(strokeObj.x, strokeObj.y);
}

function drawStroke(strokeObj) {
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y);
    tool.stroke();
}

pencilColorCont.forEach((colorElem) => {
    colorElem.addEventListener('click', (e) => {
        let color = colorElem.classList[0];
        penColor = color;
        tool.strokeStyle = penColor;
    })
})

pencilWidthElem.addEventListener('change', (e) => {
    penWidth = pencilWidthElem.value;
    tool.lineWidth = penWidth;
})

eraserWidthElem.addEventListener('change', (e) => {

    eraserWidth = eraserWidthElem.value;
    tool.lineWidth = eraserWidth;
})

eraser.addEventListener('click', (e) => {
    if (eraserFlag) {
        tool.strokeStyle = eraserColor;
        tool.lineWidth = eraserWidth;
    }
    else {
        tool.strokeStyle = penColor;
        tool.lineWidth = penWidth;
    }
})

download.addEventListener('click', (e) => {
    let url = canvas.toDataURL();
    let a = document.createElement('a');
    a.href = url;
    a.download = "board.jpg";
    a.click();
})


undo.addEventListener('click', (e) => {
    if (track > 0) {
        track--;
    }
    // action
    let data = {
        trackVlaue: track,
        undoRedoTracker
    }
    socket.emit('redoUndo', data);
    // undoRedoCanvas(trackObj);
})

function undoRedoCanvas(trackObj) {
    track = trackObj.trackVlaue;
    undoRedoTracker = trackObj.undoRedoTracker;

    let url = undoRedoTracker[track];
    let img = new Image();  // New image reference element
    img.src = url;
    img.onload = (e) => {
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

}

redo.addEventListener('click', (e) => {
    if (track < undoRedoTracker.length - 1) {
        track++;
    }
    let data = {
        trackVlaue: track,
        undoRedoTracker
    }
    socket.emit('redoUndo', data);
    // undoRedoCanvas(trackObj);
})

socket.on('beginPath', (data) => {
    // data --> data from server
    beginPath(data);
})

socket.on('drawStroke', (data) => {
    // data --> data from server
    drawStroke(data);
})

socket.on('redoUndo', (data) => {
    undoRedoCanvas(data);
})
// tool.beginPath(); // New graphic (path) (line)
// tool.moveTo(10,10);  // Start point
// tool.lineTo(100,150);  // End point
// tool.stroke(); // Fill color(graphic)

// // tool.beginPath(10,10);
// tool.lineTo(200,200);  // from ending point
// tool.stroke();