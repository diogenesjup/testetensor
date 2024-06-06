document.addEventListener('deviceready', function() {
    const openCameraButton = document.getElementById('openCamera');
    const cameraPreview = document.getElementById('cameraPreview');
    const cameraCanvas = document.getElementById('cameraCanvas');
    const context = cameraCanvas.getContext('2d');
    
    let model;

    // Load the model
    async function loadModel() {
        model = await cocoSsd.load();
        console.log('Model loaded');
    }

    openCameraButton.addEventListener('click', function() {
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL
        });
    });

    function onSuccess(imageData) {
        cameraPreview.src = "data:image/jpeg;base64," + imageData;
        cameraPreview.classList.remove('hidden');

        cameraPreview.onload = function() {
            cameraCanvas.width = cameraPreview.videoWidth;
            cameraCanvas.height = cameraPreview.videoHeight;
            context.drawImage(cameraPreview, 0, 0, cameraCanvas.width, cameraCanvas.height);
            detectPerson();
        }
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }

    async function detectPerson() {
        const predictions = await model.detect(cameraCanvas);
        console.log(predictions);
        drawBoundingBoxes(predictions);
    }

    function drawBoundingBoxes(predictions) {
        context.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
        context.drawImage(cameraPreview, 0, 0, cameraCanvas.width, cameraCanvas.height);

        predictions.forEach(prediction => {
            if (prediction.class === 'person') {
                context.beginPath();
                context.rect(...prediction.bbox);
                context.lineWidth = 2;
                context.strokeStyle = 'red';
                context.fillStyle = 'red';
                context.stroke();
                context.fillText(
                    `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
                    prediction.bbox[0],
                    prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
                );
            }
        });
    }

    // Load the model once the device is ready
    loadModel();
});