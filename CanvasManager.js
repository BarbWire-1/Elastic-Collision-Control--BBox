import ShapeCollisionManager from "./ShapeCollisionManager.js";

// CanvasManager class for managing canvas operations
class CanvasManager {
	constructor (canvas, ctx, shapes) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.shapes = shapes;
		this.isAnimating = false;
		this.animationFrameId = null;
	}

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	render() {
		// Let each shape render itself
		this.shapes.forEach((shape) => shape.draw(this.ctx));
	}

	animate() {
		if (!this.isAnimating) return;

		this.clear();

		// Update and check for collisions
		for (let i = 0; i < this.shapes.length; i++) {
			const shapes = this.shapes;
			shapes[ i ].update();
			for (let j = i + 1; j < shapes.length; j++) {
				ShapeCollisionManager.resolveCollision(
					shapes[ i ],
					shapes[ j ],
					i,
					j
				);
			}
		}

		this.render();
		this.animationFrameId = requestAnimationFrame(
			this.animate.bind(this)
		);
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