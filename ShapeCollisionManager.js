// TODO make this a multi-usage thingy instantiate in canvas or later mixin (???)

globalThis.LOG = false; // logs collision and resolution data if true
// currently using bbox ONLY - later oriented bbox for pre-check, then contour
class ShapeCollisionManager {
	//preliminary check to pass to resolution
	static isColliding(shape1, shape2) {
		const bbox1 = shape1.getBoundingBox();
		const bbox2 = shape2.getBoundingBox();
		return (
			bbox1.minX < bbox2.maxX &&
			bbox1.maxX > bbox2.minX &&
			bbox1.minY < bbox2.maxY &&
			bbox1.maxY > bbox2.minY
		);
	}
	// made it a bit more verbose for readability
	static resolveCollision(shape1, shape2) {
		if (this.isColliding(shape1, shape2)) {
			LOG && console.log("bbox collision detected");
		} else {
			return;
		}
		let delta = {};
		let relativeVelocity = {};
		let direction = {};

		//  calculate delta and relative velocity for both ahapes' axes
		[ "x", "y" ].forEach((axis) => {
			delta[ axis ] = shape2.position[ axis ] - shape1.position[ axis ];
			relativeVelocity[ axis ] =
				shape2.velocity[ axis ] - shape1.velocity[ axis ];
		});

		const distanceBetweenShapes = Math.hypot(delta.x, delta.y) || 1;

		// normalize direction vectors
		[ "x", "y" ].forEach((axis) => {
			direction[ axis ] = delta[ axis ] / distanceBetweenShapes;
		});
// TESTING CIRCLES ONLY
		if (shape1.type === "circle" && shape2.type === "circle") {
			if (distanceBetweenShapes > shape1.radius + shape2.radius) return;
		}

		// If one shape is a circle and the other is a rectangle
		if ((shape1.type === "circle" && shape2.type === "rect") ||
			(shape1.type === "rect" && shape2.type === "circle")) {

			let circle = shape1.type === "circle" ? shape1 : shape2;
			let rect = shape1.type === "rect" ? shape1 : shape2;

			const bbox = rect.getBoundingBox(); // Use the rectangle's bounding box

			if (distanceBetweenShapes > circle.radius + Math.max(bbox.width, bbox.height) / 2) return;
		}

		// vector of collision
		const velocityAlongVector =
			relativeVelocity.x * direction.x +
			relativeVelocity.y * direction.y;

		// moving away from each other - prevent jittering,
		// not "resolve" again even if bboxes might still be overlapping
		if (velocityAlongVector > 0) return;
		let collisionPoint = undefined;
		collisionPoint = {
			x: shape1.position.x + direction.x * (shape1.radius ?? shape1.width/2),
			y: shape1.position.y + direction.y * (shape1.radius ?? shape1.height / 2),
		};

// TODO get relative to (mass-) center and direction to init spin
		LOG && console.log("Collision Point:", collisionPoint);


		// TODO - elasticity not implemented yet. normalize for distribution accordingly to shape factor
		// using default of 0.5 for each if not provided
		// "perfect elastic collision"
		const elasticity1 = shape1.elasticity ?? 0.5;
		const elasticity2 = shape2.elasticity ?? 0.5;

		const totalInverseMass = 1 / shape1.mass + 1 / shape2.mass;
		const totalElasticity = 1 + elasticity1 + elasticity2;
		const collisionForce =
			(totalElasticity * velocityAlongVector) / totalInverseMass;

		// apply impulse to both shapes, adjusting their velocities based on their mass
		[ "x", "y" ].forEach((axis) => {
			const impulse = collisionForce * direction[ axis ];

			shape1.velocity[ axis ] += impulse / shape1.mass;
			shape2.velocity[ axis ] -= impulse / shape2.mass;
		});

		return collisionPoint;
	}
}

export default ShapeCollisionManager;