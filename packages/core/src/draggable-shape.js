import "./liquid-glass.js";

class DraggableShape extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          left: 100px;
          top: 100px;
          z-index: 1000;
          cursor: grab;
          user-select: none;
        }
        .shape {
          width: 100px;
          height: 100px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .circle {
          border-radius: 50%;
        }
        .square {
        }
        liquid-glass {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>
      <div class="shape">
        <!-- liquid-glass will be rendered here by renderLiquidGlass() -->
        <div id="glass-container"></div>
      </div>
    `;
		this._dragging = false;
		this._offset = { x: 0, y: 0 };
	}

	connectedCallback() {
		this._updateShape();
		this.renderLiquidGlass();
		this.shadowRoot.host.addEventListener("mousedown", this._onMouseDown);
		window.addEventListener("mousemove", this._onMouseMove);
		window.addEventListener("mouseup", this._onMouseUp);
	}

	disconnectedCallback() {
		this.shadowRoot.host.removeEventListener(
			"mousedown",
			this._onMouseDown
		);
		window.removeEventListener("mousemove", this._onMouseMove);
		window.removeEventListener("mouseup", this._onMouseUp);
	}

	static get observedAttributes() {
		return ["shape", "debug", "size", "path"];
	}

	attributeChangedCallback() {
		this._updateShape();
		this.renderLiquidGlass();
	}

	_updateShape() {
		const shape = this.getAttribute("shape") || "circle";
		const div = this.shadowRoot.querySelector(".shape");
		if (div) {
			div.classList.remove("circle", "square");
			div.classList.add(shape === "square" ? "square" : "circle");
		}
	}

	renderLiquidGlass() {
		const debug = this.hasAttribute("debug") ? "debug" : "";
		const size = this.getAttribute("size") || 100;
		const shape = this.getAttribute("shape") || "circle";
		const path = this.getAttribute("path") || "";
		const glassContainer =
			this.shadowRoot.querySelector("#glass-container");
		let pathAttr = shape === "custom" && path ? `path=\"${path}\"` : "";
		if (glassContainer) {
			glassContainer.innerHTML = `<liquid-glass ${debug} size=\"${size}\" shape=\"${shape}\" ${pathAttr}><slot></slot></liquid-glass>`;
		}
	}

	_onMouseDown = (e) => {
		this._dragging = true;
		this._offset = {
			x: e.clientX - this.offsetLeft,
			y: e.clientY - this.offsetTop,
		};
		this.style.cursor = "grabbing";
	};

	_onMouseMove = (e) => {
		if (!this._dragging) return;
		this.style.left = `${e.clientX - this._offset.x}px`;
		this.style.top = `${e.clientY - this._offset.y}px`;
	};

	_onMouseUp = () => {
		this._dragging = false;
		this.style.cursor = "grab";
	};
}

customElements.define("draggable-shape", DraggableShape);
