import { useState } from 'react';
import { Button, Container, Text, Title, Card, Stack } from '@mantine/core';

interface SiteSelectorProps {
  onSiteSelected: (path: string) => void;
}

function SiteSelector({ onSiteSelected }: SiteSelectorProps): React.JSX.Element {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectSite = async () => {
    setIsSelecting(true);
    try {
      const sitePath = await window.api.selectSite();
      if (sitePath) {
        onSiteSelected(sitePath);
      }
    } catch (error) {
      console.error('Failed to select site:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Card withBorder shadow="md" p="xl" radius="md">
        <Stack align="center" gap="lg">
          <Title order={2}>Welcome to Docusaurus CMS</Title>
          <Text size="lg">Please select your Docusaurus site folder to get started.</Text>
          <Button onClick={handleSelectSite} loading={isSelecting} size="lg">
            Select Docusaurus Site
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}

export default SiteSelector;
