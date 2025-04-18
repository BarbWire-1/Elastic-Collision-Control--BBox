// TODO make this a multi-usage thingy instantiate in canvas or later mixin (???)

globalThis.LOG = false; // Enable debug logs

class ShapeCollisionManager {
	// Basic AABB check (bounding box collision detection)
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

	static resolveCollision(shape1, shape2) {
		if (!this.isColliding(shape1, shape2)) return;

		LOG && console.log("Collision detected!");

		let delta = {};
		let relativeVelocity = {};
		let direction = {};

		// Compute delta positions and relative velocities
		[ "x", "y" ].forEach(axis => {
			delta[ axis ] = shape2.position[ axis ] - shape1.position[ axis ];
			relativeVelocity[ axis ] = shape2.velocity[ axis ] - shape1.velocity[ axis ];
		});

		const distanceBetweenShapes = Math.hypot(delta.x, delta.y) || 1;

		// Normalize direction vectors
		[ "x", "y" ].forEach(axis => {
			direction[ axis ] = delta[ axis ] / distanceBetweenShapes;
		});

		// **✅ Fixing Collision Point Calculation**
		let collisionPoint = undefined;

		if (shape1.radius && shape2.radius) {
			// ✅ Circle-Circle Collision
			if (distanceBetweenShapes > shape1.radius + shape2.radius) return;
			collisionPoint = {
				x: shape1.position.x + direction.x * shape1.radius,
				y: shape1.position.y + direction.y * shape1.radius
			};
		} else {
			// ✅ Rectangle Collision Fix
			const bbox1 = shape1.getBoundingBox();
			const bbox2 = shape2.getBoundingBox();

			const overlapX = Math.min(bbox1.maxX - bbox2.minX, bbox2.maxX - bbox1.minX);
			const overlapY = Math.min(bbox1.maxY - bbox2.minY, bbox2.maxY - bbox1.minY);

			// Resolve along the axis of least penetration (like SAT)
			if (overlapX < overlapY) {
				direction.x = delta.x > 0 ? 1 : -1;
				direction.y = 0;
				collisionPoint = {
					x: (bbox1.maxX + bbox2.minX) / 2,
					y: shape1.position.y
				};
			} else {
				direction.x = 0;
				direction.y = delta.y > 0 ? 1 : -1;
				collisionPoint = {
					x: shape1.position.x,
					y: (bbox1.maxY + bbox2.minY) / 2
				};
			}
		}

		// **✅ Keep Your Impulse Calculation Intact**
		const velocityAlongVector =
			relativeVelocity.x * direction.x +
			relativeVelocity.y * direction.y;

		// Prevent resolving if moving away
		if (velocityAlongVector > 0) return;

		// Keep mass-based impulse response
		const elasticity1 = shape1.elasticity ?? 0.5;
		const elasticity2 = shape2.elasticity ?? 0.5;

		const totalInverseMass = 1 / shape1.mass + 1 / shape2.mass;
		const totalElasticity = 1 + elasticity1 + elasticity2;
		const collisionForce = (totalElasticity * velocityAlongVector) / totalInverseMass;

		// Apply impulse
		[ "x", "y" ].forEach(axis => {
			const impulse = collisionForce * direction[ axis ];
			shape1.velocity[ axis ] += impulse / shape1.mass;
			shape2.velocity[ axis ] -= impulse / shape2.mass;
		});

		LOG && console.log("Resolved collision at:", collisionPoint);
		return collisionPoint;
	}
}

export default ShapeCollisionManager;
