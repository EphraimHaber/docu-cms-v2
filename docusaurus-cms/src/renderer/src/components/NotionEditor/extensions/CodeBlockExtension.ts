import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import CodeBlockComponent from '../CodeBlockComponent';

export interface CodeBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    codeBlock: {
      /**
       * Set a code block
       */
      setCodeBlock: (attributes?: { language?: string; title?: string }) => ReturnType;
      /**
       * Toggle a code block
       */
      toggleCodeBlock: (attributes?: { language?: string; title?: string }) => ReturnType;
    };
  }
}

export const CodeBlockExtension = Node.create<CodeBlockOptions>({
  name: 'codeBlock',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: 'text*',

  marks: '',

  group: 'block',

  code: true,

  defining: true,

  addAttributes() {
    return {
      language: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-language') || '',
        renderHTML: (attributes) => {
          if (!attributes.language) {
            return {};
          }

          return {
            'data-language': attributes.language,
          };
        },
      },
      title: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-title') || '',
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {};
          }

          return {
            'data-title': attributes.title,
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
    return ['pre', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), ['code', {}, 0]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },

  addCommands() {
    return {
      setCodeBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleCodeBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes);
        },
    };
  },
});
