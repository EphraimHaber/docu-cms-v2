import { JSONContent } from '@tiptap/react';

export class MarkdownSerializer {
  static serialize(doc: JSONContent): string {
    let markdown = '';

    if (doc.content) {
      doc.content.forEach((node) => {
        markdown += this.serializeNode(node) + '\n\n';
      });
    }

    return markdown.trim();
  }

  static serializeNode(node: JSONContent): string {
    switch (node.type) {
      case 'heading':
        return '#'.repeat(node.attrs?.level || 1) + ' ' + this.serializeContent(node.content);

      case 'paragraph':
        return this.serializeContent(node.content);

      case 'bulletList':
        return this.serializeList(node.content, '-');

      case 'orderedList':
        return this.serializeList(node.content, '1.');

      case 'listItem':
        return this.serializeContent(node.content);

      case 'codeBlock':
        const language = node.attrs?.language || '';
        const title = node.attrs?.title || '';
        let codeMarkdown = '```' + language;

        // Add title using Docusaurus syntax if provided
        if (title) {
          codeMarkdown += ' title="' + title + '"';
        }

        codeMarkdown += '\n' + this.serializeContent(node.content) + '\n```';
        return codeMarkdown;

      case 'blockquote':
        return '> ' + this.serializeContent(node.content);

      case 'admonition':
        const type = node.attrs?.type || 'note';
        const titleAdmonition = node.attrs?.title || '';
        const titleStr = titleAdmonition ? ` ${titleAdmonition}` : '';
        return `:::${type}${titleStr}\n\n${this.serializeContent(node.content)}\n\n:::`;

      default:
        return this.serializeContent(node.content);
    }
  }

  static serializeList(
    items: JSONContent[] | undefined,
    marker: string,
    indent: number = 0,
    startNumber: number = 1,
  ): string {
    if (!items) return '';

    return items
      .map((item, index) => {
        if (!item.content) return '';

        let result = '';
        const indentation = ' '.repeat(indent);
        let mainContent = '';
        let nestedLists = '';

        // Process the content of the list item
        for (const node of item.content) {
          if (node.type === 'bulletList' || node.type === 'orderedList') {
            // Calculate nested indentation based on parent and current list type
            let nestedIndent = indent;

            if (node.type === 'bulletList' && marker === '1.') {
              // If we're adding a bullet list under an ordered list item
              nestedIndent = indent + 2;
            } else if (node.type === 'orderedList' && marker === '-') {
              // If we're adding an ordered list under a bullet list item
              nestedIndent = indent + 2;
            } else {
              // For other nested lists, increment by 2
              nestedIndent = indent + 2;
            }

            const nextMarker = node.type === 'bulletList' ? '-' : '1.';
            nestedLists += '\n' + this.serializeList(node.content, nextMarker, nestedIndent, 1);
          } else {
            mainContent += this.serializeContent([node]);
          }
        }

        // Determine the actual marker for this item
        let actualMarker = marker;
        if (marker === '1.') {
          actualMarker = `${index + startNumber}.`;
        }

        // Construct the list item with proper indentation
        result = `${indentation}${actualMarker} ${mainContent.trim()}`;
        if (nestedLists) {
          result += nestedLists;
        }

        return result;
      })
      .join('\n');
  }

  static serializeContent(content: JSONContent[] | undefined): string {
    if (!content) return '';

    return content
      .map((node) => {
        if (node.type === 'text') {
          let text = node.text || '';

          // Apply marks
          if (node.marks) {
            for (const mark of node.marks) {
              switch (mark.type) {
                case 'bold':
                  text = `**${text}**`;
                  break;
                case 'italic':
                  text = `_${text}_`;
                  break;
                case 'code':
                  text = `\`${text}\``;
                  break;
                case 'link':
                  text = `[${text}](${mark.attrs?.href || ''})`;
                  break;
                case 'highlight':
                  text = `==${text}==`;
                  break;
                case 'strike':
                  text = `~~${text}~~`;
                  break;
              }
            }
          }

          return text;
        }

        return this.serializeNode(node);
      })
      .join('');
  }
}
