// --- Full Vector namespace with all methods ---
const Vector = {
	from(a, b) {
		return {
			x: b.x - a.x,
			y: b.y - a.y
		};
	},
	add(a, b) {
		return {
			x: a.x + b.x,
			y: a.y + b.y
		};
	},
	subtract(a, b) {
		return {
			x: a.x - b.x,
			y: a.y - b.y
		};
	},
	scale(v, s) {
		return {
			x: v.x * s,
			y: v.y * s
		};
	},
	dot(a, b) {
		return a.x * b.x + a.y * b.y;
	},
	cross(a, b) {
		return a.x * b.y - a.y * b.x;
	},
	length(v) {
		return Math.hypot(v.x, v.y);
	},
	normalize(v) {
		const L = Vector.length(v);
		return L ? Vector.scale(v, 1 / L) : {
			x: 0,
			y: 0
		};
	},
	perpendicular(v) {
		return {
			x: -v.y,
			y: v.x
		};
	},
	angle(v) {
		return Math.atan2(v.y, v.x);
	},
	angleBetween(a, b) {
		const dot = Vector.dot(a, b),
			mag = Vector.length(a) * Vector.length(b);
		return mag ? Math.acos(dot / mag) : 0;
	},
	rotate(v, theta) {
		const c = Math.cos(theta),
			s = Math.sin(theta);
		return {
			x: v.x * c - v.y * s,
			y: v.x * s + v.y * c
		};
	},
	project(a, b) {
		const s = Vector.dot(a, b) / Vector.dot(b, b);
		return Vector.scale(b, s);
	},
	reflect(v, n) {
		const d = Vector.dot(v, n);
		return Vector.subtract(v, Vector.scale(n, 2 * d));
	},
	toString(v) {
		return `(${v.x.toFixed(1)},${v.y.toFixed(1)})`;
	},
	// intersection of segment p1→p2 with q1→q2
	intersection(p1, p2, q1, q2) {
		const r = Vector.from(p1, p2),
			s = Vector.from(q1, q2),
			qp = Vector.from(p1, q1),
			rxs = Vector.cross(r, s);
		if (rxs === 0) return null; // parallel or colinear
		const t = Vector.cross(qp, s) / rxs,
			u = Vector.cross(qp, r) / rxs;
		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			return Vector.add(p1, Vector.scale(r, t));
		}
		return null;
	},
	// --- Method to create edges from points (closed shape)---
	createEdgesFromPoints(points) {
		const edges = [];
		for (let i = 0; i < points.length; i++) {
			const start = points[ i ];
			const end = points[ (i + 1) % points.length ];
			edges.push({
				start,
				end
			});
		}
		return edges;
	},
	// --- New method: Check if a point is on the segment p1→p2 ---
	isPointOnSegment(point, p1, p2) {
		const segment = Vector.from(p1, p2);
		const toPoint = Vector.from(p1, point);
		if (Math.abs(Vector.cross(segment, toPoint)) > 1e-6) return false; // Not collinear
		const dotProduct = Vector.dot(toPoint, segment);
		if (dotProduct < 0 || dotProduct > Vector.dot(segment, segment)) return false;
		return true;
	}
};

export {Vector}