import React, { useEffect, useRef, useState, ChangeEvent, useCallback } from 'react';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import * as monaco from 'monaco-editor';
import './MonacoCodeBlockView.css';

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
  const initialContentRef = useRef<string>(node.textContent);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Function to insert a new paragraph node after the current node
  const insertNodeAfter = useCallback(() => {
    if (typeof getPos !== 'function') return;

    const pos = getPos();
    if (pos === undefined) return;

    const endPos = pos + node.nodeSize;
    const tr = editor.state.tr;
    const newNode = editor.schema.nodes.paragraph.create();

    tr.insert(endPos, newNode);
    editor.view.dispatch(tr);

    editor.commands.focus(endPos + 1);
  }, [editor, getPos, node.nodeSize]);

  // Handle delete action
  const handleDelete = () => {
    if (typeof getPos === 'function') {
      const pos = getPos();
      const tr = editor.state.tr;
      const nodeAtPos = editor.state.doc.nodeAt(pos);

      if (nodeAtPos) {
        tr.delete(pos, pos + nodeAtPos.nodeSize);
        editor.view.dispatch(tr);
      }
    }
  };

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

      initialContentRef.current = node.textContent;

      const debouncedUpdate = debounce((value: string) => {
        if (!monacoInstance.current || isUpdatingRef.current) return;

        try {
          isUpdatingRef.current = true;

          const pos = getPos();

          const tr = editor.state.tr;

          const originalNode = editor.state.doc.nodeAt(pos);
          if (!originalNode) {
            console.error('Could not find original node');
            return;
          }

          const newNode = editor.schema.nodes[originalNode.type.name].create(
            { ...originalNode.attrs },
            editor.schema.nodeFromJSON({ type: 'text', text: value }),
            originalNode.marks,
          );

          tr.replaceWith(pos, pos + originalNode.nodeSize, newNode);
          editor.view.dispatch(tr);

          initialContentRef.current = value;
        } catch (error) {
          console.error('Error updating code block:', error);
        } finally {
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 0);
        }
      }, 300);

      monacoInstance.current.onDidChangeModelContent(() => {
        if (!monacoInstance.current) return;

        const value = monacoInstance.current.getValue();

        if (value !== initialContentRef.current) {
          debouncedUpdate(value);
        }
      });

      monacoInstance.current.onKeyDown((e) => {
        if (!monacoInstance.current) return;

        if (e.keyCode === monaco.KeyCode.DownArrow) {
          const model = monacoInstance.current.getModel();
          const position = monacoInstance.current.getPosition();

          if (model && position) {
            const lastLineNumber = model.getLineCount();
            const lastLineMaxColumn = model.getLineMaxColumn(lastLineNumber);

            if (position.lineNumber === lastLineNumber && position.column === lastLineMaxColumn) {
              e.preventDefault();
              e.stopPropagation();
              insertNodeAfter();
            }
          }
        }

        if (e.keyCode === monaco.KeyCode.UpArrow) {
          const model = monacoInstance.current.getModel();
          const position = monacoInstance.current.getPosition();

          if (model && position) {
            if (position.lineNumber === 1 && position.column === 1) {
              e.preventDefault();
              e.stopPropagation();
              if (typeof getPos === 'function') {
                const pos = getPos();
                if (pos !== undefined) {
                  editor.commands.focus(pos);
                }
              }
            }
          }
        }

        if (e.keyCode === monaco.KeyCode.LeftArrow) {
          const model = monacoInstance.current.getModel();
          const position = monacoInstance.current.getPosition();

          if (model && position) {
            if (position.lineNumber === 1 && position.column === 1) {
              e.preventDefault();
              e.stopPropagation();
              if (typeof getPos === 'function') {
                const pos = getPos();
                if (pos !== undefined) {
                  editor.commands.focus(pos);
                }
              }
            }
          }
        }

        if (e.keyCode === monaco.KeyCode.RightArrow) {
          const model = monacoInstance.current.getModel();
          const position = monacoInstance.current.getPosition();

          if (model && position) {
            const lastLineNumber = model.getLineCount();
            const lastLineMaxColumn = model.getLineMaxColumn(lastLineNumber);

            if (position.lineNumber === lastLineNumber && position.column === lastLineMaxColumn) {
              e.preventDefault();
              e.stopPropagation();
              if (typeof getPos === 'function') {
                const pos = getPos();
                if (pos !== undefined) {
                  editor.commands.focus(pos + node.nodeSize);
                }
              }
            }
          }
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
  }, [insertNodeAfter, getPos, editor, node.nodeSize]);

  useEffect(() => {
    if (monacoInstance.current && editorMounted) {
      const model = monacoInstance.current.getModel();
      if (!model) return;
      monaco.editor.setModelLanguage(model, language);
    }
  }, [language, editorMounted]);

  useEffect(() => {
    if (
      monacoInstance.current &&
      !isUpdatingRef.current &&
      node.textContent !== initialContentRef.current
    ) {
      isUpdatingRef.current = true;

      monacoInstance.current.setValue(node.textContent);
      initialContentRef.current = node.textContent;

      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [node.textContent]);

  const onLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateAttributes({ language: e.target.value });
  };

  const handleWrapperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      wrapperRef.current &&
      event.target === wrapperRef.current &&
      editorRef.current &&
      typeof getPos === 'function'
    ) {
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();
      const clickY = event.clientY;

      if (clickY > editorRect.bottom && clickY <= wrapperRect.bottom) {
        insertNodeAfter();
      }
    }
  };

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
    <NodeViewWrapper
      ref={wrapperRef}
      className="monaco-code-block-wrapper"
      onClick={handleWrapperClick}
    >
      <div className="monaco-code-block">
        <div className="code-block-header" contentEditable={false}>
          <span className="language-label">Language:</span>
          <select
            value={language}
            onChange={onLanguageChange}
            className="language-selector"
            tabIndex={-1}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <button
            className="delete-code-block-button"
            onClick={handleDelete}
            title="Delete code block"
            tabIndex={-1}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div
          contentEditable={false}
          ref={editorRef}
          className="monaco-editor-container"
          style={{
            height: '200px',
            width: '100%',
            marginBottom: '0.5rem',
          }}
        />
      </div>
    </NodeViewWrapper>
  );
};

export default MonacoCodeBlockView;
