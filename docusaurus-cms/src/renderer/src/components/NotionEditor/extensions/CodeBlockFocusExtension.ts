import { Extension } from '@tiptap/core';

export const CodeBlockFocusExtension = Extension.create({
  name: 'codeBlockFocus',

  addKeyboardShortcuts() {
    return {
      ArrowDown: ({ editor }) => {
        // Get the current selection
        const { selection, doc } = editor.state;
        const { from, to, empty } = selection;

        // Only proceed if it's a cursor position (not a selection)
        if (!empty) {
          return false;
        }

        // Check if we're at the end of a node (paragraph, heading, etc)
        const $pos = selection.$from;
        const isAtEndOfNode = $pos.pos === $pos.end();

        if (!isAtEndOfNode) {
          return false;
        }

        // Check if the next node is a code block
        const currentNode = $pos.node();
        const nextPos = $pos.after();
        const nextNode = doc.nodeAt(nextPos);

        if (nextNode && nextNode.type.name === 'codeBlock') {
          console.log('Down arrow pressed at end of node before code block');

          // Find the DOM element for the code block
          // Using setTimeout to ensure we're not interfering with TipTap's own handling
          setTimeout(() => {
            // Handle focusing on code block
            try {
              // First, let TipTap move the selection to the code block
              // We need to wait for TipTap to select the codeBlock before we can find its DOM element
              const nodeView = editor.view.nodeDOM(nextPos) as HTMLElement;

              if (nodeView) {
                // Look for the Monaco editor inside this specific node view
                const editorContainer = nodeView.querySelector('.monaco-editor-container');
                if (editorContainer) {
                  // Find the hidden textarea that Monaco actually uses for input
                  const textareas = editorContainer.querySelectorAll('textarea');
                  if (textareas.length > 0) {
                    // Focus the textarea
                    textareas[0].focus();
                    console.log('Found and focused Monaco editor textarea directly');
                  } else {
                    // If we can't find the textarea, try clicking the editor container
                    editorContainer.click();
                    console.log('Clicked editor container');
                  }
                } else {
                  console.log('Could not find Monaco editor container within node');
                }
              } else {
                console.log('Could not find node DOM element');
              }
            } catch (e) {
              console.error('Error focusing code block:', e);
            }
          }, 10); // Small delay to ensure DOM is updated

          return false; // Let TipTap handle the initial cursor movement
        }

        return false; // Let TipTap handle other cases
      },
    };
  },
});
