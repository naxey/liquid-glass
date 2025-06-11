import "./liquid-glass.js";

class DraggableSquircle extends HTMLElement {
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
        .squircle {
          width: 200px;
          height: 200px;
          clip-path: path('M 100 0 C 180 0 200 20 200 100 C 200 180 180 200 100 200 C 20 200 0 180 0 100 C 0 20 20 0 100 0 Z');
          -webkit-clip-path: path('M 100 0 C 180 0 200 20 200 100 C 200 180 180 200 100 200 C 20 200 0 180 0 100 C 0 20 20 0 100 0 Z');
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        liquid-glass {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>
      <div class="squircle">
        <liquid-glass>
          <slot></slot>
        </liquid-glass>
      </div>
    `;
		this._dragging = false;
		this._offset = { x: 0, y: 0 };
	}

	connectedCallback() {
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

customElements.define("draggable-squircle", DraggableSquircle);
