
const dropArea = document.getElementById('dropArea');
const imageUpload = document.getElementById('imageUpload');
const previewImage = document.getElementById('previewImage');
const watermarkCanvas = document.getElementById('watermarkCanvas');
const ctx = watermarkCanvas.getContext('2d');
const brushSize = document.getElementById('brushSize');
const brushHardness = document.getElementById('brushHardness');
const undoBtn = document.getElementById('undoBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let originalImage = null;
let undoStack = [];

// Handle drag and drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropArea.classList.add('highlight');
}

function unhighlight() {
    dropArea.classList.remove('highlight');
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

imageUpload.addEventListener('change', function() {
    handleFiles(this.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.onload = function() {
                    initializeCanvas();
                    enableControls();
                };
            };
            reader.readAsDataURL(file);
        }
    }
}

function initializeCanvas() {
    watermarkCanvas.width = previewImage.width;
    watermarkCanvas.height = previewImage.height;
    watermarkCanvas.style.position = 'absolute';
    watermarkCanvas.style.top = '0';
    watermarkCanvas.style.left = '0';
    ctx.clearRect(0, 0, watermarkCanvas.width, watermarkCanvas.height);
}

function enableControls() {
    undoBtn.disabled = false;
    resetBtn.disabled = false;
    downloadBtn.disabled = false;
}

// Drawing functionality
watermarkCanvas.addEventListener('mousedown', startDrawing);
watermarkCanvas.addEventListener('mousemove', draw);
watermarkCanvas.addEventListener('mouseup', stopDrawing);
watermarkCanvas.addEventListener('mouseout', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    // Save current canvas state for undo
    undoStack.push(ctx.getImageData(0, 0, watermarkCanvas.width, watermarkCanvas.height));
}

function draw(e) {
    if (!isDrawing) return;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(255, 255, 255, ${brushHardness.value / 100})`;
    ctx.stroke();
    
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
    isDrawing = false;
}

// Button handlers
undoBtn.addEventListener('click', function() {
    if (undoStack.length > 0) {
        ctx.putImageData(undoStack.pop(), 0, 0);
    }
});

resetBtn.addEventListener('click', function() {
    ctx.clearRect(0, 0, watermarkCanvas.width, watermarkCanvas.height);
    undoStack = [];
});

downloadBtn.addEventListener('click', function() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = previewImage.width;
    canvas.height = previewImage.height;
    
    context.drawImage(previewImage, 0, 0);
    context.globalCompositeOperation = 'destination-out';
    context.drawImage(watermarkCanvas, 0, 0);
    
    const link = document.createElement('a');
    link.download = 'watermark-removed.png';
    link.href = canvas.toDataURL();
    link.click();
});
