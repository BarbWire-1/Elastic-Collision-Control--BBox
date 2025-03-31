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
	static resolveCollision(shape1, shape2, shape1Index, shape2Index) {
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

		// vector of collision
		const velocityAlongVector =
			relativeVelocity.x * direction.x +
			relativeVelocity.y * direction.y;

		// moving away from each other - prevent jittering,
		// not "resolve" again even if bboxes might still be overlapping
		if (velocityAlongVector > 0) return;

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

		if (LOG) {
			const totalKEBefore =
				shape1.getKineticEnergy() + shape2.getKineticEnergy();
			const totalKEAfter =
				shape1.getKineticEnergy() + shape2.getKineticEnergy();
			console.log(
				`Collision between shape ${shape1Index} and shape ${shape2Index}.`
			);
			console.log(
				`Energy Before: ${totalKEBefore.toFixed(
					2
				)}, Energy After: ${totalKEAfter.toFixed(2)}`
			);
		}
	}
}

export default ShapeCollisionManager;