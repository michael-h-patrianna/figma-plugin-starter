# Figma Plugin Starter

> A TypeScript Figma plugin starter template with React components, utility functions, automatic settings persistence, messaging, toastr, modals - things you always need.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Preact](https://img.shields.io/badge/Preact-673AB8?style=flat-square&logo=preact&logoColor=white)](https://preactjs.com/)
[![Figma](https://img.shields.io/badge/Figma-F24E1E?style=flat-square&logo=figma&logoColor=white)](https://www.figma.com/)

## Quick Start

### Option 1: Use as Template (Recommended)
1. Click **"Use this template"** on GitHub to create your own repo
2. Clone your new repository:
```bash
git clone https://github.com/your-username/your-plugin-name.git
cd your-plugin-name
npm install
npm run dev
```

### Option 2: Fork and Clone
```bash
# Fork this repo on GitHub, then:
git clone https://github.com/your-username/figma-plugin-starter.git
cd figma-plugin-starter
npm install
npm run dev
```

### Option 3: Download and Start Fresh
```bash
# Download/clone, then create your own repo:
git clone https://github.com/michael-h-patrianna/figma-plugin-starter.git my-plugin
cd my-plugin
rm -rf .git
git init
git remote add origin https://github.com/your-username/your-plugin-name.git
npm install
npm run dev
```

**Load in Figma:**
1. Open Figma → Plugins → Development → Import plugin from manifest
2. Select `manifest.json`
3. Run your plugin


## Project Structure

```
src/
├── main/
│   ├── index.ts          # Plugin entry point
│   ├── types.ts          # Shared types
│   ├── errors.ts         # Error handling
│   └── tools/            # Plugin tools and utilities
│       ├── content-creator.ts
│       ├── image-exporter.ts
│       ├── node-scanner.ts
│       └── ui-helpers.ts
├── ui/
│   ├── assets/           # UI assets
│   ├── components/       # UI components
│   │   ├── base/         # UI components
│   │   ├── panels/       # Special panel components (debug, help)
│   │   └── views/        # Demo components
│   ├── contexts/         # React contexts (theme)
│   ├── hooks/            # Custom hooks
│   ├── services/         # Global services (toast, messageBox)
│   ├── messaging.ts      # UI messaging system
│   ├── styles.css        # Global styles
│   └── index.tsx         # UI entry point
└── shared/               # Shared utilities
    ├── constants.ts      # App constants
    ├── utils.ts          # Utility functions
    ├── exportUtils.ts    # Export utilities
    └── selectionUtils.ts # Selection utilities
```

## Development

```bash
npm run dev      # Development with hot reload
npm run build    # Production build
npm run watch    # Watch mode
npm run lint     # ESLint
npm run format   # Prettier
```

## Documentation

📖 **[Complete Documentation](./docs/documentation.md)** - Full API reference and component documentation
🧩 **[Component Examples](./docs/component-examples.md)** - Usage examples for all components
💬 **[Messaging & Progress Examples](./docs/messaging-examples.md)** - Main↔UI thread communication patterns

## Resources

### Figma Plugin Development
- [Figma Plugin API](https://www.figma.com/plugin-docs/) - Official API documentation
- [create-figma-plugin](https://github.com/yuanqing/create-figma-plugin) - Build tooling used in this starter
- [Figma Plugin Samples](https://github.com/figma/plugin-samples) - Official plugin examples
- [Preact Documentation](https://preactjs.com/guide/v10/getting-started)
