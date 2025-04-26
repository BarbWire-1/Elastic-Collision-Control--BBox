// SOUNDS: https://pixabay.com/sound-effects/search/snooker/

const Effects = {
	shape: "star",
	sounds: {
		hit: "../../assets/sounds/billard-hit-sound.mp3",
		putCueBall: "../../assets/sounds/billard-cue-on-table.mp3",
		put: "../assets/sounds/billard-put.mp3"
	},
	activeSounds: [],
	maxActiveSounds: 3, // max number of sounds (avoid chaos)
	// create a star at point as long as stored
	createEffects(collisionPoint, collisionPoints) {
		const key = collisionPoint;
		if (!collisionPoints.has(key)) {
			collisionPoints.set(key, {
				key: collisionPoint,
				shape: Effects.generateStar(collisionPoint,
					6 + Math.floor(Math.random() * 4),
					6,
					15
				),
				lifetime: 5
			});
		}
		Effects.playsound(this.sounds.hit)
	},

	handleEffectsLifeCycle(ctx, collisionPoints) {
		// Clean up collision points and draw effects
		collisionPoints.forEach((cp, key) => {
			cp.lifetime--;
			cp.lifetime <= 0
				? collisionPoints.delete(key)
				: Effects.drawStar(ctx, cp)

		});
	},


	playsound(sound) {
		// If max active sounds is reached, stop playing new sounds
		if (this.activeSounds.length >= this.maxActiveSounds) return;

		const audio = new Audio(sound);
		this.activeSounds.push(audio); // Add to active sounds

		audio.play().then(() => {
			// Optionally do something after playback starts
		}).catch((e) => {
			console.warn("Sound playback failed:", e);
		});

		// Clean up after the sound ends
		audio.addEventListener('ended', () => {
			// Remove from active sounds when done
			const index = this.activeSounds.indexOf(audio);
			if (index > -1) {
				this.activeSounds.splice(index, 1);
			}
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

export { Effects}