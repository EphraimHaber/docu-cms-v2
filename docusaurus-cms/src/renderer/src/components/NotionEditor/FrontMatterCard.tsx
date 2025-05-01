import React, { useState } from 'react';
import './FrontMatterCard.css';

interface FrontMatterCardProps {
  frontMatter: Record<string, any>;
  onChange: (newFrontMatter: Record<string, any>) => void;
}

const FrontMatterCard = ({ frontMatter, onChange }: FrontMatterCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFrontMatter, setLocalFrontMatter] = useState(frontMatter);

  const handleChange = (key: string, value: any) => {
    const newFrontMatter = { ...localFrontMatter, [key]: value };
    setLocalFrontMatter(newFrontMatter);
    onChange(newFrontMatter);
  };

  const handleAddField = () => {
    const newKey = `newField${Object.keys(localFrontMatter).length}`;
    handleChange(newKey, '');
  };

  const handleRemoveField = (key: string) => {
    const newFrontMatter = { ...localFrontMatter };
    delete newFrontMatter[key];
    setLocalFrontMatter(newFrontMatter);
    onChange(newFrontMatter);
  };

  // Don't render certain fields that are handled separately in the UI
  const excludedFields = ['title', 'sidebar_label', 'sidebar_position', 'tags', 'authors', 'slug'];

  return (
    <div className="front-matter-card">
      <div className="front-matter-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>Page Metadata</h3>
        <span className="front-matter-toggle">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="front-matter-content">
          {Object.entries(localFrontMatter)
            .filter(([key]) => !excludedFields.includes(key))
            .map(([key, value]) => (
              <div key={key} className="front-matter-field">
                <div className="field-name">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      const newFrontMatter = { ...localFrontMatter };
                      delete newFrontMatter[key];
                      newFrontMatter[e.target.value] = value;
                      setLocalFrontMatter(newFrontMatter);
                      onChange(newFrontMatter);
                    }}
                  />
                </div>
                <div className="field-value">
                  {typeof value === 'boolean' ? (
                    <select
                      value={value.toString()}
                      onChange={(e) => handleChange(key, e.target.value === 'true')}
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : typeof value === 'number' ? (
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleChange(key, Number(e.target.value))}
                    />
                  ) : (
                    <input
                      type="text"
                      value={value as string}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  )}
                </div>
                <button
                  className="remove-field"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveField(key);
                  }}
                  title="Remove field"
                >
                  ✕
                </button>
              </div>
            ))}

          <button className="add-field-button" onClick={handleAddField}>
            + Add Field
          </button>
        </div>
      )}
    </div>
  );
};

export default FrontMatterCard;
