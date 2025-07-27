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
│   └── types.ts          # Shared types
├── ui/
│   ├── components/base/  # UI components
│   ├── hooks/           # Custom hooks
│   ├── contexts/        # React contexts
│   └── index.tsx        # UI entry point
└── shared/              # Shared utilities
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

📖 **[Complete Documentation](./documentation.md)** - components and  examples

## Resources

### Figma Plugin Development
- [Figma Plugin API](https://www.figma.com/plugin-docs/) - Official API documentation
- [create-figma-plugin](https://github.com/yuanqing/create-figma-plugin) - Build tooling used in this starter
- [Figma Plugin Samples](https://github.com/figma/plugin-samples) - Official plugin examples

### TypeScript & React
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Preact Documentation](https://preactjs.com/guide/v10/getting-started)

## License

MIT © [Your Name](https://github.com/your-username)
