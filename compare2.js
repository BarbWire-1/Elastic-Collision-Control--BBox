// TODO make this a multi-usage thingy instantiate in canvas or later mixin (???)

globalThis.LOG = false; // logs collision and resolution data if true
// currently using bbox ONLY - later oriented bbox for pre-check, then contour
class ShapeCollisionManager {
	static calculateMinimumTranslationVector(shape1, shape2) {
		// Get the bounding boxes of both shapes
		const shape1BoundingBox = shape1.getBoundingBox();
		const shape2BoundingBox = shape2.getBoundingBox();

		// Calculate the horizontal and vertical overlap between the two bounding boxes
		const horizontalOverlap = Math.min(
			shape1BoundingBox.maxX - shape2BoundingBox.minX,
			shape2BoundingBox.maxX - shape1BoundingBox.minX
		);

		const verticalOverlap = Math.min(
			shape1BoundingBox.maxY - shape2BoundingBox.minY,
			shape2BoundingBox.maxY - shape1BoundingBox.minY
		);

		// Determine the direction of movement for each axis
		const moveDirectionX = Math.sign(shape2.position.x - shape1.position.x);
		const moveDirectionY = Math.sign(shape2.position.y - shape1.position.y);

		// Calculate the MTV for each direction
		let translationX = 0;
		let translationY = 0;

		// If there's horizontal overlap, resolve along the x-axis
		if (horizontalOverlap > 0) {
			translationX = horizontalOverlap * moveDirectionX;
		}

		// If there's vertical overlap, resolve along the y-axis
		if (verticalOverlap > 0) {
			translationY = verticalOverlap * moveDirectionY;
		}

		// Return the translation vector (MTV)
		return { x: translationX, y: translationY };
	}


	static resolveCollision(shape1, shape2) {
		if (this.isColliding(shape1, shape2)) {
			LOG && console.log("bbox collision detected");
		} else {
			return;
		}

		let delta = {};
		let relativeVelocity = {};
		let direction = {};

		//  calculate delta and relative velocity for both shapes' axes
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

		// vector of collision
		const velocityAlongVector =
			relativeVelocity.x * direction.x +
			relativeVelocity.y * direction.y;

		// moving away from each other - prevent jittering,
		// not "resolve" again even if bboxes might still be overlapping
		if (velocityAlongVector > 0) return;

		let collisionPoint = this.calculateCollisionPoint(shape1, shape2, direction);

		LOG && console.log("Collision Point:", collisionPoint);

		// Elasticity and impulse calculation
		const elasticity1 = shape1.elasticity ?? 0.5;
		const elasticity2 = shape2.elasticity ?? 0.5;

		const totalInverseMass = 1 / shape1.mass + 1 / shape2.mass;
		const totalElasticity = 1 + elasticity1 + elasticity2;
		const collisionForce =
			(totalElasticity * velocityAlongVector) / totalInverseMass;

		// Apply linear impulse to both shapes, adjusting their velocities based on their mass
		[ "x", "y" ].forEach((axis) => {
			const impulse = collisionForce * direction[ axis ];
			shape1.velocity[ axis ] += impulse / shape1.mass;
			shape2.velocity[ axis ] -= impulse / shape2.mass;
		});

		return collisionPoint ? collisionPoint : true;
	}

	static calculateCollisionPoint(shape1, shape2, direction) {
		const bbox1 = shape1.getBoundingBox();
		const bbox2 = shape2.getBoundingBox();

		// Use the bounding box of the smaller rectangle for precision
		const bbox = shape1.mass < shape2.mass ? bbox1 : bbox2;

		// Calculate the angle of the collision direction
		let angle = Math.atan2(direction.y, direction.x);

		// Check if direction is zero to avoid NaN
		if (isNaN(angle)) {
			// If direction is zero, set angle to 0
			angle = 0;
		}

		let tMinX = (bbox.minX - shape1.position.x) / Math.cos(angle);
		let tMaxX = (bbox.maxX - shape1.position.x) / Math.cos(angle);
		let tMinY = (bbox.minY - shape1.position.y) / Math.sin(angle);
		let tMaxY = (bbox.maxY - shape1.position.y) / Math.sin(angle);

		// Check for division by zero
		if (Math.cos(angle) === 0) {
			tMinX = tMaxX = Infinity;
		}
		if (Math.sin(angle) === 0) {
			tMinY = tMaxY = Infinity;
		}

		// Find the smallest positive t value (closest intersection)
		let tValues = [ tMinX, tMaxX, tMinY, tMaxY ].filter((t) => t > 0);

		// Check if tValues is empty
		if (tValues.length === 0) {
			// If no positive t values, return a default collision point
			return {
				x: shape1.position.x,
				y: shape1.position.y
			};
		}

		const t = Math.min(...tValues);

		// Calculate the collision point
		return {
			x: shape1.position.x + t * Math.cos(angle),
			y: shape1.position.y + t * Math.sin(angle)
		};
	}
}

export default ShapeCollisionManager;
