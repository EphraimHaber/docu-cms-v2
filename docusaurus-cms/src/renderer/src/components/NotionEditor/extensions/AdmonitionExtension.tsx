import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { AdmonitionComponent } from './AdmonitionComponent';

// Define the structure for admonition attributes
interface AdmonitionAttributes {
  type: string;
  title: string;
}

// Create a TipTap extension for Docusaurus admonitions
export const AdmonitionExtension = Node.create({
  name: 'admonition',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'note',
        parseHTML: (element) => element.getAttribute('data-type') || 'note',
      },
      title: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-title') || '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type=admonition]',
        getAttrs: (element) => {
          if (typeof element === 'string') return {};

          return {
            type: element.getAttribute('data-type') || 'note',
            title: element.getAttribute('data-title') || '',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'admonition' }, HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AdmonitionComponent);
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setAdmonition:
        (attributes: AdmonitionAttributes) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: attributes,
              content: [
                {
                  type: 'paragraph',
                },
              ],
            })
            .focus()
            .run();
        },
    };
  },
});
