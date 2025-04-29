import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  AppShell,
  Button,
  Group,
  Stack,
  Title,
  TextInput,
  NumberInput,
  Box,
  Tabs,
  LoadingOverlay,
  Grid,
  Alert,
  ActionIcon
} from '@mantine/core'
import { Editor } from '@monaco-editor/react'
import pathUtils from '../utils/path'
import { renderMarkdownSafe } from '../utils/markdown'

interface DocusaurusContent {
  content: string
  data: {
    title?: string
    sidebar_label?: string
    sidebar_position?: number
    [key: string]: any
  }
}

interface DocsEditorProps {
  sitePath: string
}

function DocsEditor({ sitePath }: DocsEditorProps): React.JSX.Element {
  const { filePath } = useParams<{ filePath: string }>()
  const navigate = useNavigate()
  const decodedFilePath = filePath ? decodeURIComponent(filePath) : ''

  const [content, setContent] = useState<DocusaurusContent | null>(null)
  const [editorContent, setEditorContent] = useState('')
  const [title, setTitle] = useState('')
  const [sidebarLabel, setSidebarLabel] = useState('')
  const [sidebarPosition, setSidebarPosition] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load document content
  useEffect(() => {
    async function loadContent() {
      if (!decodedFilePath) return

      setLoading(true)
      try {
        const doc = await window.api.readFile(decodedFilePath)
        if (doc) {
          setContent(doc)
          setEditorContent(doc.content)
          setTitle(doc.data.title || '')
          setSidebarLabel(doc.data.sidebar_label || '')
          setSidebarPosition(doc.data.sidebar_position)
        }
      } catch (error) {
        console.error('Failed to load document:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [decodedFilePath])

  // Save document
  const saveDocument = async () => {
    if (!decodedFilePath || !content) return

    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      // Prepare frontmatter
      const frontmatter = {
        ...content.data,
        title
      }

      if (sidebarLabel) {
        frontmatter.sidebar_label = sidebarLabel
      }

      if (sidebarPosition !== undefined) {
        frontmatter.sidebar_position = sidebarPosition
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
        setSaveError('Failed to save document')
      }
    } catch (error) {
      console.error('Error saving document:', error)
      setSaveError('Error saving document')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete document
  const deleteDocument = async () => {
    if (!decodedFilePath) return

    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await window.api.deleteFile(decodedFilePath)
        navigate('/')
      } catch (error) {
        console.error('Failed to delete document:', error)
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
            <Button color="red" variant="light" onClick={deleteDocument}>
              Delete
            </Button>
            <Button onClick={saveDocument} loading={isSaving}>
              Save Document
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
                Document saved successfully!
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

              <Grid.Col span={{ base: 12, sm: 3 }}>
                <TextInput
                  label="Sidebar Label (optional)"
                  value={sidebarLabel || ''}
                  onChange={(event) => setSidebarLabel(event.currentTarget.value)}
                  placeholder="Same as title if empty"
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 3 }}>
                <NumberInput
                  label="Sidebar Position (optional)"
                  value={sidebarPosition}
                  onChange={(value) => setSidebarPosition(value as number | undefined)}
                  placeholder="Determines the order"
                  allowDecimal={false}
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

export default DocsEditor
