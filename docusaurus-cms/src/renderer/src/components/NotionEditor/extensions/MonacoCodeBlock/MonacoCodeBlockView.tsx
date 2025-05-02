import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import * as monaco from 'monaco-editor';

// Define the props for our component with proper types
interface MonacoCodeBlockViewProps extends NodeViewProps {}

// Define supported programming languages
type ProgrammingLanguage =
  | 'javascript'
  | 'typescript'
  | 'html'
  | 'css'
  | 'json'
  | 'python'
  | 'java'
  | 'csharp'
  | 'php'
  | 'ruby'
  | 'go'
  | 'rust'
  | 'shell';

// Simple debounce function
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: any[]) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
};

const MonacoCodeBlockView: React.FC<MonacoCodeBlockViewProps> = ({
  node,
  updateAttributes,
  editor,
  getPos,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [editorMounted, setEditorMounted] = useState<boolean>(false);
  const isUpdatingRef = useRef<boolean>(false);
  const language = node.attrs.language || 'javascript';

  // Store initial content in a ref to compare with later
  const initialContentRef = useRef<string>(node.textContent);

  // Initialize Monaco editor
  useEffect(() => {
    if (editorRef.current && !monacoInstance.current) {
      // Create Monaco editor
      monacoInstance.current = monaco.editor.create(editorRef.current, {
        value: node.textContent,
        language: language,
        theme: 'vs-dark',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        fontSize: 14,
        lineNumbers: 'on',
        folding: true,
        tabSize: 2,
      });

      // Store initial content
      initialContentRef.current = node.textContent;

      // Create a debounced update function
      const debouncedUpdate = debounce((value: string) => {
        if (!monacoInstance.current || isUpdatingRef.current) return;

        try {
          // Set flag to prevent recursive updates
          isUpdatingRef.current = true;

          // Create new content for the node that completely replaces the old content
          // This helps ensure we don't accumulate text from previous edits
          const pos = getPos();

          // Complete replacement of the code block with new content
          const tr = editor.state.tr;

          // Get the original node to determine its type
          const originalNode = editor.state.doc.nodeAt(pos);
          if (!originalNode) {
            console.error('Could not find original node');
            return;
          }

          // Create a new node with the updated content but same attributes
          const newContent = [{ type: 'text', text: value }];
          const newNode = editor.schema.nodes[originalNode.type.name].create(
            { ...originalNode.attrs },
            editor.schema.nodeFromJSON({ type: 'text', text: value }),
            originalNode.marks,
          );

          // Replace the entire node with the new one
          tr.replaceWith(pos, pos + originalNode.nodeSize, newNode);
          editor.view.dispatch(tr);

          // Update the reference to compare for future changes
          initialContentRef.current = value;
        } catch (error) {
          console.error('Error updating code block:', error);
        } finally {
          // Reset flag
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 0);
        }
      }, 300);

      // Handle changes in Monaco editor
      monacoInstance.current.onDidChangeModelContent(() => {
        if (!monacoInstance.current) return;

        const value = monacoInstance.current.getValue();

        // Only trigger update if content has actually changed from initial state
        if (value !== initialContentRef.current) {
          debouncedUpdate(value);
        }
      });

      setEditorMounted(true);
    }

    return () => {
      if (monacoInstance.current) {
        monacoInstance.current.dispose();
        monacoInstance.current = null;
      }
    };
  }, []);

  // Update Monaco language when language attribute changes
  useEffect(() => {
    if (monacoInstance.current && editorMounted) {
      const model = monacoInstance.current.getModel();
      if (!model) return;
      monaco.editor.setModelLanguage(model, language);
    }
  }, [language, editorMounted]);

  // Handle external content changes
  useEffect(() => {
    if (
      monacoInstance.current &&
      !isUpdatingRef.current &&
      node.textContent !== initialContentRef.current
    ) {
      isUpdatingRef.current = true;

      // Update the editor with external changes
      monacoInstance.current.setValue(node.textContent);
      initialContentRef.current = node.textContent;

      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [node.textContent]);

  // Handle language selection
  const onLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateAttributes({ language: e.target.value });
  };

  // Common programming languages
  const languages: ProgrammingLanguage[] = [
    'javascript',
    'typescript',
    'html',
    'css',
    'json',
    'python',
    'java',
    'csharp',
    'php',
    'ruby',
    'go',
    'rust',
    'shell',
  ];

  return (
    <NodeViewWrapper className="monaco-code-block">
      <div className="code-block-header">
        <select value={language} onChange={onLanguageChange} className="language-selector">
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>
      <div
        ref={editorRef}
        className="monaco-editor-container"
        style={{
          height: '200px',
          width: '100%',
          marginBottom: '0.5rem',
        }}
      />
    </NodeViewWrapper>
  );
};

export default MonacoCodeBlockView;
