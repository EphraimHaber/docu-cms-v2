import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  AppShell,
  Button,
  Group,
  TextInput,
  Box,
  LoadingOverlay,
  Grid,
  Alert,
  TagsInput,
  Paper
} from '@mantine/core'
import pathUtils from '../utils/path'
import NotionEditor from './NotionEditor/Editor'
import FrontMatterCard from './NotionEditor/FrontMatterCard'

interface DocusaurusContent {
  content: string
  data: {
    title?: string
    authors?: string[] | Record<string, any>
    tags?: string[]
    slug?: string
    [key: string]: any
  }
}

interface BlogEditorProps {
  sitePath: string
}

function BlogEditor({ sitePath }: BlogEditorProps): React.JSX.Element {
  const { filePath } = useParams<{ filePath: string }>()
  const navigate = useNavigate()
  const decodedFilePath = filePath ? decodeURIComponent(filePath) : ''

  const [content, setContent] = useState<DocusaurusContent | null>(null)
  const [editorContent, setEditorContent] = useState('')
  const [frontMatter, setFrontMatter] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load blog post content
  useEffect(() => {
    async function loadContent() {
      if (!decodedFilePath) return

      setLoading(true)
      try {
        const post = await window.api.readFile(decodedFilePath)
        if (post) {
          setContent(post)
          setEditorContent(post.content)
          setFrontMatter(post.data || {})
        }
      } catch (error) {
        console.error('Failed to load blog post:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [decodedFilePath])

  // Handle frontmatter changes
  const handleFrontMatterChange = (newFrontMatter: Record<string, any>) => {
    setFrontMatter(newFrontMatter)
  }

  // Save blog post
  const savePost = async () => {
    if (!decodedFilePath || !content) return

    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const success = await window.api.saveFile(decodedFilePath, editorContent, frontMatter)

      if (success) {
        setSaveSuccess(true)
        // Update local content state
        setContent({
          content: editorContent,
          data: frontMatter
        })

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false)
        }, 3000)
      } else {
        setSaveError('Failed to save blog post')
      }
    } catch (error) {
      console.error('Error saving blog post:', error)
      setSaveError('Error saving blog post')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete blog post
  const deletePost = async () => {
    if (!decodedFilePath) return

    if (confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      try {
        await window.api.deleteFile(decodedFilePath)
        navigate('/')
      } catch (error) {
        console.error('Failed to delete blog post:', error)
      }
    }
  }

  return (
    <AppShell padding="md">
      <LoadingOverlay visible={loading} />

      <AppShell.Header p="md">
        <Group justify="space-between">
          <Button variant="subtle" onClick={() => navigate('/')}>
            &larr; Back to Dashboard
          </Button>

          <Group>
            <Button color="red" variant="light" onClick={deletePost}>
              Delete
            </Button>
            <Button onClick={savePost} loading={isSaving}>
              Save Blog Post
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main pt={60}>
        {!loading && content && (
          <>
            {saveError && (
              <Alert color="red" mb="md" withCloseButton onClose={() => setSaveError(null)}>
                {saveError}
              </Alert>
            )}

            {saveSuccess && (
              <Alert color="green" mb="md" withCloseButton onClose={() => setSaveSuccess(false)}>
                Blog post saved successfully!
              </Alert>
            )}

            <Paper shadow="xs" p="md" mb="md" withBorder>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Title"
                    value={frontMatter.title || ''}
                    onChange={(event) =>
                      handleFrontMatterChange({
                        ...frontMatter,
                        title: event.currentTarget.value
                      })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Slug (URL path)"
                    value={frontMatter.slug || ''}
                    onChange={(event) =>
                      handleFrontMatterChange({
                        ...frontMatter,
                        slug: event.currentTarget.value
                      })
                    }
                    placeholder="my-blog-post"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TagsInput
                    label="Tags"
                    value={frontMatter.tags || []}
                    onChange={(newTags) =>
                      handleFrontMatterChange({
                        ...frontMatter,
                        tags: newTags
                      })
                    }
                    placeholder="Add tag and press Enter"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TagsInput
                    label="Authors"
                    value={frontMatter.authors || []}
                    onChange={(newAuthors) =>
                      handleFrontMatterChange({
                        ...frontMatter,
                        authors: newAuthors
                      })
                    }
                    placeholder="Add author and press Enter"
                  />
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Add FrontMatterCard for additional metadata */}
            <FrontMatterCard frontMatter={frontMatter} onChange={handleFrontMatterChange} />

            <Box h="calc(100vh - 320px)">
              <NotionEditor
                content={editorContent}
                onChange={(newContent) => setEditorContent(newContent)}
                onSave={savePost}
              />
            </Box>
          </>
        )}
      </AppShell.Main>
    </AppShell>
  )
}

export default BlogEditor
