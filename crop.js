document.addEventListener('DOMContentLoaded', function() {
    const cropDropArea = document.getElementById('cropDropArea');
    const cropImageUpload = document.getElementById('cropImageUpload');
    const cropImage = document.getElementById('cropImage');
    const rotateLeftBtn = document.getElementById('rotateLeftBtn');
    const rotateRightBtn = document.getElementById('rotateRightBtn');
    const flipHorizontalBtn = document.getElementById('flipHorizontalBtn');
    const flipVerticalBtn = document.getElementById('flipVerticalBtn');
    const cropBtn = document.getElementById('cropBtn');
    const downloadCroppedBtn = document.getElementById('downloadCroppedBtn');
    const themeToggle = document.getElementById('theme-toggle');

    let cropper = null;

    // Theme handling
    document.addEventListener('DOMContentLoaded', function() {
        const themeToggle = document.getElementById('theme-toggle');
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
    });


    if (cropDropArea) {
        // Drag and drop handling
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            cropDropArea.addEventListener(eventName, preventDefaults);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            cropDropArea.addEventListener(eventName, () => {
                cropDropArea.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            cropDropArea.addEventListener(eventName, () => {
                cropDropArea.classList.remove('dragover');
            });
        });

        cropDropArea.addEventListener('drop', handleDrop);
    }

    if (cropImageUpload) {
        cropImageUpload.addEventListener('change', handleImageSelect);
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleImageSelect(e) {
        handleFiles(this.files);
    }

    function handleFiles(files) {
        if (files.length > 0 && files[0].type.match('image.*')) {
            const file = files[0];
            loadImage(file);
        }
    }

    function loadImage(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (cropImage) {
                cropImage.src = e.target.result;
                cropImage.style.display = 'block';
                cropDropArea.style.display = 'none';

                if (cropper) {
                    cropper.destroy();
                }

                cropper = new Cropper(cropImage, {
                    aspectRatio: NaN,
                    viewMode: 2,
                    autoCropArea: 1,
                });

                if (cropBtn) cropBtn.disabled = false;
            }
        };
        reader.readAsDataURL(file);
    }

    if (rotateLeftBtn) {
        rotateLeftBtn.addEventListener('click', () => {
            if (cropper) cropper.rotate(-90);
        });
    }

    if (rotateRightBtn) {
        rotateRightBtn.addEventListener('click', () => {
            if (cropper) cropper.rotate(90);
        });
    }

    if (flipHorizontalBtn) {
        flipHorizontalBtn.addEventListener('click', () => {
            if (cropper) cropper.scaleX(cropper.getData().scaleX * -1);
        });
    }

    if (flipVerticalBtn) {
        flipVerticalBtn.addEventListener('click', () => {
            if (cropper) cropper.scaleY(cropper.getData().scaleY * -1);
        });
    }

    if (cropBtn) {
        cropBtn.addEventListener('click', () => {
            if (!cropper) return;

            const canvas = cropper.getCroppedCanvas();
            if (canvas) {
                cropImage.src = canvas.toDataURL();
                cropper.destroy();
                cropper = new Cropper(cropImage, {
                    aspectRatio: NaN,
                    viewMode: 2,
                    autoCropArea: 1,
                });
                if (downloadCroppedBtn) downloadCroppedBtn.disabled = false;
            }
        });
    }

    if (downloadCroppedBtn) {
        downloadCroppedBtn.addEventListener('click', () => {
            if (!cropper) return;

            const canvas = cropper.getCroppedCanvas();
            if (canvas) {
                const link = document.createElement('a');
                link.download = 'cropped_image.png';
                link.href = canvas.toDataURL();
                link.click();
            }
        });
    }
});