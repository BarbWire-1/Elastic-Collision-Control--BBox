/*
* MIT License
*
* Copyright(c) 2025 Barbara Kälin aka BarbWire - 1
*/

import { Circle } from "../Collision/CollidingShapes.js";


// TODO go with the dependency approach? - test adding another layer of coordinating drawSequence
// TODO - add dumping/friction?
// or keep as is for elastic collision demonstartion?



export function billardSimulation(dependencies) {
	// ============================
	//  Destructured Dependencies
	// ============================
	// Destructuring the required methods and properties from dependencies
	// These come from the CanvasManager and are used for drawing on the canvas

	const {
		ctx,
		addShape,
		shapes,
		callbacks,
		canvas,
	} = dependencies;

	// ======================
	//  Variables
	// ======================
	// Canvas dimensions
	const w = canvas.width;
	const h = canvas.height;

	// Ball radius and mass
	const ballRadius = 20;
	const mass = 1;
	const pR = 30; // pocket radius

	// Pocket positions (coordinates of the pockets on the table)
	const pocketPositions = [
		{ x: pR, y: pR }, 			// Top-left pocket
		{ x: w / 2, y: pR }, 		// Top-center pocket
		{ x: w - pR, y: pR }, 		// Top-right pocket
		{ x: pR, y: h - pR }, 		// Bottom-left pocket
		{ x: w / 2, y: h - pR }, 	// Bottom-center pocket
		{ x: w - pR, y: h - pR }, 	// Bottom-right pocket
	];

	let cueBall = null;

	// flags
	let hasCueBall = false;
	let aiming = false;


	// ======================
	//  DOM Elements
	// ======================
	const cueBallSetupDiv = document.getElementById('cueBallSetup');
	const angleInput = document.getElementById('angleInput');
	const powerInput = document.getElementById('powerInput');
	const cueXInput = document.getElementById('cueXInput');
	const cueYInput = document.getElementById('cueYInput');


	// ======================
	//  Event Delegation
	// ======================
	document.addEventListener('input', handleInputEvent);
	document.addEventListener('click', handleClickEvent);

	function handleInputEvent(event) {
		const target = event.target;

		if (target === angleInput || target === powerInput) {
			updateAimLine();
		}

		if (target === cueXInput || target === cueYInput) {
			updateCueBallPosition();
		}
	}

	function handleClickEvent(event) {
		const target = event.target;

		if (target.id === 'shootButton') {
			shootCueBall();
		}

		if (target.id === 'newShoot') {
			newShoot();
		}
	}

	// ======================
	//  Functions
	// ======================

	// create canvas elements
	// static
	function createFrame(ctx) {
		const fW = 30;
		ctx.strokeStyle = 'rgb(116, 85, 35)';
		ctx.lineWidth = fW;
		ctx.strokeRect(fW / 2, fW / 2, w - fW, h - fW);
		ctx.strokeStyle = undefined;
		ctx.lineWidth = 0;
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

	// animated
	// balls passed to shape for collisionCheck and -handling
	function getCueBallVelocity() {
		const angleDeg = +angleInput.value;
		const power = +powerInput.value;
		const angleRad = angleDeg * (Math.PI / 180);
		const SPEED_MULTIPLIER = .2;

		return {
			x: Math.cos(angleRad) * power * SPEED_MULTIPLIER,
			y: Math.sin(angleRad) * power * SPEED_MULTIPLIER
		};
	}
	// new cueball position
	function updateCueBallPosition() {
		const x = +cueXInput.value;
		const y = +cueYInput.value;
console.log(x,y)
		// cue ballwithin the left half of the table
		if (x >= 0 && x <= canvas.width / 2 && y >= 0 && y <= canvas.height) {

				cueBall.position = { x, y };


		}
	}
	// drawn when setup angle and power before shoot
	function updateAimLine() {
		if (!aiming) return;

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
		updateAimLine();
	}

	// setup other balls - here 9 in a rhombus
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

	// play
	function shootCueBall() {
		if (hasCueBall) return;
		cueBall.velocity = getCueBallVelocity();
		aiming = false;
		cueBallSetupDiv.style.display = 'none';// hide if ball in game
		hasCueBall = true;

}

	// stop all balls and create new cueBall
	function newShoot() {
		hasCueBall = false;

		for (let i = 0; i < shapes.length;) {
			shapes[ i ].id === 'cueBall'
				? shapes.splice(i, 1)// do NOT increment!!
				: (shapes[ i ].velocity = { x: 0, y: 0 }, i++);
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
	// Setup - Create balls and Pass Callbacks to CanvasManager
	// ======================
	const balls = createRhombusBalls();
	createCueball();

	const global = callbacks.global;

	balls.forEach(shape => addShape(shape));
	global.push(() => createPockets(ctx));
	global.push(() => createFrame(ctx));
	global.push(() => createPocketsCutouts(ctx));
	callbacks.shape.push(checkPocketCollision(pocketPositions, pR));
	callbacks.shape.push(updateAimLine);
}

// ======================
// Depenedencies
// ======================
billardSimulation.dependencies = {
	ctx: 'ctx',
	addShape: 'addShape',
	shapes: 'shapes',
	callbacks: 'animationCallbacks',
	canvas: 'canvas'
};