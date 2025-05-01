import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stack, Title, Text, Group, Button } from '@mantine/core'
import pathUtils from '../utils/path'

interface DashboardProps {
  sitePath: string
}

function Dashboard({ sitePath }: DashboardProps): React.JSX.Element {
  const navigate = useNavigate()

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
        // Navigate to the editor
        navigate(`/blog/${encodeURIComponent(filePath)}`)
      }
    }
  }

  return (
    <Stack align="center" justify="center" h="100%">
      <Title order={2}>Welcome to Docusaurus CMS</Title>
      <Text size="lg">
        Select a file from the sidebar to start editing, or create a new document.
      </Text>
      <Group>
        <Button onClick={() => createNewDocument('docs')}>Create Document</Button>
        <Button onClick={() => createNewDocument('blog')} variant="light">
          Create Blog Post
        </Button>
      </Group>
    </Stack>
  )
}

export default Dashboard
