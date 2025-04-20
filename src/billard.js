/*
* MIT License
*
* Copyright(c) 2025 Barbara Kälin aka BarbWire - 1
*/

import { Circle } from "./Shapes.js";
// TODO add real queue with drag control for angle and power

// TODO only pass ctx as arg and return all necessary for usage with handler!!!!
// TODO convert to an object to pass as mixin?
// hide cueball inputs if hasCueball, add popup : want to create a new cueBall?.... when dropped
export function billardSimulation(dependencies) {

	const {
		ctx,
		addShape,
		initialDraw,
		shapes,
		stopAnimation,
		animationCallbacks,
		canvas
	} = dependencies;




	const ballRadius = 20;
	const mass = 1;
	const pR = 30; // pocketRadius
	const w = canvas.width;
	const h = canvas.height;
	let hasCueBall = false;

	function createFrame(ctx) {
		const fW = 30;
		ctx.strokeStyle = 'rgb(116, 85, 35)';
		ctx.lineWidth = fW;
		ctx.strokeRect(fW / 2, fW / 2, w - fW, h - fW);

		// trying to eliminate the strange thing a balls[0] by resetting
		ctx.strokeStyle = undefined;
		ctx.lineWidth = 0
	}

	const getCueBallVelocity = () => {
		const vx = parseFloat(document.getElementById('vx').value);
		const vy = parseFloat(document.getElementById('vy').value);
		return { x: vx * SPEED_MULTIPLIER, y: vy * SPEED_MULTIPLIER };
	};

	const createCueBall = () => new Circle(
		{
			position: { x: 100, y: canvas.height / 2 },
			radius: ballRadius,
			mass: mass,
			velocity: getCueBallVelocity(),
			color: "white",
			margin: ballRadius
		}
	);

	document.getElementById('createCueBall').addEventListener('click', () => {
		if (hasCueBall) return;
		const cueBall = createCueBall();
		cueBall.id = "cueBall";
		addShape(cueBall);
		initialDraw();
		hasCueBall = true;
	});

	// create balls arranged in a rhombus pattern
	const createRhombusBalls = () => {
		const spacing = ballRadius * 2;
		const rhombusBalls = [];
		const startX = 490;
		const startY = canvas.height / 2;
		let rows = 5;

		for (let i = 0; i < rows; i++) {
			// get position per row (5 rows => 1-3-5-3-1)
			const numBalls = i < Math.ceil(rows / 2) ? i + 1 : rows - i;
			const offsetX = spacing * i;
			const offsetY = -spacing * (numBalls - 1) / 2;

			// create shapes per row
			for (let j = 0; j < numBalls; j++) {
				ctx.globalCompositeOperator = "destination-under"
				rhombusBalls.push(
					new Circle(
						{
							position: {
								x: startX + offsetX,
								y: startY + offsetY + j * spacing,
							},
							radius: ballRadius,
							mass: mass,
							velocity: { x: 0, y: 0 },
							color: `hsl(${(i * 60 + j * 20) % 360}, 100%, 50%)`,
							margin: ballRadius
						}

					)
				);
			}
		}
		return rhombusBalls;
	};

	const pocketPositions = [
		{ x: pR, y: pR },             // top-left
		{ x: w / 2, y: pR },           // top-middle
		{ x: w - pR, y: pR },         // top-right
		{ x: pR, y: h - pR },         // bottom-left
		{ x: w / 2, y: h - pR },      // bottom-middle
		{ x: w - pR, y: h - pR },     // bottom-right
	];

	const createPockets = (ctx) => {

		ctx.fillStyle = "black";
		for (const pos of pocketPositions) {
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, pR, 0, Math.PI * 2);
			ctx.fill();
		}

	};

	const createPocketsCutouts = (ctx) => {

		ctx.fillStyle = "black";
		for (const pos of pocketPositions) {
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, pR-10, 0, Math.PI * 2);
			ctx.fill();
		}

		//return pocketPositions;
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
					shapes.splice(i, 1);
					if (shape.id === "cueBall") {
						hasCueBall = false;

						// If cueball falls, pause and sets flag to allow adding new one
						setTimeout(() => {
							stopAnimation();
						}, 50); // necessary to not stop before next frame
					}
					break;
				}

			}
		};
	};



	// Set up collision callbacks for the balls - hmmm.... better return methods and do that in main?

	// Setup the simulation components
	const balls = createRhombusBalls();
	const callbacks = animationCallbacks;

	// Add the shapes to CanvasHandler
	balls.forEach(shape => addShape(shape));
	callbacks.global.push(() => createPockets(ctx))
	callbacks.global.push(() => createFrame(ctx));
	callbacks.global.push(() => createPocketsCutouts(ctx))
	callbacks.shape.push(checkPocketCollision(pocketPositions, pR))
}

billardSimulation.dependencies = {
	ctx: 'ctx',
	addShape: 'addShape',
	initialDraw: 'initialDraw',
	shapes: 'shapes',
	stopAnimation: 'stopAnimation',
	animationCallbacks: 'animationCallbacks',
	canvas: 'canvas'
};
