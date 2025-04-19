// TODO implement drawing as polygons to handle collision on contourPoints instead of bbox (now simplified for testing energy-transfer only - no other physical forces applied here)
// TODO keep shape-subclasses or add an object of drawRules by type???
// TODO - make mixins , add physics props (worlds, materials)


//TODO - change animationCallbacks to handle global/shape/ shape-otherShape and call in animate where structure fits!
// TODO refactor and separate this "billard" playstuff to splice into canvasManager

//TODO - check performance (overhead!) when bundled!!!!
import { createBillardSimulation } from "./billard.js";
import CanvasManager from "./CanvasManager.js";


// global var, like DRAW_INFO for debugging purposes only
globalThis.LOG = false;
globalThis.DRAW_INFO = true;

// SET UP CANVAS
const canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 500;

// CANVASHANDLER WITH COLLISIONHANDLER
const canvasManager = new CanvasManager(canvas);
// BILLARD
createBillardSimulation(canvasManager)



// BUTTON STUFF
const button = document.getElementById("toggleButton");

function toggleAnimation() {
	if (canvasManager.isAnimating) {
		canvasManager.stopAnimation();
		button.textContent = "Resume Animation";
	} else {
		canvasManager.startAnimation();
		button.textContent = "Stop Animation";
	}
}
toggleAnimation()
button.addEventListener("click", toggleAnimation);

const toggleDebugInfo = () => (DRAW_INFO = !DRAW_INFO);
document
	.getElementById("toggleDebugButton")
	.addEventListener("click", toggleDebugInfo);
