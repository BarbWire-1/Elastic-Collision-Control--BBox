
// ABSTRACT SHAPECLASS
class Shape {
	constructor (position, velocity, mass, color) {
		if (new.target === Shape) {
			throw new Error(
				"Cannot instantiate the abstract class Shape directly."
			);
		}

		this.position = position;
		this.velocity = velocity;
		this.mass = mass;
		this.color = color;

		this.bbox = undefined;

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
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		this.handleBoundaryCollision();
	}

	handleBoundaryCollision() {
		const bbox = this.getBoundingBox();
		if (bbox.minX < 0 || bbox.maxX > canvas.width) {
			this.velocity.x *= -1;
			this.position.x += Math.sign(this.velocity.x) * 3
		}
		if (bbox.minY < 0 || bbox.maxY > canvas.height) {
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
		ctx.setLineDash([ 5, 5 ]);
		ctx.strokeRect(
			bbox.minX,
			bbox.minY,
			bbox.maxX - bbox.minX,
			bbox.maxY - bbox.minY
		);
		ctx.setLineDash([]);

		const vector = this.getVector();
		ctx.beginPath();
		ctx.moveTo(this.position.x, this.position.y);
		ctx.lineTo(
			this.position.x + vector.x,
			this.position.y + vector.y * 2
		);
		ctx.strokeStyle = "black";
		ctx.lineWidth = 2;
		ctx.stroke();

		ctx.fillStyle = "black";
		ctx.font = "16px Arial";
		ctx.fillText(
			`KE: ${this.getKineticEnergy().toFixed(2)}`,
			this.position.x,
			this.position.y - 40
		);
		ctx.textAlign = "center";
	}
}

// SUBCLASSES
class Circle extends Shape {
	constructor (position, radius, mass, velocity, color) {
		super(position, velocity, mass, color);
		this.radius = radius;
	}

	getBoundingBox() {

		this.bbox = {
			minX: this.position.x - this.radius,
			maxX: this.position.x + this.radius,
			minY: this.position.y - this.radius,
			maxY: this.position.y + this.radius
		};
		return this.bbox;
	}


	draw(ctx) {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(
			this.position.x,
			this.position.y,
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

		this.bbox = {
			minX: this.position.x - this.width / 2,
			maxX: this.position.x + this.width / 2,
			minY: this.position.y - this.height / 2,
			maxY: this.position.y + this.height / 2
		};
		return this.bbox;
	}


	draw(ctx) {
		ctx.fillStyle = this.color;
		ctx.fillRect(
			this.position.x - this.width / 2,
			this.position.y - this.height / 2,
			this.width,
			this.height
		);
		this.drawDebugInfo(ctx);
	}
}

export { Circle, Rectangle }