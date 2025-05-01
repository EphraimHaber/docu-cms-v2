import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Group, Text, Box, Alert, LoadingOverlay } from '@mantine/core';
import { Editor } from '@monaco-editor/react';
import pathUtils from '../utils/path';

interface ConfigEditorProps {
  sitePath: string;
}

function ConfigEditor({ sitePath }: ConfigEditorProps): React.JSX.Element {
  const { filePath } = useParams<{ filePath: string }>();
  const navigate = useNavigate();
  const decodedFilePath = filePath ? decodeURIComponent(filePath) : '';

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Determine the language for Monaco editor based on file extension
  const getFileLanguage = () => {
    if (!decodedFilePath) return 'javascript';
    if (decodedFilePath.endsWith('.ts')) return 'typescript';
    if (decodedFilePath.endsWith('.js')) return 'javascript';
    if (decodedFilePath.endsWith('.json')) return 'json';
    return 'javascript';
  };

  // Load config file content
  useEffect(() => {
    async function loadContent() {
      if (!decodedFilePath) return;

      setLoading(true);
      try {
        // Read the file through our API
        const response = await window.api.readFile(decodedFilePath);
        if (response) {
          // For config files, gray-matter will put the whole file in the content field
          // if there's no frontmatter
          setContent(response.content);
        }
      } catch (error) {
        console.error('Failed to load config file:', error);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [decodedFilePath]);

  // Save config file
  const saveConfig = async () => {
    if (!decodedFilePath) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // For config files, we'll write with an empty frontmatter
      const success = await window.api.saveFile(decodedFilePath, content, {});

      if (success) {
        setSaveSuccess(true);

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        setSaveError('Failed to save config file');
      }
    } catch (error) {
      console.error('Error saving config file:', error);
      setSaveError('Error saving config file');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <LoadingOverlay visible={loading} />
      <Box py="md">
        <Group justify="space-between" mb="md">
          <Text fw="bold">
            {decodedFilePath ? pathUtils.basename(decodedFilePath) : 'Config Editor'}
          </Text>
          <Button onClick={saveConfig} loading={isSaving}>
            Save
          </Button>
        </Group>

        {saveError && (
          <Alert color="red" mb="md" withCloseButton onClose={() => setSaveError(null)}>
            {saveError}
          </Alert>
        )}

        {saveSuccess && (
          <Alert color="green" mb="md" withCloseButton onClose={() => setSaveSuccess(false)}>
            Config file saved successfully!
          </Alert>
        )}

        <Box h="85vh">
          <Editor
            height="100%"
            language={getFileLanguage()}
            value={content}
            onChange={(value) => setContent(value || '')}
            options={{
              wordWrap: 'on',
              tabSize: 2,
              lineNumbers: 'on',
              renderWhitespace: 'boundary',
            }}
          />
        </Box>
      </Box>
    </>
  );
}

export default ConfigEditor;
