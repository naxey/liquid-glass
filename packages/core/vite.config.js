import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			entry: "src/main.js",
			name: "core",
			fileName: (format) => `core.${format}.js`,
			formats: ["es", "umd"],
		},
		rollupOptions: {
			// Externalize dependencies if needed
			// external: [],
		},
	},
});
