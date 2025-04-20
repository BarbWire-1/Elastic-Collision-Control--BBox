/*
* MIT License
*
* Copyright(c) 2025 Barbara Kälin aka BarbWire - 1
*/
// ABSTRACT SHAPECLASS
class Shape {
	constructor (config) {
		const { position, velocity, mass, color, margin = 0 , elasticity = 1} = config;
		if (new.target === Shape) {
			throw new Error(
				"Cannot instantiate the abstract class Shape directly."
			);
		}

		this.position = position;
		this.velocity = velocity;

		this.color = color;

		this.margin = margin;
		this.bbox = undefined;

		// TODO will be determined by material
		this.elasticity = elasticity;
		this.mass = mass;

	}

	getKineticEnergy() {
		return (
			0.5 * this.mass * (this.velocity.x ** 2 + this.velocity.y ** 2)
		);
	}

	getVector() {
		return { x: this.velocity.x * 10, y: this.velocity.y * 10 };
	}

	update() {
		const multiplier = isNaN(SPEED_MULTIPLIER) ? 1 : SPEED_MULTIPLIER;
		this.position.x += this.velocity.x * multiplier;
		this.position.y += this.velocity.y * multiplier;
		this.handleBoundaryCollision();
	}

	handleBoundaryCollision() {
		const bbox = this.getBoundingBox();
		if (bbox.minX < 0 + this.margin || bbox.maxX > canvas.width - this.margin) {
			this.velocity.x *= -1;
			this.position.x += Math.sign(this.velocity.x) * 3
		}
		if (bbox.minY < 0 + this.margin || bbox.maxY > canvas.height - this.margin) {
			this.velocity.y *= -1;
			this.position.y += Math.sign(this.velocity.y) * 3
		}
	}

	// must be in subclass to handle diff rules for draw and bbox
	getBoundingBox() {
		throw new Error("getBoundingBox() must be implemented by subclasses");
	}

	draw() {
		throw new Error("draw() must be implemented by subclasses");
	}

	drawDebugInfo(ctx) {
		if (!DRAW_INFO) return;
		const bbox = this.getBoundingBox();

		ctx.strokeStyle = "rgba(144, 238, 144, 0.6)";
		ctx.lineWidth = 2;
		ctx.setLineDash([ 5, 5 ]);
		ctx.strokeRect(
			bbox.minX,
			bbox.minY,
			bbox.maxX - bbox.minX,
			bbox.maxY - bbox.minY
		);
		ctx.setLineDash([]);
		const { x, y } = this.position;
		const {x: vx,y: vy} = this.getVector();
		ctx.strokeStyle = "black";
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(
			x + vx,
			y + vy * 2
		);
		ctx.stroke();

		ctx.fillStyle = "black";
		ctx.font = "16px Arial";
		ctx.textAlign = "center";

		ctx.fillText(
			`KE: ${this.getKineticEnergy().toFixed(2)}`,
			this.position.x,
			this.position.y - 40
		);

	}
}

// SUBCLASSES
class Circle extends Shape {
	constructor (config) {
		super(config);
		this.radius = config.radius
	}

	getBoundingBox() {
		const { x, y } = this.position;
		const r = this.radius;

		this.bbox = {
			minX: x - r,
			maxX: x + r,
			minY: y - r,
			maxY: y + r
		};
		return this.bbox;
	}


	draw(ctx) {
		const { x, y } = this.position;
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(
			x,
			y,
			this.radius,
			0,
			Math.PI * 2
		);
		ctx.fill();
		this.drawDebugInfo(ctx);
	}
}

class Rectangle extends Shape {
	constructor (position, width, height, mass, velocity, color) {
		super(position, velocity, mass, color);
		this.width = width;
		this.height = height;
	}

	getBoundingBox() {
		const { x, y } = this.position;
		const wh = this.width/2, hh = this.height /2
		this.bbox = {
			minX: x - wh,
			maxX: x + wh,
			minY: y - hh,
			maxY: y + hh
		};
		return this.bbox;
	}


	draw(ctx) {
		const w = this.width, h = this.height;
		const { x, y } = this.position;
		ctx.fillStyle = this.color;
		ctx.fillRect(
			x - w / 2,
			y - h / 2,
			w,
			h
		);
		this.drawDebugInfo(ctx);
	}
}

export { Circle, Rectangle }