import { useState, useEffect } from 'react'
import { Modal, Button, TextInput, Textarea, Stack } from '@mantine/core'

interface CategoryCreatorProps {
  opened: boolean
  onClose: () => void
  onSave: (categoryData: { name: string; description: string }) => Promise<void>
}

function CategoryCreator({ opened, onClose, onSave }: CategoryCreatorProps) {
  const [categoryName, setCategoryName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  console.log('CategoryCreator opened:', opened)

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (!opened) {
      // Reset form when modal closes
      setCategoryName('')
      setDescription('')
      setIsSubmitting(false)
    }
  }, [opened])

  const handleSave = async () => {
    if (!categoryName.trim()) return

    setIsSubmitting(true)
    try {
      await onSave({
        name: categoryName,
        description
      })

      // Reset form
      setCategoryName('')
      setDescription('')
      onClose()
    } catch (error) {
      console.error('Failed to create category:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Category"
      centered
      size="md"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3
      }}
    >
      <Stack>
        <TextInput
          label="Category Name"
          description="The display name of the category"
          value={categoryName}
          onChange={(e) => setCategoryName(e.currentTarget.value)}
          placeholder="e.g. Getting Started"
          required
          data-autofocus
        />

        <Textarea
          label="Description"
          description="Description shown on the category index page"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          placeholder="Description for the category index page"
          minRows={3}
        />

        <Button.Group mt="md">
          <Button variant="default" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            style={{ flex: 1 }}
            loading={isSubmitting}
            disabled={!categoryName.trim()}
          >
            Create
          </Button>
        </Button.Group>
      </Stack>
    </Modal>
  )
}

export default CategoryCreator
