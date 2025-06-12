import "./style.css";
import javascriptLogo from "./javascript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.js";
import "./liquid-glass.js";
import "./draggable-shape.js";

document
	.querySelector("#app")
	.setAttribute(
		"style",
		"background:url('https://www.iphoned.nl/wp-content/uploads/2025/06/macos-26-wwdc.png') center top no-repeat; background-size: 100vw auto; width:100vw; height:100vh; margin:0; padding:0; position:relative;"
	);

document.querySelector("#app").innerHTML = `
  <div style="display: flex; gap: 2rem; justify-content: center; margin-bottom: 2rem;">
    <draggable-shape shape="circle" size="100">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
        <span style="font-size: 1.1em; font-weight: bold;">⚪ Circle</span>
        <span style="font-size: 0.9em;">Drag me!</span>
      </div>
    </draggable-shape>
    <draggable-shape shape="square" size="100">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
        <span style="font-size: 1.1em; font-weight: bold;">⬛ Square</span>
        <span style="font-size: 0.9em;">Drag me!</span>
      </div>
    </draggable-shape>
  </div>
  <div>
    <liquid-glass debug size="500" shape="square" style="max-width: 600px; margin: 0 auto; padding: 2rem; border-radius: 32px; overflow: hidden;">
      <a href="https://vite.dev" target="_blank">
        <img src="${viteLogo}" class="logo" alt="Vite logo" />
      </a>
      <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
        <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
      </a>
      <h1>Hello Liquid Glass!</h1>
      <div class="card">
        <button id="counter" type="button"></button>
      </div>
      <p class="read-the-docs">
        This is a demo of the <code>&lt;liquid-glass&gt;</code> component.<br/>
        The background should be visible without blur.
      </p>
    </liquid-glass>
  </div>
`;

setupCounter(document.querySelector("#counter"));
