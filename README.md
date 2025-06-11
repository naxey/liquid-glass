# liquid-glass-kit

An attempt to recreate apples **liquid glass**

The goal of this project it to be able to import it into `react`, `vue`, `svelte`, or just a plain `vanilla` html project.

```
liquid-glass-kit/
  packages/
    core/ # Web Component implementation
    react/ # React wrapper
    vue/ # Vue plugin
    svelte/ # Svelte component
```

## Usage

### 1. Install

```sh
npm install @liquid-glass-kit/core

# or @liquid-glass-kit/react, @liquid-glass-kit/vue, @liquid-glass-kit/svelte
```

### 2. Use in Your Project

#### Vanilla HTML

```html
<script type="module">
	import "@liquid-glass-kit/core";
</script>

<liquid-glass>
	<!-- content -->
</liquid-glass>
```
