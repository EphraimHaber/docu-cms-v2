import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Editor } from '@tiptap/react'
import './SlashCommands.css'

interface SlashCommandsProps {
  editor: Editor
}

interface CommandOption {
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
}

const SlashCommands = ({ editor }: SlashCommandsProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const commandOptions: CommandOption[] = [
    {
      title: 'Heading 1',
      description: 'Big section heading',
      icon: <span className="icon">H1</span>,
      action: () => {
        editor.chain().focus().toggleHeading({ level: 1 }).run()
        setIsOpen(false)
      }
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: <span className="icon">H2</span>,
      action: () => {
        editor.chain().focus().toggleHeading({ level: 2 }).run()
        setIsOpen(false)
      }
    },
    {
      title: 'Heading 3',
      description: 'Small section heading',
      icon: <span className="icon">H3</span>,
      action: () => {
        editor.chain().focus().toggleHeading({ level: 3 }).run()
        setIsOpen(false)
      }
    },
    {
      title: 'Bulleted List',
      description: 'Create a simple bulleted list',
      icon: <span className="icon">•</span>,
      action: () => {
        editor.chain().focus().toggleBulletList().run()
        setIsOpen(false)
      }
    },
    {
      title: 'Numbered List',
      description: 'Create a numbered list',
      icon: <span className="icon">1.</span>,
      action: () => {
        editor.chain().focus().toggleOrderedList().run()
        setIsOpen(false)
      }
    },
    {
      title: 'Code Block',
      description: 'Add code with syntax highlighting',
      icon: <span className="icon">{'<>'}</span>,
      action: () => {
        editor.chain().focus().toggleCodeBlock().run()
        setIsOpen(false)
      }
    },
    {
      title: 'Blockquote',
      description: 'Add a quote',
      icon: <span className="icon">"</span>,
      action: () => {
        editor.chain().focus().toggleBlockquote().run()
        setIsOpen(false)
      }
    },
    {
      title: 'Tip Admonition',
      description: 'Add a tip admonition box',
      icon: <span className="icon">💡</span>,
      action: () => {
        editor.chain().focus().setAdmonition({ type: 'tip', title: 'Tip' }).run()
        setIsOpen(false)
      }
    },
    {
      title: 'Note Admonition',
      description: 'Add a note admonition box',
      icon: <span className="icon">📝</span>,
      action: () => {
        console.log(editor.commands)
        editor.chain().focus().setAdmonition({ type: 'note', title: 'Note' }).run()
        setIsOpen(false)
      }
    },
    {
      title: 'Warning Admonition',
      description: 'Add a warning admonition box',
      icon: <span className="icon">⚠️</span>,
      action: () => {
        editor.chain().focus().setAdmonition({ type: 'warning', title: 'Warning' }).run()
        setIsOpen(false)
      }
    },
    {
      title: 'Danger Admonition',
      description: 'Add a danger admonition box',
      icon: <span className="icon">🔥</span>,
      action: () => {
        editor.chain().focus().setAdmonition({ type: 'danger', title: 'Danger' }).run()
        setIsOpen(false)
      }
    }
  ]

  const filteredOptions = commandOptions.filter((option) =>
    option.title.toLowerCase().includes(search.toLowerCase())
  )

  // Listen for '/' character to open the menu
  const handleSlashCommand = useCallback(() => {
    const { state, view } = editor
    const { selection } = state
    const { $anchor } = selection

    // Check if the cursor is at the beginning of the line or preceded by only whitespace
    const textBeforeCursor = $anchor.nodeBefore?.textContent || ''
    const isSlashCommand = textBeforeCursor === '/' || textBeforeCursor.endsWith(' /')

    if (isSlashCommand) {
      // Get cursor coordinates to position the menu
      const coords = view.coordsAtPos(selection.anchor)

      setPosition({ x: coords.left, y: coords.bottom + 10 })
      setIsOpen(true)
      setSearch('')
      setSelectedIndex(0)

      // Delete the slash character
      if (textBeforeCursor === '/') {
        editor.commands.deleteRange({
          from: $anchor.pos - 1,
          to: $anchor.pos
        })
      } else if (textBeforeCursor.endsWith(' /')) {
        editor.commands.deleteRange({
          from: $anchor.pos - 1,
          to: $anchor.pos
        })
      }

      return true
    }

    return false
  }, [editor])

  // Monitor editor updates to detect slash commands
  useEffect(() => {
    if (!editor) return

    // Add event handler for editor updates
    const handleUpdate = () => {
      handleSlashCommand()
    }

    // Add the event listener
    editor.on('update', handleUpdate)

    // Cleanup function to remove the event listener
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, handleSlashCommand])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev))
          break

        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
          break

        case 'Enter':
          event.preventDefault()
          if (filteredOptions[selectedIndex]) {
            filteredOptions[selectedIndex].action()
          }
          break

        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          break

        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredOptions, selectedIndex])

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isOpen) return null

  return (
    <div ref={menuRef} className="slash-commands" style={{ left: position.x, top: position.y }}>
      <div className="slash-commands-search">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setSelectedIndex(0)
          }}
          placeholder="Search for a block"
          autoFocus
        />
      </div>
      <div className="slash-commands-options">
        {filteredOptions.map((option, index) => (
          <div
            key={option.title}
            className={`slash-command-option ${index === selectedIndex ? 'selected' : ''}`}
            onClick={option.action}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            {option.icon}
            <div className="option-text">
              <div className="option-title">{option.title}</div>
              <div className="option-description">{option.description}</div>
            </div>
          </div>
        ))}
        {filteredOptions.length === 0 && (
          <div className="no-results">No blocks match your search</div>
        )}
      </div>
    </div>
  )
}

export default SlashCommands
