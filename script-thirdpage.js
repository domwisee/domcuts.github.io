const video = document.getElementById('video');
const startCapture = document.getElementById('startCapture');
const countdownDisplay = document.getElementById('countdown');
const photoStrip = document.getElementById('photo-strip');
const emailInput = document.getElementById('emailInput');

let selectedCuts = parseInt(localStorage.getItem('selectedPictures')) || 4;
let captureCount = 0;
let countdown = 3;
let isCapturing = false;
let selectedFrameColor = "white"; // Default frame color
let selectedFilter = "none"; // Default filter

// Access Camera
navigator.mediaDevices.getUserMedia({ video: { width: 1920, height: 1080 } })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(error => console.error('Error accessing camera:', error));

// Start Capture Process
startCapture.addEventListener('click', () => {
    if (isCapturing) return;
    isCapturing = true;
    startCapture.disabled = true;
    startCapture.style.opacity = "0.5";

    captureCount = 0;
    photoStrip.innerHTML = ''; // Clear previous images
    startCountdown();
});

function startCountdown() {
    if (captureCount >= selectedCuts) {
        stopCamera(); // **Stop camera as soon as all images are captured**
        setTimeout(() => {
            isCapturing = false;
            startCapture.disabled = false;
            startCapture.style.opacity = "1";
            addTimestamp();
        }, 2000);
        return;
    }

    countdown = 3;
    countdownDisplay.textContent = countdown;

    let interval = setInterval(() => {
        countdown--;
        countdownDisplay.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(interval);
            captureImage();
        }
    }, 1000);
}

function captureImage() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Apply selected filter
    ctx.filter = selectedFilter;

    // Flip the image horizontally before drawing
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.classList.add('captured-image');
    img.style.filter = selectedFilter; // Apply filter to image

    photoStrip.appendChild(img);

    captureCount++;
    if (captureCount < selectedCuts) {
        setTimeout(startCountdown, 3000);
    } else {
        stopCamera(); // **Stop the camera immediately after the last image**
    }
}

// Stop Camera After Capturing
function stopCamera() {
    if (video.srcObject) {
        let stream = video.srcObject;
        let tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
        console.log("Camera stopped.");
    }
}

// Add Timestamp
function addTimestamp() {
    const timestamp = document.createElement('p');
    timestamp.classList.add('timestamp');

    let currentDate = new Date();
    let formattedDate = currentDate.toLocaleDateString();
    let formattedTime = currentDate.toLocaleTimeString();

    timestamp.textContent = `Picapica ${formattedDate} ${formattedTime}`;
    photoStrip.appendChild(timestamp);
}

// Change Frame Color
document.querySelectorAll('.color-btn').forEach(button => {
    button.addEventListener('click', () => {
        selectedFrameColor = button.dataset.color;
        photoStrip.style.backgroundColor = selectedFrameColor;
    });
});

// **Filter Selection**
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        selectedFilter = button.dataset.filter;
        video.style.filter = selectedFilter; // Apply filter to live video
    });
});

// Download Photo Strip
document.getElementById('downloadPhoto').addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const images = document.querySelectorAll('.captured-image');

    canvas.width = 300;
    canvas.height = images.length * 150 + 50;

    ctx.fillStyle = selectedFrameColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    images.forEach((img, index) => {
        const image = new Image();
        image.src = img.src;
        image.onload = () => {
            ctx.drawImage(image, 25, index * 150 + 10, 250, 140);
            if (index === images.length - 1) {
                const link = document.createElement('a');
                link.download = 'photo_strip.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        };
    });
});

// Retake Photos
document.getElementById('retakePhotos').addEventListener('click', () => {
    location.reload();
});

// Send to Email
document.getElementById('sendEmail').addEventListener('click', () => {
    const email = emailInput.value.trim();
    if (email === "") {
        alert("Please enter an email address.");
        return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const images = document.querySelectorAll('.captured-image');

    canvas.width = 300;
    canvas.height = images.length * 150 + 50;

    ctx.fillStyle = selectedFrameColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    images.forEach((img, index) => {
        const image = new Image();
        image.src = img.src;
        image.onload = () => {
            ctx.drawImage(image, 25, index * 150 + 10, 250, 140);
            if (index === images.length - 1) {
                const photoData = canvas.toDataURL('image/png');

                fetch('send_email.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, image: photoData })
                })
                .then(response => response.text())
                .then(data => alert(data))
                .catch(error => console.error('Error:', error));
            }
        };
    });
});
