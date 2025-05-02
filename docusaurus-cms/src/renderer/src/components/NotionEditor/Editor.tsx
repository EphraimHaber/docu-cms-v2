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
import { CodeBlockExtension } from './extensions/CodeBlockExtension';

import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
// load all languages with "all" or common languages with "common"
import { all, createLowlight } from 'lowlight';
import { CodeBlockPrism } from './extensions/PrismCodeBlockExtension';

// create a lowlight instance with all languages loaded
const lowlight = createLowlight(all);

lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('js', js);
lowlight.register('ts', ts);

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
      // CodeBlockLowlight.configure({
      //   lowlight,
      // }),
      // Use StarterKit but exclude the default codeBlock extension
      CodeBlockPrism.configure({ defaultLanguage: 'jsx' }),
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
      AdmonitionExtension,
      // Add our custom codeBlock extension
      // CodeBlockExtension,
      GlobalDragHandle,
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
    <div className="notion-editor" onKeyDown={handleKeyDown}>
      {editor && selectedText && <FloatingMenu editor={editor} />}
      {editor && <SlashCommands editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
};

export default NotionEditor;
