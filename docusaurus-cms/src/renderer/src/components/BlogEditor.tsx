import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  AppShell,
  Button,
  Group,
  TextInput,
  Box,
  Tabs,
  LoadingOverlay,
  Grid,
  Alert,
  TagsInput
} from '@mantine/core'
import { Editor } from '@monaco-editor/react'
import pathUtils from '../utils/path'
import { renderMarkdownSafe } from '../utils/markdown'

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
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [authors, setAuthors] = useState<string[]>([])

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
          setTitle(post.data.title || '')
          setSlug(post.data.slug || '')

          // Handle tags
          const postTags = post.data.tags || []
          setTags(Array.isArray(postTags) ? postTags : [])

          // Handle authors
          const postAuthors = post.data.authors || []
          if (Array.isArray(postAuthors)) {
            setAuthors(postAuthors)
          } else if (typeof postAuthors === 'object') {
            setAuthors(Object.keys(postAuthors))
          }
        }
      } catch (error) {
        console.error('Failed to load blog post:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [decodedFilePath])

  // Save blog post
  const savePost = async () => {
    if (!decodedFilePath || !content) return

    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      // Prepare frontmatter
      const frontmatter = {
        ...content.data,
        title,
        tags,
        authors
      }

      if (slug) {
        frontmatter.slug = slug
      }

      const success = await window.api.saveFile(decodedFilePath, editorContent, frontmatter)

      if (success) {
        setSaveSuccess(true)
        // Update local content state
        setContent({
          content: editorContent,
          data: frontmatter
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

            <Grid mb="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Title"
                  value={title}
                  onChange={(event) => setTitle(event.currentTarget.value)}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Slug (URL path)"
                  value={slug}
                  onChange={(event) => setSlug(event.currentTarget.value)}
                  placeholder="my-blog-post"
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TagsInput
                  label="Tags"
                  value={tags}
                  onChange={setTags}
                  placeholder="Add tag and press Enter"
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TagsInput
                  label="Authors"
                  value={authors}
                  onChange={setAuthors}
                  placeholder="Add author and press Enter"
                />
              </Grid.Col>
            </Grid>

            <Tabs defaultValue="editor">
              <Tabs.List>
                <Tabs.Tab value="editor">Markdown Editor</Tabs.Tab>
                <Tabs.Tab value="preview">Preview</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="editor" pt="xs">
                <Box h="70vh">
                  <Editor
                    height="100%"
                    language="markdown"
                    value={editorContent}
                    onChange={(value) => setEditorContent(value || '')}
                    options={{
                      wordWrap: 'on',
                      minimap: { enabled: false }
                    }}
                  />
                </Box>
              </Tabs.Panel>

              <Tabs.Panel value="preview" pt="xs">
                <Box h="70vh" style={{ overflow: 'auto' }} className="preview-container">
                  <div
                    className="markdown-content"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownSafe(editorContent) }}
                  />
                </Box>
              </Tabs.Panel>
            </Tabs>
          </>
        )}
      </AppShell.Main>
    </AppShell>
  )
}

export default BlogEditor
