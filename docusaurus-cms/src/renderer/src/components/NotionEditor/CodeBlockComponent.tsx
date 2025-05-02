import React, { useState } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Highlight, themes, Prism } from 'prism-react-renderer';
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
}) => {
  const language = node.attrs.language || 'text';
  const title = node.attrs.title || '';
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(title);
  const [languageInput, setLanguageInput] = useState(language);

  const codeContent = node.textContent;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleInput(e.target.value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguageInput(e.target.value);
  };

  const saveChanges = () => {
    updateAttributes({
      title: titleInput,
      language: languageInput,
    });
    setIsEditing(false);
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
          {isEditing ? (
            <>
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
              <button onClick={saveChanges} className="code-block-save-btn">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="code-block-cancel-btn">
                Cancel
              </button>
            </>
          ) : (
            <>
              {title && <div className="code-block-title">{title}</div>}
              <div className="code-block-language">{language}</div>
              <button onClick={() => setIsEditing(true)} className="code-block-edit-btn">
                Edit
              </button>
            </>
          )}
        </div>

        {/* Code content with syntax highlighting */}
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
                      <div key={lineKey} {...restLineProps}>
                        <span className="code-block-line-number">{i + 1}</span>
                        <span className="code-block-line-content">
                          {line.map((token, key) => {
                            // Extract the key prop and rest of properties for tokens
                            const tokenProps = getTokenProps({ token, key });
                            const { key: tokenKey, ...restTokenProps } = tokenProps;

                            return <span key={tokenKey} {...restTokenProps} />;
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
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
