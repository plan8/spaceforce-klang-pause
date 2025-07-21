import SpaceForceKlang from './src/index.ts';

let klang;
let mapOpen = false;

// Initialize the audio system
async function init() {
    try {
        klang = new SpaceForceKlang();
        await klang.init();
        await klang.initHomePage();
        
        document.getElementById('status').textContent = 'Ready! Audio system initialized.';
        document.getElementById('status').style.background = '#2d5aa0';
        
        // Set up scroll value display
        const scrollSlider = document.getElementById('scrollValue');
        const scrollDisplay = document.getElementById('scrollDisplay');
        scrollSlider.addEventListener('input', (e) => {
            scrollDisplay.textContent = e.target.value;
        });
        
    } catch (error) {
        document.getElementById('status').textContent = `Error: ${error.message}`;
        document.getElementById('status').style.background = '#e74c3c';
        console.error('Initialization error:', error);
    }
}

// Scene transitions
function changeScene(sceneName) {
    if (!klang) return;
    console.log(`Changing scene to: ${sceneName}`);
    klang.changeScene(sceneName);
}

// Text scramble effects
function textScramble(text) {
    if (!klang) return;
    console.log(`Text scramble: ${text}`);
    klang.textScramble(text);
}

function stopTextScramble() {
    if (!klang) return;
    console.log('Stopping text scramble');
    klang.stopTextScramble();
}

// Oneshot sounds
function triggerOneshot(key) {
    if (!klang) return;
    console.log(`Triggering oneshot: ${key}`);
    klang.trigger(key);
}

// Special controls
function toggleMap() {
    if (!klang) return;
    mapOpen = !mapOpen;
    klang.setIsMapOpen(mapOpen);
    document.getElementById('mapButton').textContent = mapOpen ? 'Close Map' : 'Open Map';
    console.log(`Map ${mapOpen ? 'opened' : 'closed'}`);
}

function startTextRolling() {
    if (!klang) return;
    console.log('Starting text rolling');
    klang.startTextRolling();
}

function stopTextRolling() {
    if (!klang) return;
    console.log('Stopping text rolling');
    klang.stopTextRolling();
}

function showGuardians() {
    if (!klang) return;
    console.log('Showing guardians');
    klang.showGuardians();
}

function hideGuardians() {
    if (!klang) return;
    console.log('Hiding guardians');
    klang.hideGuardians();
}

// Capabilities testing
function setCapabilitiesStage(stage) {
    if (!klang) return;
    console.log(`Setting capabilities stage: ${stage}`);
    klang.setCapabilitiesStage(stage);
}

function testCapabilitiesScroll() {
    if (!klang) return;
    const scrollValue = parseInt(document.getElementById('scrollValue').value);
    console.log(`Testing capabilities scroll: ${scrollValue}`);
    klang.setCapabilitiesScrollValue(scrollValue);
}

function pauseAllAudio() {
    if (!klang) return;
    console.log('Pausing all audio');
    klang.pauseAllAudio();
}

function resumeAllAudio() {
    if (!klang) return;
    console.log('Resuming all audio');
    klang.resumeAllAudio();
}

// Make functions globally available
window.changeScene = changeScene;
window.textScramble = textScramble;
window.stopTextScramble = stopTextScramble;
window.triggerOneshot = triggerOneshot;
window.toggleMap = toggleMap;
window.startTextRolling = startTextRolling;
window.stopTextRolling = stopTextRolling;
window.showGuardians = showGuardians;
window.hideGuardians = hideGuardians;
window.setCapabilitiesStage = setCapabilitiesStage;
window.testCapabilitiesScroll = testCapabilitiesScroll;
window.pauseAllAudio = pauseAllAudio;
window.resumeAllAudio = resumeAllAudio;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init); 