import { describe, it, expect } from 'vitest';
import { MarkdownParser } from '../MarkdownParser';
import { MarkdownSerializer } from '../MarkdownSerializer';

describe('List Handling Tests', () => {
  it('correctly parses and serializes nested unordered lists', () => {
    const markdownWithNestedList = `- First level item 1
  - Second level item 1
  - Second level item 2
    - Third level item 1
    - Third level item 2
- First level item 2
  - Second level item 3
    - Third level item 3`;

    const parsed = MarkdownParser.parse(markdownWithNestedList);
    const serialized = MarkdownSerializer.serialize(parsed);

    // Verify the structure
    expect(parsed).toHaveProperty('type', 'doc');
    expect(parsed.content).toBeDefined();

    // Find the top-level bullet list
    const bulletList = parsed.content?.find((node) => node.type === 'bulletList');
    expect(bulletList).toBeDefined();
    expect(bulletList?.content).toHaveLength(2); // Two top-level items

    // The serialized content should match the original structure, ignoring extra whitespace
    const normalizedOriginal = markdownWithNestedList
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n');
    const normalizedSerialized = serialized
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n');

    expect(normalizedSerialized).toBe(normalizedOriginal);
  });
  it('maintains proper indentation in nested lists', () => {
    const markdown = `- Level 1
  - Level 2
    - Level 3
  - Back to Level 2
- Back to Level 1`;

    const parsed = MarkdownParser.parse(markdown);
    const serialized = MarkdownSerializer.serialize(parsed);

    // Check that the serialized output maintains proper indentation
    const lines = serialized.split('\n').map((line) => line.trimEnd());
    expect(lines[0]).toBe('- Level 1');
    expect(lines[1]).toBe('  - Level 2');
    expect(lines[2]).toBe('    - Level 3');
    expect(lines[3]).toBe('  - Back to Level 2');
    expect(lines[4]).toBe('- Back to Level 1');
  });
  it('handles mixed nested lists (ordered and unordered)', () => {
    const markdown = `- Unordered 1
  1. Ordered 1.1
  2. Ordered 1.2
  - Unordered 1.2.1
  - Unordered 1.2.2
- Unordered 2
  - Unordered 2.1
    1. Ordered 2.1.1`;

    const parsed = MarkdownParser.parse(markdown);
    const serialized = MarkdownSerializer.serialize(parsed);

    // Compare line by line for better error reporting
    const originalLines = markdown.split('\n').map((line) => line.trimEnd());
    const serializedLines = serialized.split('\n').map((line) => line.trimEnd());

    expect(serializedLines.length).toBe(originalLines.length);
    originalLines.forEach((line, index) => {
      expect(serializedLines[index], `Line ${index + 1} differs:`).toBe(line);
    });
  });
});
