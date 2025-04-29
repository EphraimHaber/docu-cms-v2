import { marked } from 'marked'

// Configure marked options
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
  pedantic: false,
  headerIds: true,
  mangle: false
})

/**
 * Render markdown content to HTML
 * @param markdown Markdown string to render
 * @returns HTML string
 */
export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown)
}

/**
 * Sanitize HTML to prevent XSS attacks
 * This is a simple implementation - in a production app,
 * you should use a dedicated library like DOMPurify
 * @param html HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  // This is a very basic sanitization
  // For production use, use a proper sanitizer library
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/g, '')
}

/**
 * Render and sanitize markdown content
 * @param markdown Markdown string to render
 * @returns Safe HTML string
 */
export function renderMarkdownSafe(markdown: string): string {
  return sanitizeHtml(renderMarkdown(markdown))
}
