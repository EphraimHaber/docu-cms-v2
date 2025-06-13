import Image from '@tiptap/extension-image';
import { dirname, join } from '../../../utils/path';

export const imageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.src) return {};

          // Handle relative paths for preview
          let src = attributes.src;
          if (src.startsWith('./')) {
            // Get the current file path from localStorage
            const currentFilePath = localStorage.getItem('currentFilePath');
            if (currentFilePath) {
              const currentDir = dirname(currentFilePath);
              // Remove the leading './'
              const relativePath = src.slice(2);
              // Join the paths to get the absolute path
              src = join(currentDir, relativePath);
            }
          } // Use docusaurus-img:// protocol which we'll register in the main process
          // Convert the path to the correct format and encode it
          const formattedPath = src.replace(/\\/g, '/');
          return {
            src: `docusaurus-img:///${formattedPath}`,
          };
        },
      },
    };
  },
}).configure({
  inline: true,
  HTMLAttributes: {
    class: 'docusaurus-image',
  },
});
