import { ElectronAPI } from '@electron-toolkit/preload'

interface DocusaurusContent {
  content: string
  data: {
    title?: string
    sidebar_label?: string
    sidebar_position?: number
    slug?: string
    tags?: string[]
    authors?: string[] | Record<string, any>
    [key: string]: any
  }
}
interface ProjectStructure {
  docs: string[]
  categories: DocCategory[]
  blog: string[]
  config: string[]
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      selectSite: () => Promise<string | null>
      getCurrentSitePath: () => Promise<string | null>
      getProjectStructure: () => Promise<ProjectStructure | null>
      readFile: (filePath: string) => Promise<DocusaurusContent | null>
      saveFile: (
        filePath: string,
        content: string,
        frontmatter: Record<string, any>
      ) => Promise<boolean>
      createFile: (
        filePath: string,
        title: string,
        content?: string,
        frontmatter?: Record<string, any>
      ) => Promise<boolean>
      deleteFile: (filePath: string) => Promise<boolean>
    }
  }
}
