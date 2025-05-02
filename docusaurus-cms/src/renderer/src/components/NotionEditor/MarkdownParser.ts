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
  private static processAdmonitions(tree: any) {
    const admonitionRegex = /^:::(\w+)(?:\s+(.+?))?\s*$/;
    const closingRegex = /^:::$/;

    const transformAdmonitions = (nodes: any[], startIndex: number, parentNode: any) => {
      for (let i = startIndex; i < nodes.length; i++) {
        const node = nodes[i];

        if (
          node.type === 'paragraph' &&
          node.children &&
          node.children[0] &&
          node.children[0].type === 'text'
        ) {
          const match = node.children[0].value.match(admonitionRegex);
          if (match) {
            const type = match[1];
            const title = match[2] || '';

            // Look for closing tag
            let endIndex = -1;
            const content: any[] = [];

            for (let j = i + 1; j < nodes.length; j++) {
              const nextNode = nodes[j];
              if (
                nextNode.type === 'paragraph' &&
                nextNode.children &&
                nextNode.children[0] &&
                nextNode.children[0].type === 'text' &&
                nextNode.children[0].value.match(closingRegex)
              ) {
                endIndex = j;
                break;
              } else {
                content.push(nextNode);
              }
            }

            if (endIndex !== -1) {
              // Create admonition node
              const admonitionNode = {
                type: 'admonition',
                data: {
                  type,
                  title,
                },
                children: content,
              };

              // Replace old nodes with admonition
              nodes.splice(i, endIndex - i + 1, admonitionNode);
              return i;
            }
          }
        }
      }

      return nodes.length;
    };

    // Process admonitions at root level
    if (tree.children && tree.children.length) {
      let i = 0;
      while (i < tree.children.length) {
        i = transformAdmonitions(tree.children, i, tree);
        i++;
      }
    }
  }

  /**
   * Transform a markdown AST node to TipTap JSON
   */
  private static transformNode(node: any): JSONContent {
    if (!node) return {};

    // Handle different node types
    switch (node.type) {
      case 'root':
        return {
          type: 'doc',
          content: this.transformChildren(node),
        };

      case 'paragraph':
        return {
          type: 'paragraph',
          content: this.transformChildren(node),
        };

      case 'heading':
        return {
          type: 'heading',
          attrs: { level: node.depth },
          content: this.transformChildren(node),
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
        return {
          type: 'codeBlock',
          attrs: { language: node.lang || '' },
          content: [{ type: 'text', text: node.value || '' }],
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
