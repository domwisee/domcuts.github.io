let selectedOption = null;

function selectOption(pictures) {
    selectedOption = pictures;
    document.getElementById("startButton").style.display = "block";

    // Update the selected message
    let message = `You selected the ${pictures} cuts.`;
    document.getElementById("selectedMessage").innerText = message;

    // Remove highlights from all options
    document.querySelectorAll(".option").forEach(option => {
        option.classList.remove("selected");
    });

    // Highlight the selected option
    document.getElementById(`option${pictures}`).classList.add("selected");
}

function start() {
    if (selectedOption) {
        localStorage.setItem("selectedPictures", selectedOption);
        window.location.href = "secondpage.html";
    }
}

// Function to update secondpage.html content
window.onload = function () {
    let selectedPictures = localStorage.getItem("selectedPictures");

    if (selectedPictures) {
        // Check if we're on the warning page
        if (document.getElementById("selectedMessage")) {
            document.getElementById("selectedMessage").innerText = `You selected ${selectedPictures} cuts!`;
        }
        if (document.getElementById("timeLimit")) {
            document.getElementById("timeLimit").innerText = "3"; // Set to 3 seconds per shot
        }

        // If we're on the selection page, ensure correct highlighting
        if (document.getElementById(`option${selectedPictures}`)) {
            document.getElementById(`option${selectedPictures}`).classList.add("selected");
            document.getElementById("startButton").style.display = "block";
        }
    }
};

// Function to proceed after the warning page
function proceed() {
    window.location.href = "thirdpage.html";
}
