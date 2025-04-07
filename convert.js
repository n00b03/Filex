
// DOM Elements
const convertDropArea = document.getElementById('convertDropArea');
const convertImageUpload = document.getElementById('convertImageUpload');
const convertBtn = document.getElementById('convertBtn');
const downloadConvertedBtn = document.getElementById('downloadConvertedBtn');
const originalPreview = document.getElementById('originalPreview');
const convertedPreview = document.getElementById('convertedPreview');
const fileInfo = document.querySelector('.file-info');
const themeToggle = document.getElementById('theme-toggle');

let originalImage = null;
let convertedImage = null;

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
    if (convertImageUpload && convertDropArea) {
        convertImageUpload.addEventListener('change', handleImageSelect);

        convertDropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            convertDropArea.classList.add('dragover');
        });

        convertDropArea.addEventListener('dragleave', () => {
            convertDropArea.classList.remove('dragover');
        });

        convertDropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            convertDropArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFiles(files);
            }
        });
    }

    // Convert and download button handling
    if (convertBtn) {
        convertBtn.addEventListener('click', () => {
            if (!originalImage) return;

            const canvas = document.createElement('canvas');
            canvas.width = originalImage.width;
            canvas.height = originalImage.height;
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(originalImage, 0, 0);
            
            const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            convertedImage = jpgDataUrl;
            
            if (convertedPreview) {
                convertedPreview.src = jpgDataUrl;
                convertedPreview.classList.add('show');
            }
            if (downloadConvertedBtn) {
                downloadConvertedBtn.disabled = false;
            }
        });
    }

    if (downloadConvertedBtn) {
        downloadConvertedBtn.addEventListener('click', () => {
            if (!convertedImage) return;
            
            const link = document.createElement('a');
            link.download = 'converted_image.jpg';
            link.href = convertedImage;
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
                originalPreview.classList.add('show');
            }
            if (convertBtn) {
                convertBtn.disabled = false;
            }
        };
    };
    reader.readAsDataURL(file);
}
