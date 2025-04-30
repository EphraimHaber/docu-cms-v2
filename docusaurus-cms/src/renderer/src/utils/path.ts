/**
 * Browser-compatible path utility functions.
 * These replicate the Node.js path module functionality we need.
 */

/**
 * Extract the file name from a path
 * @param filePath The full path
 * @returns The file name with extension
 */
export function basename(filePath: string): string {
  // Handle both forward and backslashes
  const normalizedPath = filePath.replace(/\\/g, '/')
  // Get the part after the last slash
  const parts = normalizedPath.split('/')
  return parts[parts.length - 1] || ''
}

/**
 * Join path segments
 * @param segments Path segments to join
 * @returns Joined path
 */
export function join(...segments: string[]): string {
  // Remove empty segments
  const filteredSegments = segments.filter((segment) => segment !== '')

  // Handle root path specially
  let result = ''
  if (segments[0] && (segments[0].startsWith('/') || segments[0].match(/^[A-Za-z]:\\/))) {
    result = segments[0]
    filteredSegments.shift()
  }

  // Join remaining segments
  for (const segment of filteredSegments) {
    const cleanSegment = segment.replace(/^\/+|\/+$/g, '')
    if (result && !result.endsWith('/') && !result.endsWith('\\')) {
      result += '/'
    }
    result += cleanSegment
  }

  return result
}

/**
 * Get the directory name of a path
 * @param filePath The full path
 * @returns The directory part
 */
export function dirname(filePath: string): string {
  // Handle both forward and backslashes
  const normalizedPath = filePath.replace(/\\/g, '/')
  // Get everything before the last slash
  const lastSlashIndex = normalizedPath.lastIndexOf('/')
  if (lastSlashIndex === -1) return '.'

  // Handle root directory
  if (lastSlashIndex === 0) return '/'

  // Return the directory part
  return normalizedPath.slice(0, lastSlashIndex)
}

export default {
  basename,
  join,
  dirname
}
