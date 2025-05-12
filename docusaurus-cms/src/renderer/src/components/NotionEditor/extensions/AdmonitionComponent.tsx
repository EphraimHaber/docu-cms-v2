import { useState, useEffect } from 'react';
import { NodeViewProps, NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import './AdmonitionComponent.css';

export const AdmonitionComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  extension,
  editor,
  getPos,
  deleteNode,
  //@ts-ignore
  ...props
}) => {
  const type = node.attrs.type || 'note';
  const [title, setTitle] = useState(node.attrs.title || '');

  // Sync title with node attributes when they change externally
  useEffect(() => {
    setTitle(node.attrs.title || '');
  }, [node.attrs.title]);

  const getAdmonitionIcon = () => {
    switch (type) {
      case 'tip':
      case 'success':
        return '💡';
      case 'warning':
      case 'caution':
        return '⚠️';
      case 'danger':
      case 'error':
        return '🔥';
      case 'info':
        return 'ℹ️';
      case 'note':
      default:
        return '📝';
    }
  };

  const getAdmonitionColor = () => {
    switch (type) {
      case 'tip':
      case 'success':
        return 'var(--ifm-color-success)';
      case 'warning':
      case 'caution':
        return 'var(--ifm-color-warning)';
      case 'danger':
      case 'error':
        return 'var(--ifm-color-danger)';
      case 'info':
        return 'var(--ifm-color-info)';
      case 'note':
      default:
        return 'var(--ifm-color-primary)';
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    updateAttributes({ title: newTitle });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateAttributes({ type: e.target.value });
  };

  // Function to handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Handle backspace when the admonition content is empty
    if (event.key === 'Backspace' && typeof getPos === 'function') {
      const pos = getPos();
      const { state } = editor;

      // Check if the admonition is empty (contains only an empty paragraph)
      const nodeSize = state.doc.nodeAt(pos)?.nodeSize || 0;
      const isEmpty = nodeSize <= 4;

      if (isEmpty && deleteNode) {
        event.preventDefault();
        deleteNode();
      }
    }
  };

  return (
    <NodeViewWrapper className="admonition-wrapper" onKeyDown={handleKeyDown} data-type={type}>
      <div
        className={`admonition admonition-${type}`}
        style={{ borderColor: getAdmonitionColor() }}
      >
        <div
          className="admonition-heading"
          style={{ backgroundColor: `${getAdmonitionColor()}22` }}
          contentEditable={false}
        >
          <div className="admonition-icon">{getAdmonitionIcon()}</div>

          {editor.isEditable && (
            <div className="admonition-controls">
              <input
                className="admonition-title-input"
                value={title}
                placeholder={type.charAt(0).toUpperCase() + type.slice(1)}
                onChange={handleTitleChange}
              />

              <select value={type} onChange={handleTypeChange} className="admonition-type-select">
                <option value="note">Note</option>
                <option value="tip">Tip</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
              </select>
            </div>
          )}

          {!editor.isEditable && (
            <div className="admonition-title">
              {title || type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
          )}
        </div>

        <div className="admonition-content">
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default AdmonitionComponent;
