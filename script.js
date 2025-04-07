// DOM Elements
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');
const uploadInput = document.getElementById('imageUpload');
const dropArea = document.getElementById('dropArea');
const placeholder = document.getElementById('uploadPlaceholder');
const processingOverlay = document.getElementById('processingOverlay');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const themeToggle = document.getElementById('theme-toggle');
const tooltip = document.getElementById('tooltip');
const filterBtns = document.querySelectorAll('.filter-btn');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const saturationSlider = document.getElementById('saturation');
const blurSlider = document.getElementById('blurSlider');
const rotateLeft = document.getElementById('rotateLeft');
const rotateRight = document.getElementById('rotateRight');
const flipHorizontal = document.getElementById('flipHorizontal');
const flipVertical = document.getElementById('flipVertical');
const loadingScreen = document.getElementById('loading-screen');

// Global variables
let originalImage = null;
let currentImage = null;
let currentRotation = 0;
let isFlippedHorizontal = false;
let isFlippedVertical = false;
let activeFilter = null;
let adjustments = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0
};

// -------------------- Initialization ----------------------
// Simulate loading time
setTimeout(() => {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 1000);
}, 1500);

// Theme switching
themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-theme');
    // Save preference to localStorage
    if (document.body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Check saved theme preference
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.checked = true;
}

// -------------------- Image Handling ----------------------
// File upload handling
uploadInput.addEventListener('change', handleImageUpload);

// Drag and drop handling
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
    dropArea.classList.add('dragover');
}

function unhighlight() {
    dropArea.classList.remove('dragover');
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0 && files[0].type.match('image.*')) {
        uploadInput.files = files;
        handleImageUpload();
    } else {
        showTooltip(dropArea, 'Please drop a valid image file');
    }
}

function handleImageUpload() {
    const file = uploadInput.files[0];

    if (!file || !file.type.match('image.*')) {
        showTooltip(uploadInput, 'Please select a valid image file');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Store original image
            originalImage = img;
            currentImage = img;

            // Reset all adjustments and transformations
            resetAll();

            // Draw image to canvas
            renderImage();

            // Hide placeholder, show canvas
            placeholder.style.display = 'none';
            imageCanvas.style.display = 'block';
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function renderImage() {
    showProcessingOverlay();

    setTimeout(() => {
        // Calculate dimensions to maintain aspect ratio
        const maxWidth = imageCanvas.parentElement.offsetWidth * 0.9;
        const maxHeight = imageCanvas.parentElement.offsetHeight * 0.9;

        let width = currentImage.width;
        let height = currentImage.height;

        if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = height * ratio;
        }

        if (height > maxHeight) {
            const ratio = maxHeight / height;
            height = maxHeight;
            width = width * ratio;
        }

        // Set canvas size
        imageCanvas.width = width;
        imageCanvas.height = height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Apply transformations
        ctx.save();

        // Rotate if needed
        if (currentRotation !== 0) {
            ctx.translate(width / 2, height / 2);
            ctx.rotate(currentRotation * Math.PI / 180);
            ctx.translate(-width / 2, -height / 2);
        }

        // Flip if needed
        if (isFlippedHorizontal || isFlippedVertical) {
            ctx.translate(isFlippedHorizontal ? width : 0, isFlippedVertical ? height : 0);
            ctx.scale(isFlippedHorizontal ? -1 : 1, isFlippedVertical ? -1 : 1);
        }

        // Draw image
        ctx.drawImage(currentImage, 0, 0, width, height);
        ctx.restore();

        // Apply filters using CSS filters
        applyFiltersAndAdjustments();

        hideProcessingOverlay();
    }, 100);
}

function applyFiltersAndAdjustments() {
    let filterString = '';

    // Add brightness, contrast, saturation
    filterString += `brightness(${adjustments.brightness}%) `;
    filterString += `contrast(${adjustments.contrast}%) `;
    filterString += `saturate(${adjustments.saturation}%) `;

    // Add blur
    filterString += `blur(${adjustments.blur}px) `;

    // Add active filter
    if (activeFilter) {
        switch (activeFilter) {
            case 'grayscale':
                filterString += 'grayscale(100%) ';
                break;
            case 'sepia':
                filterString += 'sepia(80%) ';
                break;
            case 'invert':
                filterString += 'invert(100%) ';
                break;
            case 'blur':
                filterString += 'blur(2px) ';
                break;
            case 'vintage':
                filterString += 'sepia(70%) contrast(110%) brightness(90%) ';
                break;
            case 'cool':
                filterString += 'hue-rotate(180deg) saturate(110%) ';
                break;
            case 'warm':
                filterString += 'hue-rotate(-30deg) saturate(120%) brightness(105%) ';
                break;
        }
    }

    // Apply filters
    imageCanvas.style.filter = filterString;
}

// -------------------- UI Interactions ----------------------
// Reset button
resetBtn.addEventListener('click', function() {
    if (!originalImage) return;

    resetAll();
    renderImage();
    showTooltip(resetBtn, 'Image reset successfully');
});

function resetAll() {
    // Reset transformations
    currentRotation = 0;
    isFlippedHorizontal = false;
    isFlippedVertical = false;

    // Reset adjustments
    adjustments = {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0
    };

    // Reset active filter
    activeFilter = null;

    // Reset UI
    resetUI();
}

function resetUI() {
    // Reset adjustment sliders
    brightnessSlider.value = 100;
    contrastSlider.value = 100;
    saturationSlider.value = 100;
    blurSlider.value = 0;
    updateSliderDisplays();

    // Reset active filter button
    filterBtns.forEach(btn => btn.classList.remove('active'));
}

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const filter = this.dataset.filter;

        // Toggle active state
        if (activeFilter === filter) {
            activeFilter = null;
            this.classList.remove('active');
        } else {
            // Remove active class from all buttons
            filterBtns.forEach(btn => btn.classList.remove('active'));

            // Set active filter
            activeFilter = filter;
            this.classList.add('active');
        }

        // Apply filters
        renderImage();
    });
});

// Adjustment sliders
brightnessSlider.addEventListener('input', function() {
    adjustments.brightness = this.value;
    updateSliderDisplay(this, `${this.value}%`);
    applyFiltersAndAdjustments();
});

contrastSlider.addEventListener('input', function() {
    adjustments.contrast = this.value;
    updateSliderDisplay(this, `${this.value}%`);
    applyFiltersAndAdjustments();
});

saturationSlider.addEventListener('input', function() {
    adjustments.saturation = this.value;
    updateSliderDisplay(this, `${this.value}%`);
    applyFiltersAndAdjustments();
});

blurSlider.addEventListener('input', function() {
    adjustments.blur = this.value;
    updateSliderDisplay(this, `${this.value}px`);
    applyFiltersAndAdjustments();
});

function updateSliderDisplays() {
    updateSliderDisplay(brightnessSlider, `${brightnessSlider.value}%`);
    updateSliderDisplay(contrastSlider, `${contrastSlider.value}%`);
    updateSliderDisplay(saturationSlider, `${saturationSlider.value}%`);
    updateSliderDisplay(blurSlider, `${blurSlider.value}px`);
}

function updateSliderDisplay(slider, value) {
    const display = slider.previousElementSibling.querySelector('.value-display');
    display.textContent = value;

    // Update gradient background
    const percent = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percent}%, var(--border) ${percent}%, var(--border) 100%)`;
}

// Transform buttons
rotateLeft.addEventListener('click', function() {
    if (!currentImage) return;

    currentRotation = (currentRotation - 90) % 360;
    renderImage();
});

rotateRight.addEventListener('click', function() {
    if (!currentImage) return;

    currentRotation = (currentRotation + 90) % 360;
    renderImage();
});

flipHorizontal.addEventListener('click', function() {
    if (!currentImage) return;

    isFlippedHorizontal = !isFlippedHorizontal;
    renderImage();
});

flipVertical.addEventListener('click', function() {
    if (!currentImage) return;

    isFlippedVertical = !isFlippedVertical;
    renderImage();
});

// Download button
downloadBtn.addEventListener('click', function() {
    if (!currentImage) {
        showTooltip(downloadBtn, 'No image to download');
        return;
    }

    // Create a temporary canvas to apply filters
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = imageCanvas.width;
    tempCanvas.height = imageCanvas.height;

    // Draw image from original canvas to temporary canvas
    tempCtx.drawImage(imageCanvas, 0, 0);

    // Convert to data URL
    try {
        const imageURL = tempCanvas.toDataURL('image/png');

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = imageURL;
        downloadLink.download = 'pixelo_edited_image.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        showTooltip(downloadBtn, 'Image downloaded successfully');
    } catch (e) {
        showTooltip(downloadBtn, 'Error downloading image');
        console.error('Error downloading image:', e);
    }
});

// -------------------- Helper Functions ----------------------
function showProcessingOverlay() {
    processingOverlay.classList.add('active');
}

function hideProcessingOverlay() {
    processingOverlay.classList.remove('active');
}

function showTooltip(element, message) {
    tooltip.textContent = message;

    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 40}px`;

    // Show tooltip
    tooltip.style.opacity = '1';
    tooltip.style.visibility = 'visible';

    // Hide tooltip after a delay
    setTimeout(() => {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
    }, 2000);
}

// Window resize handling
window.addEventListener('resize', function() {
    if (currentImage) {
        renderImage();
    }
});

// Handle touch events for mobile
let touchStartX = 0;
let touchStartY = 0;

imageCanvas.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

imageCanvas.addEventListener('touchmove', function(e) {
    // Implemented for future touch-based gestures
    e.preventDefault();
});

// Initialize slider displays
updateSliderDisplays();


// Add this code to your script.js file

// DOM Elements for navigation
const navItems = document.querySelectorAll('.nav-item');
let currentSection = 'editor'; // Default active section

// Add mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create mobile menu toggle button
    const header = document.querySelector('header');
    const mobileToggle = document.createElement('div');
    mobileToggle.className = 'mobile-menu-toggle';
    mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';

    // Insert toggle button before the logo
    header.insertBefore(mobileToggle, header.firstChild);

    const mainNav = document.querySelector('.main-nav');

    // Toggle mobile menu
    mobileToggle.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        // Toggle icon
        const icon = this.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mainNav.contains(e.target) && !mobileToggle.contains(e.target) && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
});

// Navigation item click handling
navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();

        // Get section data
        const sectionName = this.querySelector('a').dataset.section;

        // Update active state
        navItems.forEach(navItem => navItem.classList.remove('active'));
        this.classList.add('active');

        // Switch section function
        switchSection(sectionName);

        // Close mobile menu if open
        const mainNav = document.querySelector('.main-nav');
        if (mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            const mobileToggle = document.querySelector('.mobile-menu-toggle i');
            mobileToggle.classList.remove('fa-times');
            mobileToggle.classList.add('fa-bars');
        }
    });
});

// Function to switch between sections
function switchSection(sectionName) {
    currentSection = sectionName;

    if (sectionName === 'compress') {
        window.location.href = 'compress.html';
    } else if (sectionName === 'crop') {
        window.location.href = 'crop.html';
    } else if (sectionName === 'convert') {
        window.location.href = 'convert.html';
    } else if (sectionName === 'watermark') {
        window.location.href = 'watermark.html';
    }

    // You would implement this part to show different tools based on section
    // Example:
    /*
    const sections = {
        'editor': document.getElementById('editor-section'),
        'compress': document.getElementById('compress-section'),
        'crop': document.getElementById('crop-section'),
        'convert': document.getElementById('convert-section'),
        'watermark': document.getElementById('watermark-section')
    };

    // Hide all sections
    Object.values(sections).forEach(section => {
        if (section) section.style.display = 'none';
    });

    // Show active section
    if (sections[sectionName]) {
        sections[sectionName].style.display = 'block';
    }
    */

    console.log(`Switched to ${sectionName} section`);
}