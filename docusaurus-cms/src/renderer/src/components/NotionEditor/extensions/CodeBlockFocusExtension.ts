import { Extension } from '@tiptap/core';

export const CodeBlockFocusExtension = Extension.create({
  name: 'codeBlockFocus',

  addKeyboardShortcuts() {
    return {
      ArrowDown: ({ editor }) => {
        const { selection, doc } = editor.state;
        // const { from, to, empty } = selection;
        const { empty } = selection;

        if (!empty) {
          return false;
        }

        const $pos = selection.$from;

        const currentNode = $pos.node();

        const textContent = currentNode.textContent;

        if (!textContent) {
          return false;
        }

        // Find the line breaks in the text
        const lines = textContent.split('\n');

        if (lines.length <= 1) {
          const isAtEndOfNode = $pos.pos === $pos.end();
          if (!isAtEndOfNode) {
            return false;
          }
        } else {
          // For multi-line nodes, we need to check if we're on the last line
          // Get the relative position of the cursor within the node
          const nodeStartPos = $pos.start();
          const offsetInNode = $pos.pos - nodeStartPos;

          // Find the start position of the last line in the text
          const allButLastLine = lines.slice(0, -1).join('\n');
          const lastLineStartOffset = allButLastLine.length + 1; // +1 for the \n character

          // If we're not on the last line, let TipTap handle it normally
          if (offsetInNode < lastLineStartOffset) {
            return false;
          }

          // We're on the last line, continue with our custom handling
        }

        // Check if the next node is a code block
        const nextPos = $pos.after();
        const nextNode = doc.nodeAt(nextPos);

        if (nextNode && nextNode.type.name === 'codeBlock') {
          console.log('Down arrow pressed with next node being a code block');

          // Focus the Monaco editor after TipTap has done its default handling
          setTimeout(() => {
            try {
              const nodeView = editor.view.nodeDOM(nextPos) as HTMLElement;

              if (nodeView) {
                // Find the Monaco editor container
                const editorContainer = nodeView.querySelector('.monaco-editor-container');
                if (editorContainer) {
                  // Try to find the textarea that Monaco uses for input
                  const monacoTextarea = nodeView.querySelector('.monaco-editor textarea');
                  if (monacoTextarea) {
                    (monacoTextarea as HTMLTextAreaElement).focus();
                    console.log('Focused Monaco editor textarea directly');
                  } else {
                    // If textarea not found, try to click the editor container
                    (editorContainer as HTMLElement).click();
                    console.log('Clicked editor container');
                  }
                  return;
                }
              }

              // Fallback method: Try to find Monaco editors by class
              const monacoEditors = document.querySelectorAll('.monaco-editor');
              for (let i = 0; i < monacoEditors.length; i++) {
                const editor = monacoEditors[i];
                const textarea = editor.querySelector('textarea');
                if (textarea) {
                  (textarea as HTMLTextAreaElement).focus();
                  console.log('Focused Monaco editor textarea (fallback method)');
                  return;
                }
              }

              console.log('Could not find Monaco editor to focus');
            } catch (e) {
              console.error('Error focusing code block:', e);
            }
          }, 10);

          return false;
        }

        return false;
      },
    };
  },
});
