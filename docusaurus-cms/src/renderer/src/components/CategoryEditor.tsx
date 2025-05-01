import { useState, useEffect } from 'react'
import { Modal, Button, TextInput, Textarea, NumberInput, Stack } from '@mantine/core'

interface CategoryEditorProps {
  opened: boolean
  onClose: () => void
  onSave: (categoryData: CategoryData) => Promise<void>
  category: {
    name: string
    path: string
    data: CategoryData
  }
}

interface CategoryData {
  label: string
  position: number
  link: {
    type: string
    description: string
  }
}

function CategoryEditor({ opened, onClose, onSave, category }: CategoryEditorProps) {
  const [categoryData, setCategoryData] = useState<CategoryData>({
    label: category.data.label || '',
    position: category.data.position || 1,
    link: {
      type: category.data.link?.type || 'generated-index',
      description: category.data.link?.description || ''
    }
  })

  // When the category changes, update state
  useEffect(() => {
    setCategoryData({
      label: category.data.label || '',
      position: category.data.position || 1,
      link: {
        type: category.data.link?.type || 'generated-index',
        description: category.data.link?.description || ''
      }
    })
  }, [category])

  const handleSave = async () => {
    await onSave(categoryData)
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Edit Category: ${category.name}`}
      centered
      size="md"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3
      }}
    >
      <Stack>
        <TextInput
          label="Category Label"
          description="The display name of the category"
          value={categoryData.label}
          onChange={(e) => setCategoryData({ ...categoryData, label: e.target.value })}
          required
        />

        <NumberInput
          label="Position"
          description="The order of the category in the sidebar"
          value={categoryData.position}
          onChange={(value) =>
            setCategoryData({ ...categoryData, position: (value as number) || 1 })
          }
          min={1}
          required
        />

        <Textarea
          label="Description"
          description="Description shown on the category index page"
          value={categoryData.link.description}
          onChange={(e) =>
            setCategoryData({
              ...categoryData,
              link: {
                ...categoryData.link,
                description: e.target.value
              }
            })
          }
          minRows={3}
        />

        <Button.Group mt="md">
          <Button variant="default" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} style={{ flex: 1 }}>
            Save
          </Button>
        </Button.Group>
      </Stack>
    </Modal>
  )
}

export default CategoryEditor
