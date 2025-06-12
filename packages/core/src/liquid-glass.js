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

		// Unified ring config: percent, blur, color
		// outside to inside
		const rings = [
			{ percent: 0.025, blur: 40, color: "#fff" },
			{ percent: 0.015, blur: 32, color: "#f00" },
			{ percent: 0.015, blur: 28, color: "#0f0" },
			{ percent: 0.015, blur: 24, color: "#00f" },
			{ percent: 0.04, blur: 20, color: "#ff0" },
			{ percent: 0.06, blur: 16, color: "#0ff" },
			{ percent: 0.06, blur: 12, color: "#f0f" },
			{ percent: 0.12, blur: 8, color: "#888" },
			{ percent: 0.12, blur: 6, color: "#444" },
			{ percent: 0.24, blur: 4, color: "#222" },
			{ percent: 0.24, blur: 2, color: "#111" },
		];
		const total = rings.reduce((a, b) => a + b.percent, 0);
		const scale = size / 2 / total;
		const ringThicknesses = rings.map((r) => r.percent * scale * 2); // *2 for diameter

		if (debug) {
			let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
			if (shape === "circle") {
				let radius = size / 2;
				let currentRadius = radius;
				for (let i = 0; i < rings.length; i++) {
					const thickness = ringThicknesses[i];
					if (thickness <= 0) continue;
					svg += `<circle cx="${radius}" cy="${radius}" r="${
						currentRadius - thickness / 2
					}" fill="none" stroke="${
						rings[i].color
					}" stroke-width="${thickness}" />`;
					currentRadius -= thickness;
				}
			} else if (shape === "square") {
				let offset = 0;
				for (let i = 0; i < rings.length; i++) {
					const thickness = ringThicknesses[i];
					if (thickness <= 0) continue;
					const half = thickness / 2;
					svg += `<rect x="${offset + half}" y="${
						offset + half
					}" width="${size - 2 * (offset + half)}" height="${
						size - 2 * (offset + half)
					}" fill="none" stroke="${
						rings[i].color
					}" stroke-width="${thickness}" />`;
					offset += thickness;
				}
			} else if (shape === "custom" && path) {
				for (let i = 0; i < rings.length; i++) {
					const thickness = ringThicknesses[i];
					if (thickness <= 0) continue;
					svg += `<path d="${path}" fill="none" stroke="${rings[i].color}" stroke-width="${thickness}" />`;
				}
			}
			svg += `</svg>`;
			this.shadowRoot.innerHTML = `
				<style>:host { display: block; width: ${size}px; height: ${size}px; }</style>
				${svg}
			`;
		} else {
			// SVG-based true donut blur rings
			let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
			// For each ring, create a mask for the annular region
			for (let i = 0; i < rings.length; i++) {
				const thickness = ringThicknesses[i];
				if (thickness <= 0) continue;
				const blur = rings[i].blur;
				// Calculate outer and inner radii/rects/paths
				if (shape === "circle") {
					let radius = size / 2;
					let outerRadius =
						radius -
						ringThicknesses.slice(0, i).reduce((a, b) => a + b, 0);
					let innerRadius = outerRadius - thickness;
					if (i === rings.length - 1) innerRadius = 0; // innermost is solid
					svg += `
					<defs>
						<mask id="ring-mask-${i}">
							<rect width="${size}" height="${size}" fill="white"/>
							<circle cx="${radius}" cy="${radius}" r="${outerRadius}" fill="black"/>
							${
								innerRadius > 0
									? `<circle cx="${radius}" cy="${radius}" r="${innerRadius}" fill="white"/>`
									: ""
							}
						</mask>
						<filter id="blur-filter-${i}" x="-50%" y="-50%" width="200%" height="200%">
							<feGaussianBlur stdDeviation="${blur}" />
						</filter>
					</defs>
					<circle cx="${radius}" cy="${radius}" r="${outerRadius}" fill="rgba(255,255,255,0.01)" filter="url(#blur-filter-${i})" mask="url(#ring-mask-${i})" />
					`;
				}
				// TODO: Add square and custom path support for true donut masking
			}
			svg += `</svg>`;
			this.shadowRoot.innerHTML = `
				<style>:host { display: block; width: ${size}px; height: ${size}px; position: relative; }</style>
				${svg}
				<slot></slot>
			`;
		}
	}
}

customElements.define("liquid-glass", LiquidGlass);
