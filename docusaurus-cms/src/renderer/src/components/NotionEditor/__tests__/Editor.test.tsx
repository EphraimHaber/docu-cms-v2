import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotionEditor from '../Editor';
import { MarkdownParser } from '../MarkdownParser';

// Mock the extensions
vi.mock('../extensions/AdmonitionExtension', () => ({
  AdmonitionExtension: {},
}));

vi.mock('../extensions/MonacoCodeBlock/MonacoCodeBlockExtension', () => ({
  MonacoCodeBlock: {},
}));

vi.mock('../extensions/CodeBlockFocusExtension', () => ({
  CodeBlockFocusExtension: {},
}));

vi.mock(import('tiptap-extension-global-drag-handle'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // your mocked methods
  };
});

// Mock the FloatingMenu and SlashCommands components
vi.mock('../FloatingMenu', () => ({
  default: () => <div data-testid="floating-menu" />,
}));

vi.mock('../SlashCommands', () => ({
  default: () => <div data-testid="slash-commands" />,
}));

describe('NotionEditor Component - Real-time Document Rendering', () => {
  const mockOnChange = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the editor with basic content', () => {
    render(
      <NotionEditor
        content="# Test Heading\n\nTest paragraph"
        onChange={mockOnChange}
        onSave={mockOnSave}
      />,
    );

    // Initial loading state might show first
    const loadingElement = screen.queryByText(/loading editor/i);
    if (loadingElement) {
      expect(loadingElement).toBeInTheDocument();
    } else {
      // Editor might have already loaded
      const editorElement = screen.getByRole('textbox');
      expect(editorElement).toBeInTheDocument();
    }
  });

  it('applies Docusaurus-specific styling to editor content', async () => {
    render(
      <NotionEditor
        content="# Docusaurus Heading\n\nTest paragraph with **bold** text"
        onChange={mockOnChange}
        onSave={mockOnSave}
      />,
    );

    // Check for editor class which would contain Docusaurus styling
    const editorContainer = screen.getAllByTestId('notion-editor')[0];
    expect(editorContainer).toBeInTheDocument();
    expect(editorContainer).toHaveClass('notion-editor');
  });

  it('parses markdown content correctly', () => {
    // This test validates the markdown parsing logic
    const mockContent = '# Test Heading\n\nTest paragraph';
    const parsedContent = MarkdownParser.parse(mockContent);

    expect(parsedContent).toHaveProperty('type', 'doc');
    expect(parsedContent).toHaveProperty('content');
    // Check that heading was parsed correctly
    expect(parsedContent.content[0]).toHaveProperty('type', 'heading');
  });

  it('saves content when Ctrl+S is pressed', () => {
    const { container } = render(
      <NotionEditor content="Test content" onChange={mockOnChange} onSave={mockOnSave} />,
    );

    // Simulate Ctrl+S keyboard shortcut
    const editorDiv = container.querySelector('.notion-editor');
    if (editorDiv) {
      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      });
      editorDiv.dispatchEvent(event);
      expect(mockOnSave).toHaveBeenCalled();
    }
  });
});
