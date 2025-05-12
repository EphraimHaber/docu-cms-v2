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
        return this.serializeList(node.content, '*');

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

  static serializeList(items: JSONContent[] | undefined, marker: string): string {
    if (!items) return '';

    return items
      .map((item) => {
        const content = this.serializeContent(item.content);
        return `${marker} ${content}`;
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
