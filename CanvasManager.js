import ShapeCollisionManager from "./ShapeCollisionManager.js";

// CanvasManager class for managing canvas operations
class CanvasManager {
	constructor (canvas, ctx, shapes, animationCallbacks = []) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.shapes = shapes;
		this.isAnimating = false;
		this.animationFrameId = null;
		this.collisionHandler = new ShapeCollisionManager();
		// TODO separate into callback
		this.collisionPoints = new Map(); // Store collision points in a Map for uniqueness and lifetime

		this.animationCallbacks = animationCallbacks
	}

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	render() {
		// Let each shape render itself
		this.shapes.forEach((shape) => shape.draw(this.ctx));

		// Draw precomputed stars from the Map
		this.collisionPoints.forEach(cp => {
			this.ctx.beginPath();

			// Draw using precomputed points
			cp.shape.forEach((point, index) => {
				if (index === 0) {
					this.ctx.moveTo(point.x, point.y);
				} else {
					this.ctx.lineTo(point.x, point.y);
				}
			});

			this.ctx.closePath();

			// Draw yellow outline first
			this.ctx.strokeStyle = "yellow";
			this.ctx.lineWidth = 3;
			this.ctx.stroke();

			// Fill red inside
			this.ctx.fillStyle = "red";
			this.ctx.fill();
		});
	}

	animate() {
		if (!this.isAnimating) return;
		this.clear();
		this.animationCallbacks.forEach(fn => fn())
		const shapes = this.shapes;



		// Collision detection between all shape pairs
		for (let i = 0; i < shapes.length; i++) {

			const shape = shapes[ i ];
			shape.update();
			for (let j = i + 1; j < shapes.length; j++) {
				const shapeA = shapes[ i ];
				const shapeB = shapes[ j ];

				const collisionPoint = ShapeCollisionManager.resolveCollision(shapeA, shapeB);

				if (collisionPoint) {
					LOG && console.log(`Collision between shape ${i} and shape ${j} resolved.`);

					// Add visual marker if new collision point
					const key = collisionPoint;
					if (!this.collisionPoints.has(key)) {
						this.collisionPoints.set(key, {
							key: collisionPoint,
							shape: this.generateStar(
								collisionPoint,
								6 + Math.floor(Math.random() * 4),
								6,
								15
							),
							lifetime: 5
						});
					}
				}
			}


		}

		// Fade out collision stars over time
		this.collisionPoints.forEach((cp, key) => {
			cp.lifetime--;
			if (cp.lifetime <= 0) this.collisionPoints.delete(key);
		});

		this.render();
		this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
	}

	// TODO separate and pass as callback
	// generate star shape
	generateStar(center, spikes, innerRadius, outerRadius) {
		let points = [];
		for (let i = 0; i < spikes * 2; i++) {
			let angle = (Math.PI * i) / spikes; // Alternate between inner & outer
			let radius = i % 2 === 0 ? outerRadius : innerRadius;
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
