class LiquidGlass extends HTMLElement {
	constructor() {
		super();
		const shadow = this.attachShadow({ mode: "open" });
		shadow.innerHTML = `
      <style>
        :host {
          display: block;
          /* border-radius removed for sharp corners */
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
      </style>
      <slot></slot>
    `;
	}
}

customElements.define("liquid-glass", LiquidGlass);
