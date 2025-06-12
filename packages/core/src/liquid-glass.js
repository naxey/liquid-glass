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
			// Real glass effect: use backdrop-filter blur on stacked rings
			let ringsHtml = "";
			if (shape === "circle") {
				let radius = size / 2;
				let currentRadius = radius;
				for (let i = 0; i < rings.length; i++) {
					const thickness = ringThicknesses[i];
					if (thickness <= 0) continue;
					const ringSize = currentRadius * 2;
					const blur = rings[i].blur;
					ringsHtml += `<div class="glass-ring" style="
						width: ${ringSize}px;
						height: ${ringSize}px;
						left: ${(size - ringSize) / 2}px;
						top: ${(size - ringSize) / 2}px;
						border-radius: 50%;
						backdrop-filter: blur(${blur}px);
						-webkit-backdrop-filter: blur(${blur}px);
						position: absolute;
						pointer-events: none;
					"></div>`;
					currentRadius -= thickness;
				}
			} else if (shape === "square") {
				let offset = 0;
				for (let i = 0; i < rings.length; i++) {
					const thickness = ringThicknesses[i];
					if (thickness <= 0) continue;
					const ringSize = size - 2 * offset;
					const blur = rings[i].blur;
					ringsHtml += `<div class="glass-ring" style="
						width: ${ringSize}px;
						height: ${ringSize}px;
						left: ${offset}px;
						top: ${offset}px;
						border-radius: inherit;
						backdrop-filter: blur(${blur}px);
						-webkit-backdrop-filter: blur(${blur}px);
						position: absolute;
						pointer-events: none;
					"></div>`;
					offset += thickness;
				}
			} else if (shape === "custom" && path) {
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
