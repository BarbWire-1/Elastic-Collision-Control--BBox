// SOUNDS: https://pixabay.com/sound-effects/search/snooker/
// TODO - make this a factory  or a Handler to be able to create differnt effects for multiple consumers
const Effects = {
	sounds: {},
	drawEffect: null,
	generateShape: null,
	activeSounds: [],
	maxActiveSounds: 3, // limit concurrent sounds

	setup({ sounds, drawEffect, generateShape }) {
		this.sounds = sounds;
		this.drawEffect = drawEffect;
		this.generateShape = generateShape;
	},

	createEffect(collisionPoint, collisionPoints) {
		const key = collisionPoint;
		if (!collisionPoints.has(key)) {
			collisionPoints.set(key, {
				key: collisionPoint,
				shape: this.generateShape(collisionPoint),
				lifetime: 5
			});
		}
		this.playsound(this.sounds.hit);
	},

	handleEffectsLifeCycle(ctx, collisionPoints) {
		collisionPoints.forEach((cp, key) => {
			cp.lifetime--;
			if (cp.lifetime <= 0) {
				collisionPoints.delete(key);
			} else {
				this.drawEffect(ctx, cp);
			}
		});
	},

	playsound(sound) {
		if (this.activeSounds.length >= this.maxActiveSounds) return;

		const audio = new Audio(sound);

		this.activeSounds.push(audio);
		// TODO add this to effects passed!!! ugly, but working for now...
		audio.volume = sound === "../../assets/sounds/billard-hit-sound.mp3" ? 0.2 : 1;
		audio.play().catch((e) => {
			console.warn("Sound playback failed:", e);
		});

		audio.addEventListener('ended', () => {
			const index = this.activeSounds.indexOf(audio);
			if (index > -1) {
				this.activeSounds.splice(index, 1);
			}
		});
	}
};

export { Effects };
