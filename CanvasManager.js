import ShapeCollisionManager from "./ShapeCollisionManager.js";

// CanvasManager class for managing canvas operations
class CanvasManager {
	constructor (canvas, ctx, shapes) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.shapes = shapes;
		this.isAnimating = false;
		this.animationFrameId = null;
		this.collisionHandler = new ShapeCollisionManager();
		this.collisionPoints = []; // Store collision points with lifetimes and shapes
	}

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	render() {
		// Let each shape render itself
		this.shapes.forEach((shape) => shape.draw(this.ctx));

		// Draw precomputed stars
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

		// Update and check for collisions
		for (let i = 0; i < this.shapes.length; i++) {
			const shapes = this.shapes;
			shapes[ i ].update();
			for (let j = i + 1; j < shapes.length; j++) {
				const collisionPoint = ShapeCollisionManager.resolveCollision(shapes[ i ], shapes[ j ]);
				if (collisionPoint) {
					LOG && console.log(`Collision between shape ${i} and shape ${j} resolved.`);
					[ shapes[ i ], shapes[ j ] ].map(s => s.handleBoundaryCollision());

					// Add new collision point with precomputed star and lifetime
					this.collisionPoints.push({
						point: collisionPoint,
						shape: this.generateStar(collisionPoint, 6 + Math.floor(Math.random() * 4), 10, 20),
						lifetime: 15
					});
				}
			}
		}

		// Reduce lifetime of existing collision points
		this.collisionPoints.forEach(cp => cp.lifetime--);

		// Remove expired collision points
		this.collisionPoints = this.collisionPoints.filter(cp => cp.lifetime > 0);

		this.render();
		this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
	}

	// Generate a proper star shape
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
