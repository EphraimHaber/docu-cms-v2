import { useEffect, useState } from 'react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import {
  AppShell,
  Text,
  Button,
  Group,
  Stack,
  Title,
  ScrollArea,
  NavLink,
  ActionIcon,
  TextInput,
  Accordion,
  Loader,
  Box,
  Flex,
  Menu,
  rem
} from '@mantine/core'
import pathUtils from '../../utils/path'
import CategoryEditor from '../CategoryEditor'
import CategoryCreator from '../CategoryCreator'
import matter from 'gray-matter'

// Import icons from Tabler
import { IconDots, IconEdit, IconPlus, IconFolder, IconTrash } from '@tabler/icons-react'

interface MainLayoutProps {
  sitePath: string
}

interface DocCategory {
  name: string
  label: string
  description?: string
  position: number
  docs: string[]
}

interface ProjectStructure {
  docs: string[]
  categories: DocCategory[]
  blog: string[]
  config: string[]
}

function MainLayout({ sitePath }: MainLayoutProps): React.JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const [structure, setStructure] = useState<ProjectStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // State for category editor
  const [categoryEditorOpen, setCategoryEditorOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<{
    name: string
    path: string
    data: any
  } | null>(null)

  // State for category creator
  const [categoryCreatorOpen, setCategoryCreatorOpen] = useState(false)

  // Load project structure
  useEffect(() => {
    async function loadStructure() {
      try {
        const projectStructure = await window.api.getProjectStructure()
        setStructure(projectStructure)
      } catch (error) {
        console.error('Failed to load project structure:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStructure()
  }, [sitePath])

  // Sort documents within categories by sidebar_position or filename
  const sortDocumentsInCategory = async (docs: string[]) => {
    const sortedDocs = [...docs]

    // Create a map to store document positions
    const positionMap = new Map<string, number>()

    // Read each document to get its sidebar_position
    for (const doc of docs) {
      try {
        const docContent = await window.api.readFile(doc)
        if (!docContent) {
          console.error(`Failed to read document ${doc}`)
          continue
        }
        const { data } = matter(docContent)

        // Use sidebar_position if available, otherwise use a high number
        const position = data.sidebar_position || data.sidebarPosition || 999
        positionMap.set(doc, position)
      } catch (error) {
        console.error(`Error reading document ${doc}:`, error)
        positionMap.set(doc, 999) // Default to high number if error
      }
    }

    // Sort documents by position, then by filename if positions are equal
    sortedDocs.sort((a, b) => {
      const posA = positionMap.get(a) || 999
      const posB = positionMap.get(b) || 999

      if (posA !== posB) {
        return posA - posB
      }

      // If positions are equal, sort by filename
      return pathUtils.basename(a).localeCompare(pathUtils.basename(b))
    })

    return sortedDocs
  }

  // Filter files by search term
  const getFilteredFiles = (files: string[] = []) => {
    if (!searchTerm) return files
    return files.filter((file) =>
      pathUtils.basename(file).toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Create a new document
  const createNewDocument = async (type: 'docs' | 'blog') => {
    const now = new Date()
    const dateString = now.toISOString().split('T')[0] // YYYY-MM-DD
    const defaultTitle = type === 'docs' ? 'New Document' : 'New Blog Post'

    // Generate a default filename
    let filename = ''
    if (type === 'docs') {
      filename = `new-document-${Date.now()}.md`
      const filePath = pathUtils.join(sitePath, 'docs', filename)

      const created = await window.api.createFile(
        filePath,
        defaultTitle,
        '## New Document\n\nStart writing your document here.',
        {
          title: defaultTitle,
          sidebar_position: 100
        }
      )

      if (created) {
        // Refresh the project structure
        const projectStructure = await window.api.getProjectStructure()
        setStructure(projectStructure)

        // Navigate to the editor
        navigate(`/docs/${encodeURIComponent(filePath)}`)
      }
    } else if (type === 'blog') {
      filename = `${dateString}-new-post.md`
      const filePath = pathUtils.join(sitePath, 'blog', filename)

      const created = await window.api.createFile(
        filePath,
        defaultTitle,
        '## New Blog Post\n\nStart writing your blog post here.',
        {
          title: defaultTitle,
          authors: ['default'],
          tags: ['uncategorized'],
          slug: `new-post-${Date.now()}`
        }
      )

      if (created) {
        // Refresh the project structure
        const projectStructure = await window.api.getProjectStructure()
        setStructure(projectStructure)

        // Navigate to the editor
        navigate(`/blog/${encodeURIComponent(filePath)}`)
      }
    }
  }

  // Create a relative path for display
  const getRelativePath = (fullPath: string) => {
    if (!sitePath) return fullPath

    // Get path relative to site root
    const relativePath = fullPath.replace(sitePath, '')
    return relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
  }

  // Handle file selection to navigate to the appropriate editor
  const handleSelectFile = (filePath: string) => {
    if (filePath.includes('/docs/') || filePath.includes('\\docs\\')) {
      navigate(`/docs/${encodeURIComponent(filePath)}`)
    } else if (filePath.includes('/blog/') || filePath.includes('\\blog\\')) {
      navigate(`/blog/${encodeURIComponent(filePath)}`)
    } else if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
      navigate(`/config/${encodeURIComponent(filePath)}`)
    }
  }

  const getUncategorizedDocs = () => {
    if (!structure) return []
    const categorizedDocs = structure.categories.flatMap((category) => category.docs)
    return structure.docs.filter((doc) => !categorizedDocs.includes(doc))
  }

  // Create a new document in a specific category
  const createNewDocumentInCategory = async (categoryName: string) => {
    const now = new Date()
    const timestamp = Date.now()
    const defaultTitle = 'New Document'

    // Find the category path
    const categoryPath = pathUtils.join(sitePath, 'docs', categoryName)

    // Generate a filename based on the title
    const filename = `new-document-${timestamp}.md`
    const filePath = pathUtils.join(categoryPath, filename)

    const created = await window.api.createFile(
      filePath,
      defaultTitle,
      '## New Document\n\nStart writing your document here.',
      {
        title: defaultTitle,
        sidebar_position: 100
      }
    )

    if (created) {
      // Refresh the project structure
      const projectStructure = await window.api.getProjectStructure()
      setStructure(projectStructure)

      // Navigate to the editor
      navigate(`/docs/${encodeURIComponent(filePath)}`)
    }
  }

  // Handle editing a category
  const handleEditCategory = (category: DocCategory) => {
    const categoryPath = pathUtils.join(sitePath, 'docs', category.name)
    const categoryFile = pathUtils.join(categoryPath, '_category_.json')

    setSelectedCategory({
      name: category.name,
      path: categoryFile,
      data: {
        label: category.label,
        position: category.position,
        link: {
          type: 'generated-index',
          description: category.description || ''
        }
      }
    })

    setCategoryEditorOpen(true)
  }

  // Save category changes
  const handleSaveCategory = async (categoryData: any) => {
    if (!selectedCategory) return

    try {
      // Save the category file
      await window.api.saveFile(selectedCategory.path, '', categoryData)

      // Refresh the structure
      const projectStructure = await window.api.getProjectStructure()
      setStructure(projectStructure)
    } catch (error) {
      console.error('Failed to save category:', error)
    }
  }

  // Handle creating a new category from the modal
  const handleCreateCategory = async (categoryData: { name: string; description: string }) => {
    // Convert to kebab-case and enforce directory naming rules
    const dirName = categoryData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars except whitespace and hyphen
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()

    if (!dirName) {
      // Show error if invalid name
      alert('Please enter a valid category name using letters, numbers, spaces, or hyphens')
      return
    }

    // Find max position from existing categories
    let maxPosition = 0
    if (structure?.categories) {
      structure.categories.forEach((category) => {
        if (category.position > maxPosition) {
          maxPosition = category.position
        }
      })
    }

    const categoryPath = pathUtils.join(sitePath, 'docs', dirName)
    const categoryFile = pathUtils.join(categoryPath, '_category_.json')

    // Create directory if it doesn't exist
    try {
      // Create the category file with proper JSON format
      await window.api.createFile(categoryFile, '', '', {
        label: categoryData.name,
        position: maxPosition + 1,
        link: {
          type: 'generated-index',
          description: categoryData.description || `Documentation for ${categoryData.name}`
        }
      })

      // Create a sample document in the category
      await createNewDocumentInCategory(dirName)

      // Refresh the structure
      const projectStructure = await window.api.getProjectStructure()
      setStructure(projectStructure)
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 300, breakpoint: 'sm' }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md">
          <Title order={3} style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            Docusaurus CMS
          </Title>
          <Text size="sm" c="dimmed" ml="auto">
            Site: {sitePath}
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <TextInput
            placeholder="Search files..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
            mb="md"
          />
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea}>
          {loading ? (
            <Group justify="center" p="xl">
              <Loader />
            </Group>
          ) : structure ? (
            <Accordion defaultValue="documentation">
              <Accordion.Item value="documentation">
                <Box>
                  <Flex justify="space-between" align="center">
                    <Accordion.Control style={{ flex: 1 }}>
                      <Text>Documentation</Text>
                    </Accordion.Control>
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="blue"
                      mx="md"
                      onClick={(e) => {
                        e.stopPropagation()
                        createNewDocument('docs')
                      }}
                      title="Add new document"
                    >
                      <IconPlus size={16} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="green"
                      mr="md"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCategoryCreatorOpen(true)
                      }}
                      title="Add new category"
                    >
                      <IconFolder size={16} />
                    </ActionIcon>
                  </Flex>
                </Box>
                <Accordion.Panel>
                  {/* Display categories with their documents */}
                  {structure.categories && structure.categories.length > 0 ? (
                    <Accordion>
                      {structure.categories.map((category) => (
                        <Accordion.Item key={category.name} value={category.name}>
                          <Box>
                            <Flex justify="space-between" align="center">
                              <Accordion.Control style={{ flex: 1 }}>
                                <Text>{category.label}</Text>
                              </Accordion.Control>
                              <ActionIcon
                                size="sm"
                                variant="light"
                                color="blue"
                                mx="md"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  createNewDocumentInCategory(category.name)
                                }}
                                title="Add document to this category"
                              >
                                <IconPlus size={16} />
                              </ActionIcon>
                              <Menu position="bottom-end" withinPortal>
                                <Menu.Target>
                                  <ActionIcon
                                    size="sm"
                                    variant="light"
                                    mr="md"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <IconDots size={16} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item
                                    leftSection={
                                      <IconEdit style={{ width: rem(14), height: rem(14) }} />
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditCategory(category)
                                    }}
                                  >
                                    Edit Category
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </Flex>
                          </Box>
                          <Accordion.Panel>
                            {category.description && (
                              <Text c="dimmed" size="sm" mb="xs">
                                {category.description}
                              </Text>
                            )}
                            <Stack gap="xs">
                              {getFilteredFiles(category.docs).map((file) => (
                                <NavLink
                                  key={file}
                                  label={pathUtils.basename(file).replace(/\.(md|mdx)$/, '')}
                                  description={getRelativePath(file)}
                                  onClick={() => handleSelectFile(file)}
                                  active={location.pathname === `/docs/${encodeURIComponent(file)}`}
                                />
                              ))}
                              {getFilteredFiles(category.docs).length === 0 && (
                                <Text c="dimmed" size="sm" ta="center">
                                  No documents in this category
                                </Text>
                              )}
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  ) : null}

                  {/* Display docs that are not in any category */}
                  <Stack
                    gap="xs"
                    mt={structure.categories && structure.categories.length > 0 ? 'md' : 0}
                  >
                    <Text weight={500} size="sm" mb="xs" mt="md">
                      Uncategorized Documents
                    </Text>
                    {getFilteredFiles(getUncategorizedDocs()).map((file) => (
                      <NavLink
                        key={file}
                        label={pathUtils.basename(file).replace(/\.(md|mdx)$/, '')}
                        description={getRelativePath(file)}
                        onClick={() => handleSelectFile(file)}
                        active={location.pathname === `/docs/${encodeURIComponent(file)}`}
                      />
                    ))}
                    {getFilteredFiles(getUncategorizedDocs()).length === 0 && (
                      <Text c="dimmed" size="sm" ta="center">
                        No uncategorized documents
                      </Text>
                    )}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="blog">
                <Box>
                  <Flex justify="space-between" align="center">
                    <Accordion.Control style={{ flex: 1 }}>
                      <Text>Blog Posts</Text>
                    </Accordion.Control>
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="blue"
                      mx="md"
                      onClick={() => createNewDocument('blog')}
                    >
                      +
                    </ActionIcon>
                  </Flex>
                </Box>
                <Accordion.Panel>
                  <Stack gap="xs">
                    {getFilteredFiles(structure.blog).map((file) => (
                      <NavLink
                        key={file}
                        label={pathUtils.basename(file)}
                        description={getRelativePath(file)}
                        onClick={() => handleSelectFile(file)}
                        active={location.pathname === `/blog/${encodeURIComponent(file)}`}
                      />
                    ))}
                    {getFilteredFiles(structure.blog).length === 0 && (
                      <Text c="dimmed" size="sm" ta="center">
                        No blog posts found
                      </Text>
                    )}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="configuration">
                <Accordion.Control>
                  <Text>Configuration</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="xs">
                    {getFilteredFiles(structure.config).map((file) => (
                      <NavLink
                        key={file}
                        label={pathUtils.basename(file)}
                        description={getRelativePath(file)}
                        onClick={() => handleSelectFile(file)}
                        active={location.pathname === `/config/${encodeURIComponent(file)}`}
                      />
                    ))}
                    {getFilteredFiles(structure.config).length === 0 && (
                      <Text c="dimmed" size="sm" ta="center">
                        No config files found
                      </Text>
                    )}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          ) : (
            <Text c="dimmed">No project structure found</Text>
          )}
        </AppShell.Section>

        <AppShell.Section>
          <Button fullWidth mt="md" onClick={() => window.location.reload()} variant="light">
            Change Site
          </Button>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      {/* Category Editor Modal */}
      {selectedCategory && (
        <CategoryEditor
          opened={categoryEditorOpen}
          onClose={() => setCategoryEditorOpen(false)}
          onSave={handleSaveCategory}
          category={selectedCategory}
        />
      )}

      {/* Category Creator Modal */}
      <CategoryCreator
        opened={categoryCreatorOpen}
        onClose={() => setCategoryCreatorOpen(false)}
        onSave={handleCreateCategory}
      />
    </AppShell>
  )
}

export default MainLayout
