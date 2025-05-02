import React, { useState, useCallback } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Highlight, themes, Prism } from 'prism-react-renderer';
import Editor, { Monaco } from '@monaco-editor/react';
import './CodeBlock.css';

// Add additional languages
(typeof global !== 'undefined' ? global : window).Prism = Prism;

// Dynamic imports for Prism languages
await import('prismjs/components/prism-bash');
await import('prismjs/components/prism-typescript');
await import('prismjs/components/prism-jsx');
await import('prismjs/components/prism-tsx');
await import('prismjs/components/prism-markdown');
await import('prismjs/components/prism-json');
await import('prismjs/components/prism-yaml');
await import('prismjs/components/prism-css');
await import('prismjs/components/prism-scss');
await import('prismjs/components/prism-python');

interface CodeBlockComponentProps extends NodeViewProps {}

const CodeBlockComponent: React.FC<CodeBlockComponentProps> = ({
  node,
  updateAttributes,
  editor,
  getPos,
}) => {
  const language = node.attrs.language || 'text';
  const title = node.attrs.title || '';
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [titleInput, setTitleInput] = useState(title);
  const [languageInput, setLanguageInput] = useState(language);
  const [code, setCode] = useState(node.textContent);

  const codeContent = node.textContent;

  const registerCustomTheme = (monaco: Monaco) => {
    // monaco.editor.defineTheme('my-custom-theme', monacoCustomTheme);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleInput(e.target.value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguageInput(e.target.value);
  };

  const handleCodeChange = useCallback((value: string | undefined) => {
    setCode(value || '');
  }, []);

  const openEditModal = () => {
    setTitleInput(title);
    setLanguageInput(language);
    setCode(node.textContent);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const saveChanges = () => {
    updateAttributes({
      title: titleInput,
      language: languageInput,
    });

    // Update the content
    if (typeof getPos === 'function') {
      const pos = getPos();
      // Replace the content of the node with new code
      const tr = editor.state.tr.insertText(code, pos + 1, pos + 1 + node.textContent.length);
      editor.view.dispatch(tr);
    }

    closeEditModal();
  };

  // Map Monaco languages to Prism languages
  const getMonacoLanguage = (lang: string) => {
    const mapping: Record<string, string> = {
      jsx: 'javascript',
      tsx: 'typescript',
      bash: 'shell',
      text: 'plaintext',
    };
    return mapping[lang] || lang;
  };

  // List of common languages for the dropdown
  const languages = [
    'text',
    'javascript',
    'typescript',
    'jsx',
    'tsx',
    'html',
    'css',
    'json',
    'yaml',
    'bash',
    'python',
    'markdown',
    'scss',
  ];

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <div className="code-block-container">
        {/* Header with title and controls */}
        <div className="code-block-header">
          {title && <div className="code-block-title">{title}</div>}
          <div className="code-block-language">{language}</div>
          <button onClick={openEditModal} className="code-block-edit-btn">
            Edit
          </button>
        </div>

        {/* Code content with Prism for display */}
        <Highlight theme={themes.vsDark} code={codeContent} language={language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => {
            // Filter out any completely empty lines at the beginning
            const nonEmptyTokens = tokens.filter(
              (line, index) => !(index === 0 && line.length === 1 && line[0].empty),
            );

            return (
              <pre className={`${className} code-block-pre`} style={style}>
                <code>
                  {nonEmptyTokens.map((line, i) => {
                    // Extract the key prop and rest of properties
                    const lineProps = getLineProps({ line, key: i });
                    const { key: lineKey, ...restLineProps } = lineProps;

                    return (
                      <div key={lineKey as any} {...restLineProps}>
                        <span className="code-block-line-number">{i + 1}</span>
                        <span className="code-block-line-content">
                          {line.map((token, key) => {
                            // Extract the key prop and rest of properties for tokens
                            const tokenProps = getTokenProps({ token, key });
                            const { key: tokenKey, ...restTokenProps } = tokenProps;

                            return <span key={tokenKey as any} {...restTokenProps} />;
                          })}
                        </span>
                      </div>
                    );
                  })}
                </code>
              </pre>
            );
          }}
        </Highlight>
      </div>

      {/* Monaco Editor Modal */}
      {isEditModalOpen && (
        <div className="code-block-modal-overlay">
          <div className="code-block-modal">
            <div className="code-block-modal-header">
              <h3>Edit Code Block</h3>
              <div className="code-block-modal-controls">
                <input
                  type="text"
                  value={titleInput}
                  onChange={handleTitleChange}
                  placeholder="Add title (optional)"
                  className="code-block-title-input"
                />
                <select
                  value={languageInput}
                  onChange={handleLanguageChange}
                  className="code-block-language-select"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="code-block-modal-editor">
              <Editor
                height="400px"
                beforeMount={registerCustomTheme}
                defaultLanguage={getMonacoLanguage(languageInput)}
                defaultValue={codeContent}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  fontSize: 14,
                  wordWrap: 'on',
                }}
                theme="vs-dark"
              />
            </div>
            <div className="code-block-modal-footer">
              <button onClick={saveChanges} className="code-block-save-btn">
                Save
              </button>
              <button onClick={closeEditModal} className="code-block-cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
