/*
* MIT License
*
* Copyright(c) 2025 Barbara Kälin aka BarbWire - 1
*/

import CollisionManager from "../Collision/ShapeCollisionManager.js";
import { collisionEffects } from "../Collision/CollisionEffects.js";
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
		this.collisionHandler = new CollisionManager();
		this.collisionPoints = new Map(); // store collision points in a Map for uniqueness and lifetime _ for drawing
		this.animationCallbacks = animationCallbacks;
		this.factories = [];



	}
	// dependency injection for loosly coupling and as a bonus allow multiple factories to be handled here
	// TODO - check this later with existing mixin-system. That could be fun!!!
	init() {

		const dependencyMap = {

			ctx: this.ctx,
			shapes: this.shapes,
			animationCallbacks: this.animationCallbacks,
			canvas: this.canvas,
			addShape: (shape) => this.addShape(shape),
			initialDraw: () => this.initialDraw(),
			stopAnimation: () => this.stopAnimation(),
			startAnimation: () => this.startAnimation()
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
				const collisionPoint = CollisionManager.resolveCollision(shape, shapeB);

				collisionPoint && collisionEffects?.handleCollisionPoint(collisionPoint, this.collisionPoints);

			}
		}
		// => draw collisionMarks for lifetime, then delete point
		collisionEffects?.handleCollisionPointsLifeCycle(this.ctx, this.collisionPoints);

		// Calculate total kinetic energy
		if (LOG) {
			const totalKE = shapes.reduce((sum, shape) => sum + shape.getKineticEnergy(), 0);
			console.log("Total Kinetic Energy:", totalKE.toFixed(2));
		}
		this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
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
