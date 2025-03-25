// Check for browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    console.log("Speech Recognition is supported!");

    // Initialize recognition
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    // Elements
    const searchBar = document.getElementById('searched_value');
    const voiceButton = document.getElementById('voice-search-btn');
    const clearButton = document.getElementById('clear-btn');

    // Voice search button click
    voiceButton.addEventListener('click', () => {
        recognition.start();
        console.log("Listening...");
    });

    // Handle speech recognition results
    recognition.addEventListener('result', (event) => {
        let transcript = event.results[0][0].transcript;

        // Clean punctuation from the end
        transcript = transcript.trim().replace(/[.,!?]$/, "");
        console.log("Recognized text:", transcript);

        // Set recognized text to search input
        searchBar.value = transcript;
        searchForm.submit();
    });

    // Clear search bar
    clearButton.addEventListener('click', () => {
        searchBar.value = "";
    });

    // Error handling
    recognition.addEventListener('error', (event) => {
        console.error("Speech recognition error:", event.error);
        alert("Error: " + event.error);
    });
} else {
    console.log("Sorry, your browser does not support Speech Recognition.");
}
