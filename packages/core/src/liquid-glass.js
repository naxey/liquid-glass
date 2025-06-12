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

		// Proportional ring breakdown (outermost to innermost)
		const ringPercents = [
			0.025, 0.015, 0.015, 0.015, 0.04, 0.06, 0.06, 0.12, 0.12, 0.24,
			0.24,
		];
		const total = ringPercents.reduce((a, b) => a + b, 0);
		const scale = size / 2 / total;
		const ringThicknesses = ringPercents.map((p) => p * scale * 2); // *2 for diameter
		const ringColors = [
			"#fff",
			"#f00",
			"#0f0",
			"#00f",
			"#ff0",
			"#0ff",
			"#f0f",
			"#888",
			"#444",
			"#222",
			"#111",
		];

		// Blur values: heaviest on the outside, lightest on the inside
		const maxBlur = 40;
		const minBlur = 2;
		const blurSteps = ringThicknesses.length;
		const blurValues = Array.from({ length: blurSteps }, (_, i) => {
			return maxBlur - ((maxBlur - minBlur) * i) / (blurSteps - 1);
		});

		if (debug) {
			let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
			if (shape === "circle") {
				let radius = size / 2;
				let currentRadius = radius;
				for (let i = 0; i < ringThicknesses.length; i++) {
					const thickness = ringThicknesses[i];
					if (thickness <= 0) continue;
					svg += `<circle cx="${radius}" cy="${radius}" r="${
						currentRadius - thickness / 2
					}" fill="none" stroke="${
						ringColors[i % ringColors.length]
					}" stroke-width="${thickness}" />`;
					currentRadius -= thickness;
				}
			} else if (shape === "square") {
				let offset = 0;
				for (let i = 0; i < ringThicknesses.length; i++) {
					const thickness = ringThicknesses[i];
					if (thickness <= 0) continue;
					const half = thickness / 2;
					svg += `<rect x="${offset + half}" y="${
						offset + half
					}" width="${size - 2 * (offset + half)}" height="${
						size - 2 * (offset + half)
					}" fill="none" stroke="${
						ringColors[i % ringColors.length]
					}" stroke-width="${thickness}" />`;
					offset += thickness;
				}
			} else if (shape === "custom" && path) {
				for (let i = 0; i < ringThicknesses.length; i++) {
					const thickness = ringThicknesses[i];
					if (thickness <= 0) continue;
					svg += `<path d="${path}" fill="none" stroke="${
						ringColors[i % ringColors.length]
					}" stroke-width="${thickness}" />`;
				}
			}
			svg += `</svg>`;
			this.shadowRoot.innerHTML = `
				<style>:host { display: block; width: ${size}px; height: ${size}px; }</style>
				${svg}
			`;
		} else {
			// Real glass effect: use backdrop-filter blur on stacked rings
			let rings = "";
			if (shape === "circle") {
				let radius = size / 2;
				let currentRadius = radius;
				for (let i = 0; i < ringThicknesses.length; i++) {
					const thickness = ringThicknesses[i];
					if (thickness <= 0) continue;
					const ringSize = currentRadius * 2;
					rings += `<div class="glass-ring" style="
						width: ${ringSize}px;
						height: ${ringSize}px;
						left: ${(size - ringSize) / 2}px;
						top: ${(size - ringSize) / 2}px;
						border-radius: 50%;
						backdrop-filter: blur(${blurValues[i]}px);
						-webkit-backdrop-filter: blur(${blurValues[i]}px);
						position: absolute;
						pointer-events: none;
					"></div>`;
					currentRadius -= thickness;
				}
			} else if (shape === "square") {
				let offset = 0;
				for (let i = 0; i < ringThicknesses.length; i++) {
					const thickness = ringThicknesses[i];
					if (thickness <= 0) continue;
					const ringSize = size - 2 * offset;
					rings += `<div class="glass-ring" style="
						width: ${ringSize}px;
						height: ${ringSize}px;
						left: ${offset}px;
						top: ${offset}px;
						border-radius: inherit;
						backdrop-filter: blur(${blurValues[i]}px);
						-webkit-backdrop-filter: blur(${blurValues[i]}px);
						position: absolute;
						pointer-events: none;
					"></div>`;
					offset += thickness;
				}
			} else if (shape === "custom" && path) {
				// For custom shapes, use SVG clipPath and absolutely positioned divs
				for (let i = 0; i < ringThicknesses.length; i++) {
					const thickness = ringThicknesses[i];
					if (thickness <= 0) continue;
					rings += `
					<div class="glass-ring" style="
						width: ${size}px;
						height: ${size}px;
						left: 0;
						top: 0;
						position: absolute;
						pointer-events: none;
						clip-path: path('${path}');
						backdrop-filter: blur(${blurValues[i]}px);
						-webkit-backdrop-filter: blur(${blurValues[i]}px);
					"></div>`;
				}
			}
			this.shadowRoot.innerHTML = `
				<style>
					:host { display: block; width: ${size}px; height: ${size}px; position: relative; }
					.glass-ring { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
				</style>
				<div style="width: ${size}px; height: ${size}px; position: relative;">
					${rings}
					<slot></slot>
				</div>
			`;
		}
	}
}

customElements.define("liquid-glass", LiquidGlass);
