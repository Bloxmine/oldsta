// Author: Hein Dijstelbloem, 22-04-2025
// Updated to use webcam instead of loading an image
const canvas = document.getElementById('canvas');
const canvasContainer = document.getElementById('canvas-container');
const ctx = canvas.getContext('2d');
let videoStream = null;

const filterButtons = document.querySelectorAll('.filter-button');
const filterNames = document.querySelectorAll('.filter-name');

filterButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        const selectedFilter = button.getAttribute('data-filter');

        // Remove any existing filter classes
        canvasContainer.className = '';
        // Add the selected filter class
        canvasContainer.classList.add(selectedFilter);

        // Remove 'selected' class from all filter names
        filterNames.forEach(name => name.classList.remove('selected'));

        // Add 'selected' class to the clicked filter's name
        filterNames[index].classList.add('selected');
    });
});

// Preload overlay images
const overlayImages = {};
if (typeof filterOverlays !== 'undefined') {
    Object.keys(filterOverlays).forEach(filter => {
        const img = new Image();
        img.src = filterOverlays[filter];
        overlayImages[filter] = img;
    });
}

// Start webcam feed
async function startWebcam() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = videoStream;
        video.play();

        video.addEventListener('loadeddata', () => {
            // Set canvas dimensions to 512x512
            canvas.width = 512;
            canvas.height = 512;

            // Continuously draw the video feed onto the canvas
            function drawFrame() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Removed unused videoAspectRatio variable
                // Calculate cropping dimensions
                const videoAspectRatio = video.videoWidth / video.videoHeight;
                const cropSize = Math.min(video.videoWidth, video.videoHeight);
                const cropX = (video.videoWidth - cropSize) / 2;
                const cropY = (video.videoHeight - cropSize) / 2;

                // Apply the selected filter
                const selectedFilter = getComputedStyle(canvasContainer).filter;
                ctx.filter = selectedFilter;

                // Draw the cropped video frame
                ctx.drawImage(
                    video,
                    cropX, cropY, cropSize, cropSize, // Source cropping
                    0, 0, canvas.width, canvas.height // Destination dimensions
                );

                // Reset the filter for overlays
                ctx.filter = 'none';

                // Draw the overlay image if applicable
                const overlayImage = overlayImages[canvasContainer.className];
                if (overlayImage && overlayImage.complete) {
                    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
                }

                requestAnimationFrame(drawFrame);
            }

            drawFrame();
        });
    } catch (error) {
        alert('Unable to access webcam. Please check your permissions.');
        console.error(error);
    }
}

// Stop webcam feed
function stopWebcam() {
    if (videoStream) {
        const tracks = videoStream.getTracks();
        tracks.forEach(track => track.stop());
    }
}

const startButton = document.getElementById('start-webcam');
const stopButton = document.getElementById('stop-webcam');

startButton.addEventListener('click', startWebcam);
stopButton.addEventListener('click', stopWebcam);

const downloadButton = document.getElementById('download-button');

downloadButton.addEventListener('click', () => {
    if (!videoStream) {
        alert('Please start the webcam first.');
        return;
    }

    // Create a temporary link element for downloading the canvas image
    const link = document.createElement('a');
    link.download = 'filtered-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Overlays for filters
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
