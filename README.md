# Docusaurus CMS Editor

<!-- ![Docusaurus CMS Logo](docusaurus-cms/resources/icon.png) -->

A modern desktop application for visually editing and managing Docusaurus documentation sites with a Notion-like experience.

[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/EphraimHaber/docusaurus-cms)

## 🌟 Features

- **Notion-like WYSIWYG Editor**: Edit your Markdown/MDX content with a modern block-based editor
- **Front Matter Management**: Easily edit document metadata with intuitive cards
- **Document Organization**: Create, edit, and manage documents, blog posts, and categories
- **Real-time Preview**: See your changes as they would appear in Docusaurus
- **Admonition Support**: Create and edit Docusaurus admonitions (tips, warnings, etc.)
- **Code Block Editing**: Syntax highlighting for code blocks
- **Project Structure**: Visual management of your Docusaurus project structure

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22 or above)
- [pnpm](https://pnpm.io/) package manager

### Installation

1. Clone this repository:

    ```bash
    git clone https://github.com/yourusername/docusaurus-cms.git
    cd docusaurus-cms
    ```

2. Install dependencies:

    ```bash
    pnpm install
    ```

3. Start the development server:
    ```bash
    pnpm dev
    ```

### Building for Production

```bash
# For Windows
pnpm build:win

# For macOS
pnpm build:mac

# For Linux
pnpm build:linux
```

## 📖 How to Use

1. **Launch the application**: Open the Docusaurus CMS Editor
2. **Select your Docusaurus site**: Browse to the root folder of your Docusaurus project
3. **Navigate your project**: Use the sidebar to browse documents, blog posts, and configuration files
4. **Edit content**: Use the Notion-like editor to create and modify content
5. **Save changes**: Your edits are saved to the filesystem and will be recognized by Docusaurus

## 🔧 Development

This project is built using:

- [Electron](https://www.electronjs.org/): Cross-platform desktop app framework
- [React](https://reactjs.org/): UI library
- [TypeScript](https://www.typescriptlang.org/): Type-safe JavaScript
- [TipTap](https://tiptap.dev/): Headless, extensible editor framework
- [Mantine](https://mantine.dev/): React component library

### Project Structure

```
docusaurus-cms/
├── src/
│   ├── main/         # Electron main process code
│   ├── preload/      # Preload scripts
│   ├── renderer/     # Frontend React application
│       ├── src/
│           ├── components/  # React components
│           ├── utils/       # Utility functions
│           ├── assets/      # Static assets
├── resources/       # Application resources
└── build/           # Build configuration
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Docusaurus](https://docusaurus.io/) for the amazing documentation framework
- [Electron](https://www.electronjs.org/) for making cross-platform desktop apps easier
- [TipTap](https://tiptap.dev/) for the powerful editor framework

## 📊 Roadmap

See the [TODO.md](TODO.md) file for upcoming features and development plans.

---

Made with ❤️ for the Docusaurus community
