import { Circle } from "./Shapes.js";
// TODO add real queue with drag control for angle and power

// TODO only pass ctx as arg and return all necessary for usage with handler!!!!

// hide cueball inputs if hasCueball, add popup : want to create a new cueBall?.... when dropped
export function createBillardSimulation(canvasHandler) {
	const ctx = canvasHandler.ctx
	const ballRadius = 20;
	const mass = 1;

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
		canvasHandler.drawOnce(); // pre-draws without animating
		hasCueBall = true;
	});


	// create balls arranged in a rhombus pattern
	const createRhombusBalls = () => {
		const spacing = ballRadius * 2;
		const rhombusBalls = [];
		const startX = 450;
		const startY = canvas.height / 2;
		let rows = 5;

		for (let i = 0; i < rows; i++) {
			// get position per row (5 rows => 1-3-5-3-1)
			const numBalls = i < Math.ceil(rows / 2) ? i + 1 : rows - i;
			const offsetX = spacing * i;
			const offsetY = -spacing * (numBalls - 1) / 2;

			// create shapes per row
			for (let j = 0; j < numBalls; j++) {
				rhombusBalls.push(
					new Circle(
						{
							x: startX + offsetX,
							y: startY + offsetY + j * spacing,
						},
						ballRadius,
						mass,
						{ x: 0, y: 0 },
						`hsl(${(i * 60 + j * 20) % 360}, 100%, 50%)`
					)
				);
			}
		}
		return rhombusBalls;
	};
	const pocketRadius = 30;

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

						// If cueball falls, pause and sets flag to allow adding new one
						setTimeout(() => {
							canvasHandler.stopAnimation();
						}, 50); // necessary to not stop before next frame
					}
					break;
				}

			}
		};
	};

	// Setup the simulation components
	const balls = createRhombusBalls();
	const pocketPositions = createPockets(ctx);


	// Add the shapes to CanvasHandler
	balls.forEach(shape => canvasHandler.addShape(shape));

	// Set up collision callbacks for the balls - hmmm.... better return methods and do that in main?
	const callbacks = canvasHandler.animationCallbacks;
	callbacks.global.push(() => createPockets(canvasHandler.ctx))
	callbacks.shape.push(checkPocketCollision(pocketPositions, pocketRadius))




		// Return the simulation components if needed
// 		return {
//
// 			createPockets,
// 			checkPocketCollision,
// 			balls,
// 			pocketPositions,
// 	     pocketRadius
// 		};
}
