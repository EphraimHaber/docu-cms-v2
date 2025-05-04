import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkdownParser } from '../MarkdownParser';
import { MarkdownSerializer } from '../MarkdownSerializer';

// Remove the direct import of monaco-editor
// vi.mock must come before any imports

// Fix monaco-editor mock
vi.mock('monaco-editor', () => {
  return {
    // Monaco exports need both default and named exports
    default: {
      KeyCode: {
        DownArrow: 40,
      },
      editor: {
        create: vi.fn(),
        createModel: vi.fn(),
      },
      languages: {
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
      },
    },
    // Named exports
    KeyCode: {
      DownArrow: 40,
    },
    editor: {
      create: vi.fn(),
      createModel: vi.fn(),
    },
    languages: {
      register: vi.fn(),
      setMonarchTokensProvider: vi.fn(),
    },
  };
});

describe('Code Block Rendering Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('correctly parses markdown code blocks', () => {
    const markdownWithCodeBlock = `
\`\`\`javascript
function hello() {
  console.log('Hello world!');
}
\`\`\`
`;

    const parsedContent = MarkdownParser.parse(markdownWithCodeBlock);

    // The structure should contain a code block node

    expect(parsedContent).toHaveProperty('type', 'doc');
    expect(parsedContent).toHaveProperty('content');

    // Find the code block
    expect(parsedContent.content).toBeDefined();
    if (!parsedContent.content) {
      throw new Error('Parsed content does not contain any nodes');
    }
    const codeBlocks = parsedContent.content.filter((node: any) => node.type === 'codeBlock');

    expect(codeBlocks).toHaveLength(1);
    expect(codeBlocks[0]).toHaveProperty('attrs.language', 'javascript');
    expect(codeBlocks[0]).toHaveProperty('content');
    if (!codeBlocks[0].content) {
      throw new Error('Code block does not contain any content');
    }
    expect(codeBlocks[0].content[0].text).toContain('function hello()');
  });

  it('correctly serializes code blocks back to markdown', () => {
    const docJSON = {
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          attrs: {
            language: 'typescript',
          },
          content: [
            {
              type: 'text',
              text: 'const x: number = 42;\nconsole.log(x);',
            },
          ],
        },
      ],
    };

    const serialized = MarkdownSerializer.serialize(docJSON);

    // The serialized content should contain the code block
    expect(serialized).toContain('```typescript');
    expect(serialized).toContain('const x: number = 42;');
    expect(serialized).toContain('console.log(x);');
    expect(serialized).toContain('```');
  });

  it('preserves language specification in roundtrip conversion', () => {
    const supportedLanguages = [
      'javascript',
      'typescript',
      'python',
      'java',
      'csharp',
      'html',
      'css',
      'json',
    ];

    for (const language of supportedLanguages) {
      const markdown = `
\`\`\`${language}
// Code in ${language}
\`\`\`
`;

      const parsed = MarkdownParser.parse(markdown);
      const serialized = MarkdownSerializer.serialize(parsed);

      expect(serialized).toContain(`\`\`\`${language}`);
    }
  });

  it('handles code blocks with no language specified', () => {
    const markdown = `
\`\`\`
// Code with no language
\`\`\`
`;

    const parsed = MarkdownParser.parse(markdown);
    if (!parsed.content) {
      throw new Error('Parsed content does not contain any nodes');
    }
    const codeBlocks = parsed.content.filter((node: any) => node.type === 'codeBlock');

    // Default language handling varies by implementation
    expect(codeBlocks).toHaveLength(1);

    // Verify serialization works
    const serialized = MarkdownSerializer.serialize(parsed);
    expect(serialized).toContain('```');
    expect(serialized).toContain('// Code with no language');
  });

  it('preserves multiple code blocks in a document', () => {
    const markdownWithMultipleBlocks = `
# Document with code blocks

\`\`\`javascript
// JavaScript code
\`\`\`

Some text in between.

\`\`\`css
/* CSS code */
\`\`\`
`;

    const parsed = MarkdownParser.parse(markdownWithMultipleBlocks);
    if (!parsed.content) {
      throw new Error('Parsed content does not contain any nodes');
    }
    const codeBlocks = parsed.content.filter((node: any) => node.type === 'codeBlock');

    expect(codeBlocks).toHaveLength(2);
    if (!codeBlocks[0].attrs) {
      throw new Error('Code block does not have attributes');
    }
    if (!codeBlocks[1].attrs) {
      throw new Error('Code block does not have attributes');
    }
    expect(codeBlocks[0].attrs.language).toBe('javascript');
    expect(codeBlocks[1].attrs.language).toBe('css');

    // Check serialization
    const serialized = MarkdownSerializer.serialize(parsed);
    expect(serialized).toContain('```javascript');
    expect(serialized).toContain('```css');
  });
});
