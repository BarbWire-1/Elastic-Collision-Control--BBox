/*
* MIT License
*
* Copyright(c) 2025 Barbara Kälin aka BarbWire - 1
*/

import { Circle } from "../Collision/CollidingShapes.js";


// TODO only pass ctx as arg and return all necessary for usage with handler!!!!
// TODO convert to an object to pass as mixin?

// TODO - add dumping/friction?
// or keep as is for elastic collision demonstartion?



export function billardSimulation(dependencies) {
	// ============================
	//  Destructured Dependencies
	// ============================
	// props and methods used from the canvasManager
	const {
		ctx,
		addShape,
		initialDraw,
		shapes,
		stopAnimation,
		animationCallbacks,
		canvas,
		startAnimation
	} = dependencies;

	// ======================
	//  Variables
	// ======================

	const w = canvas.width;
	const h = canvas.height;

	const ballRadius = 20;
	const mass = 1;
	const pR = 30; // pocket radius

	let cueBall = null;
	let hasCueBall = false;
	let aiming = true;

	const pocketPositions = [
		{ x: pR, y: pR },
		{ x: w / 2, y: pR },
		{ x: w - pR, y: pR },
		{ x: pR, y: h - pR },
		{ x: w / 2, y: h - pR },
		{ x: w - pR, y: h - pR },
	];

	// ======================
	//  DOM Elements
	// ======================
	// initially hidden, only after cueball fallen first time to position
	const cueBallSetupDiv = document.getElementById('cueBallSetup');
	const cueXInput = cueBallSetupDiv.querySelector('#cueX');
	const cueYInput = cueBallSetupDiv.querySelector('#cueY');

	// plan the shoot...
	const angleInput = document.getElementById('angle');
	const powerInput = document.getElementById('power');
	const shootBtn = document.getElementById('shootButton');

	// stop and add new cueball
const newShootBtn = document.getElementById("newShoot")
	// ======================
	//  Event Listeners
	// ======================
	angleInput.addEventListener('input', updateAimLine);
	powerInput.addEventListener('input', updateAimLine);
	shootBtn.addEventListener('click', () => {
		if (hasCueBall) return;
		cueBall.velocity = getCueBallVelocity();
		aiming = false;
		cueBallSetupDiv.style.display = 'none';
		hasCueBall = true;

	});

	newShootBtn.addEventListener('click', newShoot)
	cueXInput.addEventListener('input', updateCueBallPosition);
	cueYInput.addEventListener('input', updateCueBallPosition);




	// ======================
	//  Functions
	// ======================
	function createFrame(ctx) {
		const fW = 30;
		ctx.strokeStyle = 'rgb(116, 85, 35)';
		ctx.lineWidth = fW;
		ctx.strokeRect(fW / 2, fW / 2, w - fW, h - fW);
		ctx.strokeStyle = undefined;
		ctx.lineWidth = 0;
	}

	function getCueBallVelocity() {
		const angleDeg = parseFloat(angleInput.value);
		const power = parseFloat(powerInput.value);
		const angleRad = angleDeg * (Math.PI / 180);
		const SPEED_MULTIPLIER = .2;

		return {
			x: Math.cos(angleRad)  * power * SPEED_MULTIPLIER,
			y: Math.sin(angleRad) * power * SPEED_MULTIPLIER
		};
	}
	// new cueball position
	function updateCueBallPosition() {
		const x = parseFloat(cueXInput.value);
		const y = parseFloat(cueYInput.value);

		// cue ballwithin the left half of the table
		if (x >= 0 && x <= canvas.width / 2 && y >= 0 && y <= canvas.height) {
			if (cueBall) {
				cueBall.position = { x, y };
				initialDraw();
			}
		}
	}
	// drawn when setup angle and power before shoot
	function updateAimLine() {
		if ( !aiming) return;

		const angle = parseFloat(angleInput.value);
		const power = parseFloat(powerInput.value);
		drawAimLine(ctx, cueBall.position, angle, power);

	}

	function drawAimLine(ctx, origin, angleDeg, power) {

		const angleRad = angleDeg * (Math.PI / 180);
		const length = power * 3;
		const endX = origin.x + Math.cos(angleRad) * length;
		const endY = origin.y + Math.sin(angleRad) * length;

		ctx.beginPath();
		ctx.moveTo(origin.x, origin.y);
		ctx.lineTo(endX, endY);
		ctx.strokeStyle = 'red';
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	function createCueball() {
		if (hasCueBall) return;
		aiming = true;
		cueBall = new Circle({
			position: { x: 100, y: canvas.height / 2 },
			radius: ballRadius,
			mass: mass,
			velocity: { x: 0, y: 0 },
			color: "white",
			margin: ballRadius + 10,
			elasticity: 1
		});
		cueBall.id = "cueBall";
		addShape(cueBall);

		initialDraw();
		updateAimLine();
	}


	function createRhombusBalls() {
		const spacing = ballRadius * 2;
		const rhombusBalls = [];
		const startX = 500;
		const startY = canvas.height / 2;
		let rows = 5;

		for (let i = 0; i < rows; i++) {
			const numBalls = i < Math.ceil(rows / 2) ? i + 1 : rows - i;
			const offsetX = spacing * i;
			const offsetY = -spacing * (numBalls - 1) / 2;

			for (let j = 0; j < numBalls; j++) {
				ctx.globalCompositeOperator = "destination-under";
				rhombusBalls.push(new Circle({
					position: {
						x: startX + offsetX - i * 6,
						y: startY + offsetY + j * spacing,
					},
					radius: ballRadius,
					mass: mass,
					velocity: { x: 0, y: 0 },
					color: `hsl(${(i * 60 + j * 20) % 360}, 100%, 50%)`,
					margin: ballRadius + 10
				}));
			}
		}
		return rhombusBalls;
	}

	function createPockets(ctx) {
		ctx.fillStyle = "black";
		for (const pos of pocketPositions) {
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, pR, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	function createPocketsCutouts(ctx) {
		ctx.fillStyle = "black";
		for (const pos of pocketPositions) {
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, pR - 10, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	function newShoot() {
		hasCueBall = false;

		for (let i = 0; i < shapes.length;) {
			shapes[ i ].id === 'cueBall'
				? shapes.splice(i, 1)// do NOT increment!!
				:(shapes[ i ].velocity = { x: 0, y: 0 },i++);
			}

		setTimeout(() => {
			cueBallSetupDiv.style.display = 'flex';
			createCueball();
		}, 200);
	}



	function checkPocketCollision(pocketPositions, pocketRadius) {
		return (shape, i) => {
			for (const pocket of pocketPositions) {
				const dx = shape.position.x - pocket.x;
				const dy = shape.position.y - pocket.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < pocketRadius + 10) {
					shapes.splice(i, 1);
					if (shape.id === "cueBall") {
						newShoot();
					}
					break;
				}
			}
		};
	}



	// ======================
	// Setup and Run
	// ======================
	const balls = createRhombusBalls();
	const callbacks = animationCallbacks;

	createCueball();

	startAnimation();

	balls.forEach(shape => addShape(shape));
	callbacks.global.push(() => createPockets(ctx));
	callbacks.global.push(() => createFrame(ctx));
	callbacks.global.push(() => createPocketsCutouts(ctx));
	callbacks.shape.push(checkPocketCollision(pocketPositions, pR));
	callbacks.shape.push(updateAimLine);
}

// ======================
// Depenedencies
// ======================
// requested from CanvasManager and used inhere
billardSimulation.dependencies = {
	ctx: 'ctx',
	addShape: 'addShape',
	initialDraw: 'initialDraw',
	shapes: 'shapes',
	stopAnimation: 'stopAnimation',
	startAnimation: 'startAnimation',
	animationCallbacks: 'animationCallbacks',
	canvas: 'canvas'
};