// Author: Hein Dijstelbloem, 22-04-2025
// safari doesn't support the filter property on canvas, so we need to use a workaround
// working on that...
const imageInput = document.getElementById('image-input');
const canvas = document.getElementById('canvas');
const canvasContainer = document.getElementById('canvas-container');
const ctx = canvas.getContext('2d');
let currentImage = 0;

const filterButtons = document.querySelectorAll('.filter-button');
// Select all filter names
const filterNames = document.querySelectorAll('.filter-name');

filterButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        const selectedFilter = button.getAttribute('data-filter');

        // Remove any existing filter classes
        canvasContainer.className = '';
        // Add the selected filter class
        canvasContainer.classList.add(selectedFilter);

        // Redraw the image with the filter applied
        if (currentImage) {
            applyFilterAndRedraw();
        }

        // Remove 'selected' class from all filter names
        filterNames.forEach(name => name.classList.remove('selected'));

        // Add 'selected' class to the clicked filter's name
        filterNames[index].classList.add('selected');
    });
});

// file reader courtesy of https://developer.mozilla.org/en-US/docs/Web/API/FileReader
// and some stackoverflow magic
imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // create an offscreen canvas to crop the image, this is to avoid resizing the image
                const offscreenCanvas = document.createElement('canvas');
                const offscreenCtx = offscreenCanvas.getContext('2d');

                // sets the desired square dimensions
                const squareSize = 512;
                offscreenCanvas.width = squareSize;
                offscreenCanvas.height = squareSize;

                // calculate cropping dimensions to center the image
                const aspectRatio = img.width / img.height;
                let cropWidth, cropHeight, startX, startY;

                if (aspectRatio > 1) {
                    // when the image is wider than tall
                    cropWidth = img.height;
                    cropHeight = img.height;
                    startX = (img.width - cropWidth) / 2;
                    startY = 0;
                } else {
                    // when the image is taller than wide or square
                    cropWidth = img.width;
                    cropHeight = img.width;
                    startX = 0;
                    startY = (img.height - cropHeight) / 2;
                }

                // draws the cropped image onto the offscreen canvas
                offscreenCtx.drawImage(img, startX, startY, cropWidth, cropHeight, 0, 0, squareSize, squareSize);

                // stores the cropped image as the current image
                const croppedImage = new Image();
                croppedImage.onload = () => {
                    currentImage = croppedImage;

                    // resizes the main canvas to match the square dimensions
                    canvas.width = squareSize;
                    canvas.height = squareSize;

                    // draws the cropped image onto the main canvas
                    applyFilterAndRedraw();
                };
                croppedImage.src = offscreenCanvas.toDataURL();
            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    } else {
        alert('Please select an image to upload.');
    }
});

// these are the overlays for the filters which require them
const filterOverlays = {
    'filter-1977': 'overlays/1977.png',
    'filter-joaster': 'overlays/1977.png',
    'filter-inkwell': 'overlays/1977.png',
    'filter-kelvin': 'overlays/kelvin.png',
    'filter-earlybird': 'overlays/earlybird.png',
    'filter-xpro-ii': 'overlays/xpro.png',
    'filter-nashville': 'overlays/nashville.png',
    'filter-walder': 'overlays/walden.png',
    'filder-hefe': 'overlays/walden.png',
    'filter-sutro': 'overlays/walden.png',
    'filter-brannan': 'overlays/brannan.png',
    'filter-poprocket': 'overlays/poprocket.png',
};

// this function applies the selected filter and redraws the image
function applyFilterAndRedraw() {
    // finds the selected filter
    const selectedFilter = getComputedStyle(canvasContainer).filter;

    // clears the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // applies the filter to the canvas context
    ctx.filter = selectedFilter;

    // draws the image with the filter applied
    ctx.drawImage(currentImage, 0, 0);

    // reset the filter so it doesn't affect the overlay
    ctx.filter = 'none';

    const overlayPath = filterOverlays[canvasContainer.className];
    if (overlayPath) {
        const overlayImage = new Image();
        overlayImage.onload = () => {
            // draw the overlay on top of the canvas
            ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
        };
        overlayImage.src = overlayPath;
    }
}


const downloadButton = document.getElementById('download-button');

downloadButton.addEventListener('click', () => {
    if (!currentImage) {
        alert('Please upload an image first.');
        return;
    }

    // create a temporary link element, this should be changed to a download button
    const link = document.createElement('a');
    link.download = 'filtered-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click(); // trigger the download
});
