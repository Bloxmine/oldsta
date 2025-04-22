   // safari doesn't support the filter property on canvas, so we need to use a workaround
    // working on that...
    const uploadForm = document.getElementById('upload-form');
    const imageInput = document.getElementById('image-input');
    const canvas = document.getElementById('canvas');
    const canvasContainer = document.getElementById('canvas-container');
    const ctx = canvas.getContext('2d');
    let currentImage = null; // Store the uploaded image

    const filterButtons = document.querySelectorAll('.filter-button');

    filterButtons.forEach(button => {
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
        });
    });

    uploadForm.addEventListener('submit', (event) => {
        event.preventDefault(); // prevent form submission
        console.log('Form submission prevented'); // Debugging log

        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // create an offscreen canvas to crop the image, this is to avoid resizing the image for now
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
        'filter-kelvin': 'overlays/kelvin.png',
        'filter-earlybird': 'overlays/earlybird.png',
        'filter-xpro-ii': 'overlays/xpro.png',
        'filter-nashville': 'overlays/nashville.png',
    };

    // this function applies the selected filter and redraws the image
    function applyFilterAndRedraw() {
        console.log('Applying filter and redrawing...');

        // finds the selected filter
        const selectedFilter = getComputedStyle(canvasContainer).filter;
        console.log('Selected filter:', selectedFilter);

        // applies the filter to the canvas context
        ctx.filter = selectedFilter;

        // clears the canvas and redraw the image with the filter
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(currentImage, 0, 0);
        console.log('Image redrawn on canvas with filter.');

        // checks if the selected filter has an overlay
        const overlayPath = filterOverlays[canvasContainer.className];
        if (overlayPath) {
            console.log('Overlay found for filter:', overlayPath);
            const overlayImage = new Image();
            overlayImage.onload = () => {
                // draw the overlay on top of the canvas
                ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
                console.log('Overlay applied to canvas.');
            };
            overlayImage.src = overlayPath;
        } else {
            console.log('No overlay found for the selected filter.');
        }

        // reset the filter
        ctx.filter = 'none';
        console.log('Filter reset to none.');
    }

    const downloadButton = document.getElementById('download-button');

    downloadButton.addEventListener('click', () => {
        if (!currentImage) {
            alert('Please upload an image first.');
            return;
        }

        console.log('Preparing to download the filtered image...');
        console.log('Canvas content before download:', canvas.toDataURL('image/png'));

        // create a temporary link element, this should be changed to a download button
        const link = document.createElement('a');
        link.download = 'filtered-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click(); // trigger the download
        console.log('Download triggered.');
    });

    // // this should probably be made better. I don't know how this'll function on mobile
    // const filterButtonsContainer = document.querySelector('.filter-buttons');

    // filterButtonsContainer.addEventListener('wheel', (event) => {
    //     event.preventDefault(); // prevent the default vertical scroll behavior
    //     filterButtonsContainer.scrollLeft += event.deltaY; // scroll horizontally
    // });