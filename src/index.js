/*
* MIT License
*
* Copyright(c) 2025 Barbara Kälin aka BarbWire - 1
*/

// TODO implement drawing as polygons to handle collision on contourPoints instead of bbox (now simplified for testing energy-transfer only - no other physical forces applied here)
// TODO keep shape-subclasses or add an object of drawRules by type???
// TODO - make mixins , add physics props (worlds, materials)


//TODO - change animationCallbacks to handle global/shape/ shape-otherShape and call in animate where structure fits!
// TODO look for nicer sound on hit (some drop in there not nicely to cut out)
// TODO refactor -
/**
 * - Make modules subscribe to effectsHandler
 * - Make more modular: modules can bring their own canvas or use a global one
 * - shapes to be stored per module and canvas to draw on.
 * - Add some kind of prop to define drawSequence over all
*/

//TODO - check performance (overhead!) when bundled!!!!
import { billardSimulation } from "./CanvasModules/billard.js";
import CanvasManager from "./Canvas/CanvasManager.js";


// global variables - mainly debugginging purposes
globalThis.LOG = false;
globalThis.DRAW_INFO = false;
globalThis.SPEED_MULTIPLIER = 1.0;

// ====================
// CANVAS SETUP
// ====================
const canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 500;

// CANVASHANDLER
const canvasHandler = new CanvasManager(canvas);
// add modules to canvas - here billardSimulation
canvasHandler.modules.push(billardSimulation);
canvasHandler.init();// initialises dependencies of modules and first static draw

// start animationLoop
canvasHandler.startAnimation();

//--------------------------------------------------------------------------------------------------

// ======================
// BUTTON AND INPUT STUFF
// ======================
// - for logs, info and animationHandling
const button = document.getElementById("toggleButton");

function toggleAnimation() {
	if (canvasHandler.isAnimating) {
		canvasHandler.stopAnimation();
		button.textContent = "Resume Animation";
	} else {
		canvasHandler.startAnimation();
		button.textContent = "Pause Animation";
	}
}


button.addEventListener("click", toggleAnimation);

const toggleDebugInfo = () => (DRAW_INFO = !DRAW_INFO);
const toggleLogs = () => LOG = !LOG;
document
	.getElementById("toggleDebugButton")
	.addEventListener("click", toggleDebugInfo);

document
	.getElementById("toggleLogButton")
	.addEventListener("click", toggleLogs);


const speedRange = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");

speedRange.addEventListener("input", (e) => {
	SPEED_MULTIPLIER = parseFloat(e.target.value);
	speedValue.textContent = `${SPEED_MULTIPLIER.toFixed(1)}x`;
});
