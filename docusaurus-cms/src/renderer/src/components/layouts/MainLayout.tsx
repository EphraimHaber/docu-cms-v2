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
  Flex
} from '@mantine/core'
import pathUtils from '../../utils/path'

interface MainLayoutProps {
  sitePath: string
}

interface ProjectStructure {
  docs: string[]
  blog: string[]
  config: string[]
}

function MainLayout({ sitePath }: MainLayoutProps): React.JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const [structure, setStructure] = useState<ProjectStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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
                      onClick={() => createNewDocument('docs')}
                    >
                      +
                    </ActionIcon>
                  </Flex>
                </Box>
                <Accordion.Panel>
                  <Stack gap="xs">
                    {getFilteredFiles(structure.docs).map((file) => (
                      <NavLink
                        key={file}
                        label={pathUtils.basename(file)}
                        description={getRelativePath(file)}
                        onClick={() => handleSelectFile(file)}
                        active={location.pathname === `/docs/${encodeURIComponent(file)}`}
                      />
                    ))}
                    {getFilteredFiles(structure.docs).length === 0 && (
                      <Text c="dimmed" size="sm" ta="center">
                        No documents found
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
    </AppShell>
  )
}

export default MainLayout
