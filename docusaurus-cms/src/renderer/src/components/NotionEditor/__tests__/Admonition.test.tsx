import { describe, it, expect, vi } from 'vitest';
import { MarkdownParser } from '../MarkdownParser';
import { MarkdownSerializer } from '../MarkdownSerializer';

describe('Admonition Extension - Real-time Document Rendering', () => {
  // Test parsing of Docusaurus admonitions
  it('correctly parses Docusaurus admonition syntax', () => {
    const markdownWithAdmonition = `
:::note Title
This is a note admonition with a title
:::

:::tip
This is a tip without a title
:::
`;

    const parsedContent = MarkdownParser.parse(markdownWithAdmonition);

    // The structure should contain admonition nodes
    expect(parsedContent).toHaveProperty('type', 'doc');
    expect(parsedContent).toHaveProperty('content');

    // Verify both admonitions were parsed
    if (!parsedContent.content) {
      throw new Error('Parsed content does not contain any nodes');
    }
    const admonitions = parsedContent.content.filter((node: any) => node.type === 'admonition');

    expect(admonitions).toHaveLength(2);

    // Check first admonition properties
    expect(admonitions[0].attrs).toHaveProperty('type', 'note');
    expect(admonitions[0].attrs).toHaveProperty('title', 'Title');

    // Check second admonition properties
    expect(admonitions[1].attrs).toHaveProperty('type', 'tip');
    expect(admonitions[1].attrs).toHaveProperty('title', '');
  });

  // Test serialization of admonition nodes back to markdown
  it('correctly serializes admonition nodes back to markdown', () => {
    const docJSON = {
      type: 'doc',
      content: [
        {
          type: 'admonition',
          attrs: {
            type: 'note',
            title: 'Important',
          },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'This is an important note',
                },
              ],
            },
          ],
        },
      ],
    };

    const serialized = MarkdownSerializer.serialize(docJSON);

    // The serialized content should contain the admonition syntax
    expect(serialized).toContain(':::note Important');
    expect(serialized).toContain('This is an important note');
    expect(serialized).toContain(':::');
  });

  // Test for all admonition types supported by Docusaurus
  it('supports all Docusaurus admonition types', () => {
    const admonitionTypes = ['note', 'tip', 'info', 'caution', 'danger'];

    for (const type of admonitionTypes) {
      const markdown = `
:::${type} Test
Content
:::
`;

      const parsed = MarkdownParser.parse(markdown);
      if (!parsed.content) {
        throw new Error('Parsed content does not contain any nodes');
      }
      const admonitions = parsed.content.filter((node: any) => node.type === 'admonition');

      expect(admonitions.length).toBeGreaterThan(0);
      if (!admonitions[0].attrs) {
        throw new Error('Admonition does not have attributes');
      }
      expect(admonitions[0].attrs.type).toBe(type);
    }
  });

  // Test roundtrip conversion (markdown -> JSON -> markdown)
  it('preserves admonition content in roundtrip conversion', () => {
    const originalMarkdown = `
:::tip My Tip
This is a **formatted** tip with some _styling_
:::
`;

    const parsed = MarkdownParser.parse(originalMarkdown);
    const serialized = MarkdownSerializer.serialize(parsed);

    // The resulting markdown should contain the original content
    expect(serialized).toContain(':::tip My Tip');
    expect(serialized).toContain('This is a **formatted** tip with some _styling_');
    expect(serialized).toContain(':::');
  });
});
