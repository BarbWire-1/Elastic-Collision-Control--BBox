import { Circle } from "./Shapes.js";
// TODO add real queue with drag control for angle and power

// hide cueball inputs if hasCueball, add popup : want to create a new cueBall?.... when dropped
export function createBillardSimulation(canvasHandler) {
	const ctx = canvasHandler.ctx
	const ballRadius = 20;
	const mass = 1;
	const spacing = ballRadius * 2;
let hasCueBall = false;

	const getCueBallVelocity = () => {
		const vx = parseFloat(document.getElementById('vx').value);
		const vy = parseFloat(document.getElementById('vy').value);
		return { x: vx * SPEED_MULTIPLIER, y: vy * SPEED_MULTIPLIER };
	};

	const createCueBall = () => new Circle(
		{ x: 100, y: canvas.height / 2 },
		ballRadius,
		mass,
		getCueBallVelocity(),
		"white"
	);

	document.getElementById('createCueBall').addEventListener('click', () => {
		if (hasCueBall) return;
		const cueBall = createCueBall();
		cueBall.id = "cueBall";
		canvasHandler.addShape(cueBall);
		canvasHandler.drawOnce(); // so it appears without animating
		hasCueBall = true;
	});


	// Create balls arranged in a rhombus pattern
	const createRhombusBalls = () => {
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
		return rhombusBalls;
	};
	const pocketRadius = 30;
	// Define pocket positions
	const createPockets = (ctx) => {

		const w = canvas.width;
		const h = canvas.height;

		const pocketPositions = [
			{ x: 10, y: 10 },             // top-left
			{ x: w / 2, y: 0 },           // top-middle
			{ x: w - 10, y: 10 },         // top-right
			{ x: 10, y: h - 10 },         // bottom-left
			{ x: w / 2, y: h },           // bottom-middle
			{ x: w - 10, y: h - 10 },     // bottom-right
		];

		ctx.fillStyle = "black";
		for (const pos of pocketPositions) {
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, pocketRadius, 0, Math.PI * 2);
			ctx.fill();
		}

		return pocketPositions;
	};

	// Collision checking for when balls fall into pockets
	const checkPocketCollision = (pocketPositions, pocketRadius) => {
		return (shape, i) => {
			for (const pocket of pocketPositions) {
				const dx = shape.position.x - pocket.x;
				const dy = shape.position.y - pocket.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance - 4 < pocketRadius) {
					// Remove the ball that falls into the pocket
					canvasHandler.shapes.splice(i, 1);
					if (shape.id === "cueBall") {
						hasCueBall = false;

						// Add a delay before stopping the animation
						setTimeout(() => {
							canvasHandler.stopAnimation();
						}, 50); // Adjust time based on how long the animation takes to render one frame
					}
					break;
				}

			}
		};
	};

	// Setup the simulation components
	//const cueBall = createCueBall();
	const rhombusBalls = createRhombusBalls();
	const pocketPositions = createPockets(ctx);

	// Combine all shapes for the simulation
	const shapes = [ ...rhombusBalls ];

	// Add the shapes to CanvasHandler
	shapes.forEach(shape => canvasHandler.addShape(shape));

	// Set up collision callbacks for the balls
	const callbacks = canvasHandler.animationCallbacks;
callbacks.global.push(() =>createPockets(canvasHandler.ctx))
	callbacks.shape.push(checkPocketCollision(pocketPositions, pocketRadius))




// 	// Return the simulation components if needed
// 	return {
// 		cueBall,
// 		rhombusBalls,
// 		pocketPositions
// 	};
 }
