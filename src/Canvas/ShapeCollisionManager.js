/*
* MIT License
*
* Copyright(c) 2025 Barbara Kälin aka BarbWire - 1
*/


// TODO make this a multi-usage thingy instantiate in canvas or later mixin (???)

globalThis.LOG = false; // logs collision and resolution data if true

// currently using normal bbox ONLY as no rotation - later oriented bbox for pre-check, then contour OR intersection
class CollisionManager {

	// TODO this sometimes!!!!!!!!!! throws when creating new cueBall, debug!!
	// preliminary check to pass to resolution
	static isColliding(shape1, shape2) {
		if (!shape1 || !shape2) return;

		if (shape1.velocity.x === 0 && shape1.velocity.y === 0 && shape2.velocity.x === 0 && shape2.velocity.y === 0 ) return;
		const b1 = shape1.bbox;
		const b2 = shape2.bbox;

		return (
			b1.minX < b2.maxX &&
			b1.maxX > b2.minX &&
			b1.minY < b2.maxY &&
			b1.maxY > b2.minY
		);
	}


	/*
	* Approach: Treat collision as a directional impulse between two objects.
	* The collision acts at a point (or multiple points for complex shapes) from which
	* the impulse gets contributed to the participating shapes depending on their
	* relative position, velocity, and mass.
	*/
	static resolveCollision(shape1, shape2) {

		if (!this.isColliding(shape1, shape2)) return;

		//LOG && console.log("bbox collision detected");

		const { position: p1, velocity: v1, mass: m1, elasticity: el1, radius: radius1 } = shape1;
		const { position: p2, velocity: v2, mass: m2, elasticity: el2, radius: radius2 } = shape2;

		let positionDelta = {};
		let relativeVelocity = {};
		let collisionNormal = {};
		let collisionPoint;



		// get position offset and relative velocity
		[ "x", "y" ].forEach(axis => {
			positionDelta[ axis ] = p2[ axis ] - p1[ axis ];
			relativeVelocity[ axis ] = v2[ axis ] - v1[ axis ];
		});

		const distance = Math.hypot(positionDelta.x, positionDelta.y) || 1;

		// normalize direction vector
		[ "x", "y" ].forEach(axis => {
			collisionNormal[ axis ] = positionDelta[ axis ] / distance;
		});

		// circle overlap check (currently circles Only)
		if (distance > shape1.radius + shape2.radius) return;

		// collision point on shape1's perimeter, toward shape2
		collisionPoint = {
			x: p1.x + collisionNormal.x * shape1.radius,
			y: p1.y + collisionNormal.y * shape1.radius,
		};

	//collisionPoint = CollisionManager.circle2Circle(p1, shape1.radius, shape2.radius, distance, collisionNormal);


		//TODO circle2other use perimeterPoint and isPointInShape? or tangente?

		//LOG && console.log("Collision Point:", collisionPoint);

		// calculate the relative (rest) velocity along the collision vector
		const velAlongVector =
			relativeVelocity.x * collisionNormal.x +
			relativeVelocity.y * collisionNormal.y;

		// skip if already moving apart
		if (velAlongVector > 0) return;

		// combined mass and elasticity for impulse calc (currently perfect elastic)
		const inverseMass = 1 / m1 + 1 / m2;
		const elasticity = el1 + el2;
		const impulseMagnitude = elasticity * velAlongVector / inverseMass;

		// apply impulse to both shapes
		[ "x", "y" ].forEach(axis => {
			const impulse = impulseMagnitude * collisionNormal[ axis ];

			v1[ axis ] += impulse / m1 ;
			v2[ axis ] -= impulse / m2 ;
		});

		return collisionPoint || true;
	}
	static circle2Circle(p1, r1, r2, distance, collisionNormal) {
		// circle overlap check (currently circles Only)
		if (distance > r1 + r2) return;

		// collision point on shape1's perimeter, toward shape2
		return {
			x: p1.x + collisionNormal.x * r1,
			y: p1.y + collisionNormal.y * r1,
		};

	}
		/*
		if (shape1.type === 'circle' || shape2.type === 'circle') {
                    // Ensure shape1 is the circle, swap if needed
                    if (shape1.type !== 'circle') {
                         const temp = shape1;
                         shape1 = shape2;
                         shape2 = temp;
                         // Flip the normal direction by changing the sign when swapping shapes
                         normalSign = -1;
                    }
                    // Now shape1 is guaranteed to be the circle
                    collisionPoint = {
                         x: shape1.center.x + collisionNormal.x * shape1.radius * normalSign,
                         y: shape1.center.y + collisionNormal.y * shape1.radius * normalSign,
                    };


					// Circle-to-Rectangle intersection check
          function checkCircleRectangleIntersection(circle, rectangle, collisionPoint) {
               const edges = Vector.createEdgesFromPoints(rectangle.points);
               // Check for intersection between the collision point and the edges of the rectangle
               for (let edge of edges) {
                    if (Vector.isPointOnSegment(collisionPoint, edge.start, edge.end)) {
                         return true; // Collision detected on the edge
                    }
               }
               return false; // No intersection
          }
					*/




}

export default CollisionManager;