const collisionEffects = {
	shape: "star",
	sound: undefined,
	// create a star at point as long as stored
	handleCollisionPoint(collisionPoint, collisionPoints) {
		const key = collisionPoint;
		if (!collisionPoints.has(key)) {
			collisionPoints.set(key, {
				key: collisionPoint,
				shape: collisionEffects.generateStar(collisionPoint,
					6 + Math.floor(Math.random() * 4),
					6,
					15
				),
				lifetime: 5
			});
		}
	},

	handleCollisionPointsLifeCycle(ctx, collisionPoints) {
		// Clean up collision points and draw effects
		collisionPoints.forEach((cp, key) => {
			cp.lifetime--;
			cp.lifetime <= 0
				? collisionPoints.delete(key)
				: collisionEffects.drawStar(ctx, cp)

		});
	},

	drawStar(ctx,cp) {
		ctx.beginPath();
		cp.shape.forEach((point, index) => {
			index === 0
				? ctx.moveTo(point.x, point.y)
				: ctx.lineTo(point.x, point.y);
		});

		ctx.closePath();
		ctx.strokeStyle = "yellow";
		ctx.lineWidth = 3;
		ctx.stroke();
		ctx.fillStyle = "red";
		ctx.fill();
	},

	// DrawRules - make adjustable
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
}

export { collisionEffects }