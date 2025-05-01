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

export interface DocCategory {
  name: string;
  label: string;
  description: string;
  position: number;
  docs: string[];
}

export interface ProjectStructure {
  docs: string[];
  categories: DocCategory[];
  blog: string[];
  config: string[];
}

// Get all files recursively from a directory
export async function getFilesRecursively(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFilesRecursively(res) : res;
    }),
  );
  return files.flat();
}

// Read a Markdown or MDX file and parse frontmatter
export async function readDocusaurusFile(filePath: string): Promise<DocusaurusContent> {
  const content = await fs.readFile(filePath, 'utf8');
  const { data, content: markdownContent } = matter(content);

  return {
    content: markdownContent,
    data,
  };
}

// Save a file - handles different formats based on extension
export async function saveDocusaurusFile(
  filePath: string,
  content: string,
  frontmatter: Record<string, any>,
): Promise<void> {
  // Handle JSON files differently than markdown
  if (filePath.endsWith('.json')) {
    // For JSON files, just stringify the data object
    await fs.writeFile(filePath, JSON.stringify(frontmatter, null, 2), 'utf8');
  } else {
    // For markdown files, use gray-matter to format with frontmatter
    const fileContent = matter.stringify(content, frontmatter);
    await fs.writeFile(filePath, fileContent, 'utf8');
  }
}

// Get docusaurus project structure
export async function getProjectStructure(rootDir: string): Promise<ProjectStructure> {
  const structure: ProjectStructure = {
    docs: [] as string[],
    categories: [] as DocCategory[],
    blog: [] as string[],
    config: [] as string[],
  };

  // Get docs
  try {
    const docsDir = path.join(rootDir, 'docs');
    const docFiles = await getFilesRecursively(docsDir);
    structure.docs = docFiles.filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));

    // Scan for category files
    const categoryFiles = docFiles.filter((file) => path.basename(file) === '_category_.json');

    // Process each category file
    for (const categoryFile of categoryFiles) {
      try {
        const categoryContent = await fs.readFile(categoryFile, 'utf8');
        const categoryData = JSON.parse(categoryContent);

        // Extract category folder name
        const categoryFolder = path.dirname(categoryFile);
        const categoryName = path.basename(categoryFolder);

        // Find all docs in this category directory
        const categoryDocs = structure.docs.filter(
          (doc) =>
            doc.startsWith(categoryFolder) &&
            path.basename(doc) !== '_category_.json' &&
            !doc.includes('/_category_.json'),
        );

        structure.categories.push({
          name: categoryName,
          label: categoryData.label || categoryName,
          description: categoryData.link?.description || '',
          position: categoryData.position || 999,
          docs: categoryDocs,
        });
      } catch (err) {
        console.error(`Error parsing category file ${categoryFile}:`, err);
      }
    }

    // Sort categories by position
    structure.categories.sort((a, b) => a.position - b.position);
  } catch (e) {
    console.error('Error reading docs directory:', e);
  }

  // Get blog posts
  try {
    const blogDir = path.join(rootDir, 'blog');
    const blogFiles = await getFilesRecursively(blogDir);
    structure.blog = blogFiles.filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));
  } catch (e) {
    console.error('Error reading blog directory:', e);
  }

  // Get config files
  try {
    const configFiles = [
      path.join(rootDir, 'docusaurus.config.ts'),
      path.join(rootDir, 'docusaurus.config.js'),
      path.join(rootDir, 'sidebars.ts'),
      path.join(rootDir, 'sidebars.js'),
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
  frontmatter: Record<string, any> = {},
): Promise<void> {
  // Ensure directory exists
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  // Create frontmatter with title
  const defaultFrontmatter = {
    title,
    ...frontmatter,
  };

  // Save the file
  await saveDocusaurusFile(filePath, content, defaultFrontmatter);
}

// Delete a file
export async function deleteFile(filePath: string): Promise<void> {
  await fs.unlink(filePath);
}
