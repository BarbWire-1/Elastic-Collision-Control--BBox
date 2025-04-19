// TODO implement drawing as polygons to handle collision on contourPoints instead of bbox (now simplified for testing energy-transfer only - no other physical forces applied here)
// TODO keep shape-subclasses or add an object of drawRules by type???
// TODO - make mixins , add physics props (worlds, materials)


//TODO - change animationCallbacks to handle global/shape/ shape-otherShape and call in animate where structure fits!
// TODO refactor and separate this "billard" playstuff to splice into canvasManager
import CanvasManager from "./CanvasManager.js";
import { Circle, Rectangle } from "./Shapes.js";

// global var, like DRAW_INFO for debugging purposes only
globalThis.LOG = false;
globalThis.DRAW_INFO = false

// SET UP CANVAS
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

const ballRadius = 25;
const mass = 2;
const spacing = ballRadius * 2 ;

// Cue ball (massive velocity)
const cueBall = new Circle(
	{ x: 100, y: canvas.height / 2 },
	ballRadius,
	mass,
	{ x: 10, y: 0 }, // Massive horizontal velocity
	"white"
);

// Arrange balls in a rhombus shape
const rhombusBalls = [];
const startX = 450;
const startY = canvas.height / 2;
let rows = 5;

for (let row = 0; row < rows; row++) {
	const numBalls = row < Math.ceil(rows / 2) ? row + 1 : rows - row;
	const offsetX = spacing * row;
	const offsetY = -spacing * (numBalls - 1) / 2;

	for (let col = 0; col < numBalls; col++) {
		rhombusBalls.push(
			new Circle(
				{
					x: startX + offsetX,
					y: startY + offsetY + col * spacing,
				},
				ballRadius,
				mass,
				{ x: 0, y: 0 },
				`hsl(${(row * 60 + col * 20) % 360}, 100%, 50%)`
			)
		);
	}
}
let pocketPositions = undefined
function drawPockets(ctx) {
	const pocketRadius = 40;
	const w = canvas.width;
	const h = canvas.height;

	pocketPositions = [
		{ x: 10, y: 10 },               // top-left
		{ x: w / 2, y: 0 },           // top-middle
		{ x: w-10, y: 10 },               // top-right
		{ x: 10, y: h -10},               // bottom-left
		{ x: w / 2, y: h },           // bottom-middle
		{ x: w-10, y: h-10 },               // bottom-right
	];

	ctx.fillStyle = "black";
	for (const pos of pocketPositions) {
		ctx.beginPath();
		ctx.arc(pos.x, pos.y, pocketRadius, 0, Math.PI * 2);
		ctx.fill();
	}
}


const shapes = [ cueBall, ...rhombusBalls ];
const canvasManager = new CanvasManager(canvas, ctx, shapes);



function checkPocketCollision(shapes, pocketPositions, pocketRadius) {
	for (let i = shapes.length - 1; i >= 0; i--) {
		const shape = shapes[ i ];

		for (const pocket of pocketPositions) {
			const dx = shape.position.x - pocket.x;
			const dy = shape.position.y - pocket.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < pocketRadius +5) {
				shapes.splice(i, 1); // Remove shape from array
				break;
			}
		}
	}
}

canvasManager.animationCallbacks = [
	() => drawPockets(canvasManager.ctx),
	() => checkPocketCollision(canvasManager.shapes, pocketPositions, 30)
];



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


	/*
	document.addEventListener('keydown', (e) => {
  if (e.key === 'd') DEBUG_INFO = !DEBUG_INFO;

  class Debuggable {
  constructor() {
    this.DEBUG_INFO = false;
    this._setupDebugToggle();
  }

  _setupDebugToggle() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'd') this.DEBUG_INFO = !this.DEBUG_INFO;
    });
  }

  drawDebugInfo() {
    if (this.DEBUG_INFO) {
      // Custom debug info logic here
      console.log("Debug info on!");
    }
  }
}

});
*/