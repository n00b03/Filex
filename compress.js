
// DOM Elements
const compressDropArea = document.getElementById('compressDropArea');
const compressImageUpload = document.getElementById('compressImageUpload');
const qualitySlider = document.getElementById('quality');
const compressBtn = document.getElementById('compressBtn');
const downloadCompressedBtn = document.getElementById('downloadCompressedBtn');
const originalSizeEl = document.getElementById('originalSize');
const compressedSizeEl = document.getElementById('compressedSize');
const compressionRatioEl = document.getElementById('compressionRatio');
const fileInfo = document.querySelector('.file-info');
const themeToggle = document.getElementById('theme-toggle');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');

let originalImage = null;
let compressedImage = null;

document.addEventListener('DOMContentLoaded', () => {
    // Theme handling
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        });

        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.checked = true;
        }
    }

    // File upload handling
    if (compressImageUpload && compressDropArea) {
        compressImageUpload.addEventListener('change', handleImageSelect);

        compressDropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            compressDropArea.classList.add('dragover');
        });

        compressDropArea.addEventListener('dragleave', () => {
            compressDropArea.classList.remove('dragover');
        });

        compressDropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            compressDropArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFiles(files);
            }
        });
    }

    // Quality slider handling
    if (qualitySlider) {
        qualitySlider.addEventListener('input', function() {
            const display = this.parentElement.querySelector('.value-display');
            if (display) {
                display.textContent = this.value + '%';
            }
            
            const percent = (this.value - this.min) / (this.max - this.min) * 100;
            this.style.background = `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percent}%, var(--border) ${percent}%, var(--border) 100%)`;
        });
    }

    // Compression button handling
    if (compressBtn) {
        compressBtn.addEventListener('click', () => {
            if (!originalImage) return;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = originalImage.width;
            canvas.height = originalImage.height;

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(originalImage, 0, 0);

            const quality = qualitySlider ? qualitySlider.value / 100 : 0.7;
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

            if (compressedPreview) {
                compressedPreview.src = compressedDataUrl;
                compressedPreview.style.display = 'block';
            }
            if (downloadCompressedBtn) {
                downloadCompressedBtn.disabled = false;
            }

            compressedImage = compressedDataUrl;
            
            // Update size information
            const originalSize = getBase64Size(originalImage.src);
            const compressedSize = getBase64Size(compressedDataUrl);
            
            if (originalSizeEl) originalSizeEl.textContent = formatBytes(originalSize);
            if (compressedSizeEl) compressedSizeEl.textContent = formatBytes(compressedSize);
        });
    }

    // Download button handling
    if (downloadCompressedBtn) {
        downloadCompressedBtn.addEventListener('click', () => {
            if (!compressedImage) return;

            const link = document.createElement('a');
            link.download = 'compressed_image.jpg';
            link.href = compressedImage;
            link.click();
        });
    }
});

function handleImageSelect(e) {
    if (e.target.files.length > 0) {
        handleFiles(e.target.files);
    }
}

function handleFiles(files) {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
    }

    if (fileInfo) {
        fileInfo.textContent = `File: ${file.name}`;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        originalImage = new Image();
        originalImage.src = e.target.result;
        originalImage.onload = function() {
            if (originalPreview) {
                originalPreview.src = e.target.result;
                originalPreview.style.display = 'block';
            }
            if (compressBtn) {
                compressBtn.disabled = false;
            }
        };
    };
    reader.readAsDataURL(file);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getBase64Size(base64String) {
    const padding = base64String.endsWith('==') ? 2 : 1;
    return (base64String.length * (3/4)) - padding;
}
