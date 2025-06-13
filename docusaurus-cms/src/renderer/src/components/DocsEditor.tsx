import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Group,
  TextInput,
  NumberInput,
  Box,
  LoadingOverlay,
  Grid,
  Alert,
  Paper,
} from '@mantine/core';
import NotionEditor from './NotionEditor/Editor';
import FrontMatterCard from './NotionEditor/FrontMatterCard';

interface DocusaurusContent {
  content: string;
  data: {
    title?: string;
    sidebar_label?: string;
    sidebar_position?: number;
    [key: string]: any;
  };
}

interface DocsEditorProps {
  sitePath: string;
}

const DocsEditor: React.FC<DocsEditorProps> = ({ sitePath }) => {
  const { filePath } = useParams<{ filePath: string }>();
  const navigate = useNavigate();
  const decodedFilePath = filePath ? decodeURIComponent(filePath) : '';

  const [content, setContent] = useState<DocusaurusContent | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [frontMatter, setFrontMatter] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load document content
  useEffect(() => {
    async function loadContent() {
      if (!decodedFilePath) return;

      setLoading(true);
      try {
        window.api.setCurrentFilePath(decodedFilePath);
        localStorage.setItem('currentFilePathdoo', decodedFilePath);
        const doc = await window.api.readFile(decodedFilePath);
        if (doc) {
          setContent(doc);
          setEditorContent(doc.content);
          setFrontMatter(doc.data || {});
        }
      } catch (error) {
        console.error('Failed to load document:', error);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [decodedFilePath]);

  // Handle frontmatter changes
  const handleFrontMatterChange = (newFrontMatter: Record<string, any>) => {
    setFrontMatter(newFrontMatter);
  };

  // Save document
  const saveDocument = async () => {
    if (!decodedFilePath || !content) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const success = await window.api.saveFile(decodedFilePath, editorContent, frontMatter);

      if (success) {
        setSaveSuccess(true);
        // Update local content state
        setContent({
          content: editorContent,
          data: frontMatter,
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        setSaveError('Failed to save document');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setSaveError('Error saving document');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete document
  const deleteDocument = async () => {
    if (!decodedFilePath) return;

    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await window.api.deleteFile(decodedFilePath);
        navigate('/');
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  return (
    <>
      <LoadingOverlay visible={loading} />
      <Box py="md">
        <Group justify="space-between" mb="md">
          <Group>
            <Button color="red" variant="light" onClick={deleteDocument}>
              Delete
            </Button>
            <Button onClick={saveDocument} loading={isSaving}>
              Save Document
            </Button>
          </Group>
        </Group>

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

            <Paper shadow="xs" p="md" mb="md" withBorder>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Title"
                    value={frontMatter.title || ''}
                    onChange={(event) =>
                      handleFrontMatterChange({
                        ...frontMatter,
                        title: event.currentTarget.value,
                      })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 3 }}>
                  <TextInput
                    label="Sidebar Label (optional)"
                    value={frontMatter.sidebar_label || ''}
                    onChange={(event) =>
                      handleFrontMatterChange({
                        ...frontMatter,
                        sidebar_label: event.currentTarget.value,
                      })
                    }
                    placeholder="Same as title if empty"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 3 }}>
                  <NumberInput
                    label="Sidebar Position (optional)"
                    value={frontMatter.sidebar_position}
                    onChange={(value) =>
                      handleFrontMatterChange({
                        ...frontMatter,
                        sidebar_position: value as number | undefined,
                      })
                    }
                    placeholder="Determines the order"
                    allowDecimal={false}
                  />
                </Grid.Col>
              </Grid>
            </Paper>

            <FrontMatterCard frontMatter={frontMatter} onChange={handleFrontMatterChange} />

            <Box h="calc(100vh - 320px)">
              <NotionEditor
                content={editorContent}
                onChange={(newContent) => setEditorContent(newContent)}
                onSave={saveDocument}
              />
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default DocsEditor;
