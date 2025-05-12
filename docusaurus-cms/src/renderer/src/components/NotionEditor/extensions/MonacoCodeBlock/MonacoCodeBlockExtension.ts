import CodeBlock from '@tiptap/extension-code-block';
import { ReactNodeViewRenderer } from '@tiptap/react';
import MonacoCodeBlockView from './MonacoCodeBlockView';
import { AdmonitionAttributes } from '../AdmonitionExtension';

interface MonacoCodeBlockAttributes {
  language: string;
}

export interface MonacoCodeBlockOptions {
  defaultLanguage: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    admonition: {
      setAdmonition: (attributes: AdmonitionAttributes) => ReturnType;
    };

    monacoCodeBlock: {
      setMonacoCodeBlock: (attributes?: { language?: string }) => ReturnType;
      toggleMonacoCodeBlock: (attributes?: { language?: string }) => ReturnType;
    };
  }
}

export const MonacoCodeBlock = CodeBlock.extend({
  codeBlock: true,
  name: 'codeBlock',
  group: 'block',
  content: 'text*',
  marks: '', // No marks allowed inside
  defining: true,

  addOptions() {
    return {
      ...this.parent?.(),
      defaultLanguage: 'javascript',
    };
  },

  addAttributes() {
    return {
      language: {
        default: this.options.defaultLanguage,
        parseHTML: (element) =>
          element.getAttribute('data-language') || this.options.defaultLanguage,
        renderHTML: (attributes: MonacoCodeBlockAttributes) => {
          return {
            'data-language': attributes.language,
            class: `language-${attributes.language}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['pre', HTMLAttributes, ['code', {}, 0]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MonacoCodeBlockView);
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setMonacoCodeBlock:
        (attributes?: { language?: string }) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleMonacoCodeBlock:
        (attributes?: { language?: string }) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleMonacoCodeBlock(),
    };
  },
});
