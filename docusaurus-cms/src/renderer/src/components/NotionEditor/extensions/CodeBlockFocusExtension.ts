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
          console.log('Down arrow pressed, focusing next code block node');
          // It's important to pass the correct position to focus.
          // `nextPos` should be the starting position of the nextNode.
          // The existing `const nextPos = $pos.after();` should provide this.
          if (editor.commands.focus(nextPos)) {
            // If focus command is successful, we've handled the event.
            return true;
          }
          // If focus command fails for some reason, fall back to default behavior.
          return false;
        }

        return false;
      },
    };
  },
});
