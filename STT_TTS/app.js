// app.js - Pure Speech-to-Text & Text-to-Speech implementation

document.addEventListener('DOMContentLoaded', () => {
    // --- Speech to Text (STT) Setup ---
    const sttBtn = document.getElementById('stt-btn');
    const sttBtnText = document.getElementById('stt-btn-text');
    const clearSttBtn = document.getElementById('clear-stt-btn');
    const sttOutput = document.getElementById('stt-output');
    const sttStatus = document.getElementById('stt-status');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isListening = false;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true; // Keep listening until explicitly stopped
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isListening = true;
            sttStatus.textContent = 'Listening...';
            sttStatus.className = 'badge active';
            sttBtnText.textContent = 'Stop Listening';
            sttBtn.classList.remove('btn-primary');
            sttBtn.classList.add('btn-danger');
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                sttOutput.value += finalTranscript;
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech Recognition Error:', event.error);
            resetSTTUI();
        };

        recognition.onend = () => {
            resetSTTUI();
        };

        sttBtn.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else {
        sttOutput.value = 'Speech recognition is not supported in this browser. Please try Google Chrome or MS Edge.';
        sttBtn.disabled = true;
    }

    clearSttBtn.addEventListener('click', () => {
        sttOutput.value = '';
    });

    function resetSTTUI() {
        isListening = false;
        sttStatus.textContent = 'Idle';
        sttStatus.className = 'badge';
        sttBtnText.textContent = 'Start Listening';
        sttBtn.classList.remove('btn-danger');
        sttBtn.classList.add('btn-primary');
    }

    // --- Text to Speech (TTS) Setup ---
    const ttsInput = document.getElementById('tts-input');
    const voiceSelect = document.getElementById('voice-select');
    const rateRange = document.getElementById('rate-range');
    const rateVal = document.getElementById('rate-val');
    const pitchRange = document.getElementById('pitch-range');
    const pitchVal = document.getElementById('pitch-val');
    const speakBtn = document.getElementById('speak-btn');
    const stopTtsBtn = document.getElementById('stop-tts-btn');
    const ttsStatus = document.getElementById('tts-status');

    const synth = window.speechSynthesis;
    let voices = [];

    function populateVoiceList() {
        if (!synth) return;
        voices = synth.getVoices();
        voiceSelect.innerHTML = '';

        voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            option.value = index;
            if (voice.default) {
                option.selected = true;
            }
            voiceSelect.appendChild(option);
        });
    }

    populateVoiceList();
    if (synth && synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = populateVoiceList;
    }

    // Update range labels dynamically
    rateRange.addEventListener('input', () => {
        rateVal.textContent = rateRange.value;
    });

    pitchRange.addEventListener('input', () => {
        pitchVal.textContent = pitchRange.value;
    });

    speakBtn.addEventListener('click', () => {
        if (!synth) return;
        const text = ttsInput.value.trim();
        if (!text) return;

        // Cancel any ongoing speech
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoiceIndex = voiceSelect.value;
        if (voices[selectedVoiceIndex]) {
            utterance.voice = voices[selectedVoiceIndex];
        }

        utterance.rate = parseFloat(rateRange.value);
        utterance.pitch = parseFloat(pitchRange.value);

        utterance.onstart = () => {
            ttsStatus.textContent = 'Speaking...';
            ttsStatus.className = 'badge speaking';
            stopTtsBtn.disabled = false;
        };

        utterance.onend = () => {
            resetTTSUI();
        };

        utterance.onerror = (e) => {
            console.error('Speech Synthesis Error:', e);
            resetTTSUI();
        };

        synth.speak(utterance);
    });

    stopTtsBtn.addEventListener('click', () => {
        if (synth) {
            synth.cancel();
            resetTTSUI();
        }
    });

    function resetTTSUI() {
        ttsStatus.textContent = 'Idle';
        ttsStatus.className = 'badge';
        stopTtsBtn.disabled = true;
    }
});
