import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import React, { useState, useEffect } from 'react';
import './Editor.css';
import { MarkdownSerializer } from './MarkdownSerializer';
import { MarkdownParser } from './MarkdownParser';
import FloatingMenu from './FloatingMenu';
import SlashCommands from './SlashCommands';
import { AdmonitionExtension } from './extensions/AdmonitionExtension';
import { MonacoCodeBlock } from './extensions/MonacoCodeBlock/MonacoCodeBlockExtension';
import { CodeBlockFocusExtension } from './extensions/CodeBlockFocusExtension';

interface NotionEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  onSave: () => void;
}

const NotionEditor = ({ content, onChange, onSave }: NotionEditorProps): React.JSX.Element => {
  const [selectedText, setSelectedText] = useState('');
  const [parsedContent, setParsedContent] = useState<any>(null);

  // Parse markdown content when it changes
  useEffect(() => {
    try {
      const parsed = MarkdownParser.parse(content);
      setParsedContent(parsed);
    } catch (error) {
      console.error('Error parsing markdown:', error);
      // Fallback to basic content
      setParsedContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: content }],
          },
        ],
      });
    }
  }, [content]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: 'Type "/" for commands...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'custom-link',
        },
      }),
      Highlight,
      GlobalDragHandle,
      // custom extensions
      MonacoCodeBlock,
      AdmonitionExtension,
      CodeBlockFocusExtension,
    ],
    content: parsedContent,
    autofocus: 'end',
    onUpdate: ({ editor }) => {
      const markdown = MarkdownSerializer.serialize(editor.getJSON());
      onChange(markdown);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        setSelectedText(editor.state.doc.textBetween(from, to));
      } else {
        setSelectedText('');
      }
    },
  });

  // Update editor content when parsedContent changes
  useEffect(() => {
    if (editor && parsedContent) {
      // We only want to update if the editor isn't already focused/being edited
      if (!editor.isFocused) {
        editor.commands.setContent(parsedContent);
      }
    }
  }, [editor, parsedContent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSave();
    }
  };

  if (!editor) {
    return <div className="notion-editor-loading">Loading editor...</div>;
  }

  return (
    <div data-testid="notion-editor" className="notion-editor" onKeyDown={handleKeyDown}>
      {editor && selectedText && <FloatingMenu editor={editor} />}
      {editor && <SlashCommands editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
};

export default NotionEditor;
