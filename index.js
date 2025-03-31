// TODO implement drawing as polygons to handle collision on contourPoints instead of bbox (now simplified for testing energy-transfer only - no other physical forces applied here)
// TODO keep shape-subclasses or add an object of drawRules by type???
// TODO - make mixins , add physics props (worlds, materials)
import CanvasManager from "./CanvasManager.js";
import { Circle, Rectangle } from "./Shapes.js";

// global var, like DRAW_INFO for debugging purposes only
LOG = true;

// SET UP CANVAS
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

// INSTANTIATE
const shapes = [
	new Circle({ x: 200, y: 300 }, 30, 2, { x: 2, y: 2 }, "red"),
	new Circle({ x: 500, y: 300 }, 40, 3, { x: 3, y: -2 }, "blue"),
	new Rectangle({ x: 100, y: 100 }, 50, 30, 4, { x: 1, y: 1 }, "green"),
	new Rectangle({ x: 400, y: 200 }, 60, 40, 5, { x: -1, y: -1 }, "purple")
];

const canvasManager = new CanvasManager(canvas, ctx, shapes);

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

button.addEventListener("click", toggleAnimation);

const toggleDebugInfo = () => (DRAW_INFO = !DRAW_INFO);
document
	.getElementById("toggleDebugButton")
	.addEventListener("click", toggleDebugInfo);
