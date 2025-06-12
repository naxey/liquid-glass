// LiquidGlass API:
// <liquid-glass shape="circle|square|custom" size="number" debug path="M...Z"></liquid-glass>
// - shape: 'circle', 'square', or 'custom'.
// - size: width/height in px.
// - debug: show ring breakdown.
// - path: SVG path string (only used if shape='custom').

class LiquidGlass extends HTMLElement {
	static get observedAttributes() {
		return ["debug", "size", "shape", "path"];
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		this.render();
	}

	attributeChangedCallback() {
		this.render();
	}

	render() {
		const debug = this.hasAttribute("debug");
		const size = parseInt(this.getAttribute("size")) || 200;
		const shape = this.getAttribute("shape") || "circle";
		const path = this.getAttribute("path") || null;

		// Unified ring config: percent, blur, debug_color
		// outside to inside
		// last one / most inner ring, is not a ring but a shape without a hole in the middle
		const rings = [
			{ percent: 0.02, blur: 150, debug_color: "#fff" },
			{ percent: 0.02, blur: 150, debug_color: "#f00" },
			{ percent: 0.04, blur: 100, debug_color: "#0f0" },
			{ percent: 0.05, blur: 80, debug_color: "#00f" },
			{ percent: 0.05, blur: 55, debug_color: "#ff0" },
			{ percent: 0.07, blur: 25, debug_color: "#0ff" },
			{ percent: 0.15, blur: 5, debug_color: "#f0f" },
			{ percent: 0.6, blur: 1, debug_color: "#888" },
		];
		const total = rings.reduce((a, b) => a + b.percent, 0);
		const scale = size / 2 / total;
		const radius = size / 2;
		const ringThicknesses = rings.map((r) => r.percent * radius);

		if (debug) {
			let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
			if (shape === "circle") {
				let currentRadius = radius;
				for (let i = 0; i < rings.length; i++) {
					const thickness = ringThicknesses[i];
					if (thickness <= 0) continue;
					svg += `<circle cx="${radius}" cy="${radius}" r="${
						currentRadius - thickness / 2
					}" fill="none" stroke="${
						rings[i].debug_color
					}" stroke-width="${thickness}" />`;
					currentRadius -= thickness;
				}
			} else if (shape === "square") {
				let offset = 0;
				for (let i = 0; i < rings.length; i++) {
					const thickness = ringThicknesses[i];
					if (thickness <= 0) continue;
					const half = thickness / 2;
					if (i < rings.length - 1) {
						// Draw ring (stroke only)
						svg += `<rect x="${offset + half}" y="${
							offset + half
						}" width="${size - 2 * (offset + half)}" height="${
							size - 2 * (offset + half)
						}" fill="none" stroke="${
							rings[i].debug_color
						}" stroke-width="${thickness}" />`;
						offset += thickness;
					} else {
						// Last (innermost): fill the remaining area
						const innerSize = size - 2 * offset;
						if (innerSize > 0) {
							svg += `<rect x="${offset}" y="${offset}" width="${innerSize}" height="${innerSize}" fill="${rings[i].debug_color}" stroke="none" />`;
						}
					}
				}
			} else if (shape === "custom" && path) {
				for (let i = 0; i < rings.length; i++) {
					const thickness = ringThicknesses[i];
					if (thickness <= 0) continue;
					svg += `<path d="${path}" fill="none" stroke="${rings[i].debug_color}" stroke-width="${thickness}" />`;
				}
			}
			svg += `</svg>`;
			this.shadowRoot.innerHTML = `
				<style>:host { display: block; width: ${size}px; height: ${size}px; }</style>
				${svg}
			`;
		} else {
			// True background blur rings using CSS masks and backdrop-filter
			let ringsHtml = "";
			if (shape === "circle") {
				let radii = [radius];
				for (let i = 0; i < rings.length; i++) {
					const thickness = ringThicknesses[i];
					const nextRadius = radii[i] - thickness;
					radii.push(nextRadius);
				}
				for (let i = 0; i < rings.length; i++) {
					const outerR = radii[i];
					const innerR = radii[i + 1];
					const blur = rings[i].blur;
					const isInner = i === rings.length - 1;
					let mask;
					if (!isInner) {
						mask = `radial-gradient(circle at 50% 50%, transparent ${innerR}px, white ${
							innerR + 0.1
						}px, white ${outerR}px, transparent ${outerR + 0.1}px)`;
					} else {
						mask = `radial-gradient(circle at 50% 50%, white ${outerR}px, transparent ${
							outerR + 0.1
						}px)`;
					}
					ringsHtml += `<div class="glass-ring" style="
						width: ${size}px;
						height: ${size}px;
						left: 0;
						top: 0;
						position: absolute;
						pointer-events: none;
						-webkit-mask-image: ${mask};
						mask-image: ${mask};
						backdrop-filter: blur(${blur}px);
						-webkit-backdrop-filter: blur(${blur}px);
					"></div>`;
				}
			} else if (shape === "square") {
				let offsets = [0];
				for (let i = 0; i < rings.length; i++) {
					const thickness = ringThicknesses[i];
					offsets.push(offsets[i] + thickness);
				}
				for (let i = 0; i < rings.length; i++) {
					const outerOffset = offsets[i];
					const innerOffset = offsets[i + 1];
					const blur = rings[i].blur;
					const isInner = i === rings.length - 1;
					let mask;
					if (!isInner) {
						mask = `linear-gradient(white, white) padding-box, linear-gradient(white, white) border-box`;
						mask = `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${
							(100 * innerOffset) / size
						}% ${(100 * innerOffset) / size}%, ${
							100 - (100 * innerOffset) / size
						}% ${(100 * innerOffset) / size}%, ${
							100 - (100 * innerOffset) / size
						}% ${100 - (100 * innerOffset) / size}%, ${
							(100 * innerOffset) / size
						}% ${100 - (100 * innerOffset) / size}%, ${
							(100 * innerOffset) / size
						}% ${(100 * innerOffset) / size}%)`;
						mask = `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${innerOffset}px ${innerOffset}px, ${
							size - innerOffset
						}px ${innerOffset}px, ${size - innerOffset}px ${
							size - innerOffset
						}px, ${innerOffset}px ${
							size - innerOffset
						}px, ${innerOffset}px ${innerOffset}px)`;
						(mask = `inset(${innerOffset}px round 0)`),
							`inset(${outerOffset}px round 0)`;
						mask = `linear-gradient(white, white) content-box, linear-gradient(white, white) border-box`;
						// fallback: just use a box mask for now
						mask = `inset(${innerOffset}px ${innerOffset}px ${innerOffset}px ${innerOffset}px)`;
					} else {
						mask = `inset(${outerOffset}px round 0)`;
					}
					ringsHtml += `<div class="glass-ring" style="
						width: ${size}px;
						height: ${size}px;
						left: 0;
						top: 0;
						position: absolute;
						pointer-events: none;
						-webkit-mask-image: ${mask};
						mask-image: ${mask};
						backdrop-filter: blur(${blur}px);
						-webkit-backdrop-filter: blur(${blur}px);
					"></div>`;
				}
			}
			// For custom, fallback to previous implementation
			else if (shape === "custom" && path) {
				for (let i = 0; i < rings.length; i++) {
					const thickness = ringThicknesses[i];
					if (thickness <= 0) continue;
					const blur = rings[i].blur;
					ringsHtml += `
					<div class="glass-ring" style="
						width: ${size}px;
						height: ${size}px;
						left: 0;
						top: 0;
						position: absolute;
						pointer-events: none;
						clip-path: path('${path}');
						backdrop-filter: blur(${blur}px);
						-webkit-backdrop-filter: blur(${blur}px);
					"></div>`;
				}
			}
			this.shadowRoot.innerHTML = `
				<style>
					:host { display: block; width: ${size}px; height: ${size}px; position: relative; }
					.glass-ring { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
				</style>
				<div style="width: ${size}px; height: ${size}px; position: relative;">
					${ringsHtml}
					<slot></slot>
				</div>
			`;
		}
	}
}

customElements.define("liquid-glass", LiquidGlass);
