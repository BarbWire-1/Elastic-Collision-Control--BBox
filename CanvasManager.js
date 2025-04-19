/*
* MIT License
*
* Copyright(c) 2025 Barbara Kälin aka BarbWire - 1
*/

import ShapeCollisionManager from "./ShapeCollisionManager.js";
// TODO in general add a single/double loop and only pass callbacks here???
// TODO - compare performance on handling single/all - and usage of callbacks. LOTS of overhead

//TODO move collisionPoint drawing to collisionManager
class CanvasManager {
	constructor (canvas, shapes = [], animationCallbacks = { 'global': [], 'shape': [], 'shapes': [] }) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.shapes = shapes;
		this.isAnimating = false;
		this.animationFrameId = null;
		this.collisionHandler = new ShapeCollisionManager();
		this.collisionPoints = new Map(); // store collision points in a Map for uniqueness and lifetime
		this.animationCallbacks = animationCallbacks;
		this.factories = [];



	}
	// dependency injection for loosly coupling and as a bonus allow multiple factories to be handled here
	// TODO - check this later with existing mixin-system. That could be fun!!!
	init() {

		const dependencyMap = {

			ctx: this.ctx,
			addShape: this.addShape.bind(this),
			initialDraw: this.initialDraw.bind(this),
			shapes: this.shapes,
			stopAnimation: this.stopAnimation.bind(this),
			animationCallbacks: this.animationCallbacks,
			canvas: this.canvas,
		};

		this.factories.forEach(factory => {
			const dependencies = factory.dependencies || {};
			const injected = {};

			for (const key in dependencies) {
				const depName = dependencies[ key ];
				depName in dependencyMap ?
					injected[ key ] = dependencyMap[ depName ]
					: console.warn(`Unknown dependency: ${depName} requested from ${factory.name ?? factory}`);

			}

			factory(injected);// call the factory with passed requested dependencies
		});
		this.initialDraw()
	}
	// only added for now (?) to once draw before triggering the animation
	initialDraw() {
		this.clear();
		this.runGlobalCallbacks();

		for (let i = 0; i < this.shapes.length; i++) {
			const shape = this.shapes[ i ];
			shape.draw(this.ctx);
			this.runShapeCallbacks(shape, i);
		}
	}


	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	addShape(shape) {
		this.shapes.push(shape)
	}

	// global callbacks
	runGlobalCallbacks() {
		if (!this.animationCallbacks.global.length) return;
		for (let i = 0; i < this.animationCallbacks.global.length; i++) {
			this.animationCallbacks?.global[ i ]();
		}
	}

	// shape-specific callbacks
	runShapeCallbacks(shape, i) {
		for (let j = 0; j < this.animationCallbacks?.shape.length; j++) {
			this.animationCallbacks.shape[ j ](shape, i);
		}
	}

	animate() {
		if (!this.isAnimating) return;
		this.clear();

		const shapes = this.shapes;

		// global callbacks before per-shape stuff
		this.runGlobalCallbacks();

		// single pass: update, draw, run callbacks, check collisions
		for (let i = 0; i < shapes.length; i++) {
			const shape = shapes[ i ];

			shape.update();               		// Physics / movement
			shape.draw(this.ctx);         		// Draw to canvas
			this.runShapeCallbacks(shape, i); 	// Callbacks like pocket check here

			// Collision check (only with other shapes after this one)
			for (let j = i + 1; j < shapes.length; j++) {
				const shapeB = shapes[ j ];
				const collisionPoint = ShapeCollisionManager.resolveCollision(shape, shapeB);

				collisionPoint && this.handleCollisionPoint(collisionPoint);

			}
		}
		// => draw collisionMarks for lifetime, then delete point
		this.handleCollisionPointsLifeCycle()

		this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
	}

	// create a star at point as long as stored
	handleCollisionPoint(collisionPoint) {
		const key = collisionPoint;
		if (!this.collisionPoints.has(key)) {
			this.collisionPoints.set(key, {
				key: collisionPoint,
				shape: this.generateStar(collisionPoint,
					6 + Math.floor(Math.random() * 4),
					6,
					15
				),
				lifetime: 5
			});
		}
	}

	handleCollisionPointsLifeCycle() {
		// Clean up collision points and draw effects
		this.collisionPoints.forEach((cp, key) => {
			cp.lifetime--;
			if (cp.lifetime <= 0) {
				this.collisionPoints.delete(key);
			} else {
				this.ctx.beginPath();
				cp.shape.forEach((point, index) => {
					if (index === 0) {
						this.ctx.moveTo(point.x, point.y);
					} else {
						this.ctx.lineTo(point.x, point.y);
					}
				});
				this.ctx.closePath();
				this.ctx.strokeStyle = "yellow";
				this.ctx.lineWidth = 3;
				this.ctx.stroke();
				this.ctx.fillStyle = "red";
				this.ctx.fill();
			}
		});
	}

	// generate star shape
	generateStar(center, spikes, innerRadius, outerRadius) {
		const points = [];
		for (let i = 0; i < spikes * 2; i++) {
			const angle = (Math.PI * i) / spikes;
			const radius = i % 2 === 0 ? outerRadius : innerRadius;
			points.push({
				x: center.x + Math.cos(angle) * radius,
				y: center.y + Math.sin(angle) * radius
			});
		}
		return points;
	}

	startAnimation() {
		if (this.isAnimating) return;
		this.isAnimating = true;
		this.animate();
	}

	stopAnimation() {
		cancelAnimationFrame(this.animationFrameId);
		this.animationFrameId = null;
		this.isAnimating = false;
	}
}

export default CanvasManager;
