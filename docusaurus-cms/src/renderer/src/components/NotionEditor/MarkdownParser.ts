import { JSONContent } from '@tiptap/react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';

export class MarkdownParser {
  /**
   * Convert markdown string to TipTap-compatible JSON structure
   */
  static parse(markdown: string): JSONContent {
    // Handle empty content case
    if (!markdown || markdown.trim() === '') {
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: ' ' }], // Add a space to avoid empty text node error
          },
        ],
      };
    }

    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(() => (tree) => {
        // Process admonitions before other transformations
        this.processAdmonitions(tree);
      });

    const ast = processor.parse(markdown);
    processor.runSync(ast);

    return this.transformNode(ast);
  }

  /**
   * Process Docusaurus-style admonitions in the markdown AST
   * Converts :::note, :::tip, etc. to special nodes
   */
  private static processAdmonitions(tree: any): void {
    const admonitionRegex = /^:::(\w+)(?:\s+(.+?))?\s*$/;
    const closingRegex = /^:::\s*$/;

    const splitInlineAdmonitions = (nodes: any[]): any[] => {
      const newNodes: any[] = [];

      for (const node of nodes) {
        if (
          node.type === 'paragraph' &&
          node.children?.length === 1 &&
          node.children[0].type === 'text'
        ) {
          const lines = node.children[0].value.split('\n');
          for (const line of lines) {
            newNodes.push({
              type: 'paragraph',
              children: [{ type: 'text', value: line }],
            });
          }
        } else {
          newNodes.push(node);
        }
      }

      return newNodes;
    };

    const transformAdmonitions = (nodes: any[]): any[] => {
      const result: any[] = [];
      let i = 0;

      while (i < nodes.length) {
        const node = nodes[i];
        const text = node.children?.[0]?.value;

        const match = text?.match(admonitionRegex);
        if (node.type === 'paragraph' && match) {
          const type = match[1];
          const title = match[2] || '';
          const content: any[] = [];

          let j = i + 1;
          while (j < nodes.length) {
            const endText = nodes[j].children?.[0]?.value;
            if (nodes[j].type === 'paragraph' && closingRegex.test(endText)) {
              break;
            }
            content.push(nodes[j]);
            j++;
          }

          // Push admonition node if closing ::: was found
          if (j < nodes.length) {
            result.push({
              type: 'admonition',
              data: { type, title },
              children: content,
            });
            i = j + 1;
            continue;
          }
        }

        // Not an admonition — copy as-is
        result.push(node);
        i++;
      }

      return result;
    };

    // Step 1: Split paragraphs that contain multiple lines
    const flat = splitInlineAdmonitions(tree.children);

    // Step 2: Transform any admonitions
    tree.children = transformAdmonitions(flat);
  }

  /**
   * Transform a markdown AST node to TipTap JSON
   */
  private static transformNode(node: any): JSONContent {
    if (!node) return {};

    // Handle different node types
    switch (node.type) {
      case 'root':
        const rootContent = this.transformChildren(node);
        // Ensure root node always has content
        if (!rootContent.length) {
          return {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: ' ' }],
              },
            ],
          };
        }
        return {
          type: 'doc',
          content: rootContent,
        };

      case 'paragraph':
        const paraContent = this.transformChildren(node);
        // Ensure paragraph has content to avoid empty text node errors
        if (!paraContent.length) {
          return {
            type: 'paragraph',
            content: [{ type: 'text', text: ' ' }],
          };
        }
        return {
          type: 'paragraph',
          content: paraContent,
        };

      case 'heading':
        const headingContent = this.transformChildren(node);
        // Ensure heading always has content
        if (!headingContent.length) {
          return {
            type: 'heading',
            attrs: { level: node.depth },
            content: [{ type: 'text', text: ' ' }],
          };
        }
        return {
          type: 'heading',
          attrs: { level: node.depth },
          content: headingContent,
        };

      case 'list':
        return {
          type: node.ordered ? 'orderedList' : 'bulletList',
          content: this.transformChildren(node),
        };

      case 'listItem':
        return {
          type: 'listItem',
          content: this.transformChildren(node),
        };

      case 'code':
        // Parse code block with title if present
        let language = node.lang || '';
        let title = '';

        // Check if language contains title metadata
        if (language && language.includes('title=')) {
          const titleMatch = language.match(/title="([^"]+)"/);
          if (titleMatch && titleMatch[1]) {
            title = titleMatch[1];
            // Remove title from language string
            language = language.replace(/\s*title="[^"]+"/, '').trim();
          }
        }

        // Ensure code block always has non-empty content
        const codeValue = node.value || ' ';

        return {
          type: 'codeBlock',
          attrs: {
            language: language,
            title: title,
          },
          content: [{ type: 'text', text: codeValue }],
        };

      case 'blockquote':
        return {
          type: 'blockquote',
          content: this.transformChildren(node),
        };

      case 'admonition':
        return {
          type: 'admonition',
          attrs: {
            type: node.data.type,
            title: node.data.title,
          },
          content: this.transformChildren(node),
        };

      case 'text':
        return {
          type: 'text',
          text: node.value || '',
          ...this.processMarks(node),
        };

      case 'link':
        const linkContent = this.transformChildren(node);
        return {
          type: 'text',
          text: linkContent.map((c: any) => c.text || '').join(''),
          marks: [
            {
              type: 'link',
              attrs: { href: node.url || '' },
            },
          ],
        };

      case 'image':
        return {
          type: 'image',
          attrs: {
            src: node.url || '',
            alt: node.alt || '',
            title: node.title || '',
          },
        };

      case 'thematicBreak':
        return {
          type: 'horizontalRule',
        };

      case 'html':
        // Handle HTML nodes (might need special handling)
        return {
          type: 'paragraph',
          content: [{ type: 'text', text: node.value || '' }],
        };

      case 'emphasis':
        const italicContent = this.transformChildren(node);
        return {
          type: 'text',
          text: italicContent.map((c: any) => c.text || '').join(''),
          marks: [{ type: 'italic' }],
        };

      case 'strong':
        const boldContent = this.transformChildren(node);
        return {
          type: 'text',
          text: boldContent.map((c: any) => c.text || '').join(''),
          marks: [{ type: 'bold' }],
        };

      case 'inlineCode':
        return {
          type: 'text',
          text: node.value || '',
          marks: [{ type: 'code' }],
        };

      case 'delete':
        const strikeContent = this.transformChildren(node);
        return {
          type: 'text',
          text: strikeContent.map((c: any) => c.text || '').join(''),
          marks: [{ type: 'strike' }],
        };

      default:
        // For any other nodes, try to transform children
        if (node.children) {
          return {
            type: 'paragraph',
            content: this.transformChildren(node),
          };
        }

        // If all else fails, treat as text
        return {
          type: 'text',
          text: node.value || '',
        };
    }
  }

  /**
   * Transform markdown AST children to TipTap JSON
   */
  private static transformChildren(node: any): any[] {
    if (!node.children || !node.children.length) {
      return [];
    }

    return node.children
      .map((child: any) => this.transformNode(child))
      .filter((child: any) => Object.keys(child).length > 0);
  }

  /**
   * Process text node marks like bold, italic, etc.
   */
  private static processMarks(node: any) {
    if (!node._marks) {
      return {};
    }

    const marks = node._marks
      .map((mark: any) => {
        switch (mark.type) {
          case 'emphasis':
            return { type: 'italic' };
          case 'strong':
            return { type: 'bold' };
          case 'code':
            return { type: 'code' };
          case 'delete':
            return { type: 'strike' };
          case 'link':
            return { type: 'link', attrs: { href: mark.url || '' } };
          default:
            return null;
        }
      })
      .filter(Boolean);

    return marks.length ? { marks } : {};
  }
}
