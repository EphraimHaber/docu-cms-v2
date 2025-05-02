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

const MonacoCodeBlockView: React.FC<MonacoCodeBlockViewProps> = ({
  node,
  updateAttributes,
  editor,
  getPos,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [editorMounted, setEditorMounted] = useState<boolean>(false);
  const language = node.attrs.language || 'javascript';

  // Initialize Monaco editor
  useEffect(() => {
    if (editorRef.current && !monacoInstance.current) {
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

      // Handle changes in Monaco editor
      monacoInstance.current.onDidChangeModelContent(() => {
        if (!monacoInstance.current) return;
        const value = monacoInstance.current.getValue();

        // Only update if content has changed
        if (value !== node.textContent) {
          console.log('lol');
          const content = monacoInstance.current.getModel()?.getValue();
          const nodeContent = node.textContent;
          console.log({ value, content, nodeContent });
          console.log(value, node.textContent);
          editor.view.dispatch(
            editor.state.tr
              .setNodeMarkup(getPos(), undefined, {
                ...node.attrs,
              })
              .insertText(value, getPos() + 1, getPos() + node.nodeSize - 1),
          );

          // Ensure Monaco keeps focus
          setTimeout(() => {
            if (monacoInstance.current) {
              monacoInstance.current.focus();
            }
          }, 0);
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
