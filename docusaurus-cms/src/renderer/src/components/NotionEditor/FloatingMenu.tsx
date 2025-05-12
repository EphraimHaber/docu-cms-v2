import { useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import './FloatingMenu.css';

interface FloatingMenuProps {
  editor: Editor;
}

const FloatingMenu = ({ editor }: FloatingMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { view } = editor;
    const { state } = view;

    if (!menuRef.current) return;

    const { from, to } = state.selection;
    if (from === to) return;

    // Get the coordinates of the selection
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    const menuElement = menuRef.current;
    const menuRect = menuElement.getBoundingClientRect();

    // Position the menu above the selection, centered
    const left = (start.left + end.left) / 2 - menuRect.width / 2;
    const top = start.top - menuRect.height - 10;

    menuElement.style.left = `${Math.max(5, left)}px`;
    menuElement.style.top = `${Math.max(5, top)}px`;
  }, [editor]);

  if (!editor.isActive) return null;

  return (
    <div className="floating-menu" ref={menuRef}>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        title="Bold"
      >
        B
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        title="Italic"
      >
        I
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
        title="Strike"
      >
        S
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive('code') ? 'is-active' : ''}
        title="Code"
      >
        {'</>'}
      </button>
      <button
        onClick={() => {
          const url = window.prompt('Enter the URL');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={editor.isActive('link') ? 'is-active' : ''}
        title="Link"
      >
        🔗
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={editor.isActive('highlight') ? 'is-active' : ''}
        title="Highlight"
      >
        H
      </button>
    </div>
  );
};

export default FloatingMenu;
