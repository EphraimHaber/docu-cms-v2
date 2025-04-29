import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Types for Docusaurus content
export interface DocusaurusContent {
  content: string;
  data: {
    title?: string;
    sidebar_label?: string;
    sidebar_position?: number;
    slug?: string;
    tags?: string[];
    authors?: string[] | Record<string, any>;
    [key: string]: any;
  };
}

// Get all files recursively from a directory
export async function getFilesRecursively(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFilesRecursively(res) : res;
    })
  );
  return files.flat();
}

// Read a Markdown or MDX file and parse frontmatter
export async function readDocusaurusFile(filePath: string): Promise<DocusaurusContent> {
  const content = await fs.readFile(filePath, 'utf8');
  const { data, content: markdownContent } = matter(content);
  
  return {
    content: markdownContent,
    data
  };
}

// Save a Markdown or MDX file with frontmatter
export async function saveDocusaurusFile(
  filePath: string, 
  content: string, 
  frontmatter: Record<string, any>
): Promise<void> {
  const fileContent = matter.stringify(content, frontmatter);
  await fs.writeFile(filePath, fileContent, 'utf8');
}

// Get docusaurus project structure
export async function getProjectStructure(rootDir: string) {
  const structure = {
    docs: [] as string[],
    blog: [] as string[],
    config: [] as string[]
  };
  
  // Get docs
  try {
    const docsDir = path.join(rootDir, 'docs');
    const docFiles = await getFilesRecursively(docsDir);
    structure.docs = docFiles.filter(file => file.endsWith('.md') || file.endsWith('.mdx'));
  } catch (e) {
    console.error('Error reading docs directory:', e);
  }
  
  // Get blog posts
  try {
    const blogDir = path.join(rootDir, 'blog');
    const blogFiles = await getFilesRecursively(blogDir);
    structure.blog = blogFiles.filter(file => file.endsWith('.md') || file.endsWith('.mdx'));
  } catch (e) {
    console.error('Error reading blog directory:', e);
  }
  
  // Get config files
  try {
    const configFiles = [
      path.join(rootDir, 'docusaurus.config.ts'),
      path.join(rootDir, 'docusaurus.config.js'),
      path.join(rootDir, 'sidebars.ts'),
      path.join(rootDir, 'sidebars.js')
    ];
    
    for (const file of configFiles) {
      try {
        await fs.access(file);
        structure.config.push(file);
      } catch {
        // File doesn't exist, skip
      }
    }
  } catch (e) {
    console.error('Error getting config files:', e);
  }
  
  return structure;
}

// Create a new Markdown file
export async function createNewFile(
  filePath: string,
  title: string,
  content: string = '',
  frontmatter: Record<string, any> = {}
): Promise<void> {
  // Ensure directory exists
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  
  // Create frontmatter with title
  const defaultFrontmatter = { 
    title,
    ...frontmatter
  };
  
  // Save the file
  await saveDocusaurusFile(filePath, content, defaultFrontmatter);
}

// Delete a file
export async function deleteFile(filePath: string): Promise<void> {
  await fs.unlink(filePath);
}