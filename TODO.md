Project Goal: Create a cross-platform Desktop Application using Electron that serves as a CMS for local Docusaurus projects. The application should allow users to browse project files, edit Markdown/MDX content with a Notion-like WYSIWYG interface directly in the content area, manage front matter, create new pages/categories, and view changes in real-time. The application should be installable as a dev dependency within a Docusaurus project.

Core Architecture:
Electron Application: Main process handles windowing, file system operations, and potentially managing the Docusaurus dev server process. Renderer process provides the UI (React).
UI: Includes file browser, integrated TipTap WYSIWYG editor that renders content as it will appear, and front matter editor as interactive cards.
Installation: Packaged as an application but potentially triggerable via an npm script defined in the target Docusaurus project's package.json.

## Phase 1: TipTap Editor Integration

[x] Task: Install and set up TipTap editor in the project
DoD: TipTap dependencies are installed and a basic editor component is created

[x] Task: Create a custom TipTap extension for Docusaurus-specific markdown features (admonitions, code blocks with language specification)
DoD: Extension enables rendering and editing of Docusaurus-specific content blocks

[x] Task: Implement block-level editing with Notion-like controls (transform blocks, drag/drop blocks)
DoD: Users can easily transform content blocks (e.g., paragraph to heading) and reorder blocks using drag and drop

[x] Task: Add slash commands for block insertion
DoD: Typing "/" brings up a command palette for inserting various content blocks

[ ] Task: Implement floating format menu on text selection
DoD: Selecting text shows a floating toolbar with formatting options

## Phase 2: Real-time Document Rendering

[ ] Task: Apply Docusaurus styling to TipTap editor content
DoD: Content in the editor visually resembles how it will appear in the final site

[x] Task: Create custom TipTap nodes for admonitions (tip, warning, danger, info, etc.)
DoD: Users can insert and edit admonition blocks that render similar to actual Docusaurus output

[ ] Task: Implement dark/light theme toggle for preview
DoD: Users can switch between dark and light modes to see how content appears in both themes

[ ] Task: Add MDX component support in the editor
DoD: Custom React components in MDX content are represented as editable blocks

## Phase 3: Inline Front Matter Editing

[ ] Task: Convert current front matter UI to collapsible "metadata cards" at the top of documents
DoD: Front matter appears as interactive cards that can be expanded/collapsed at the top of documents

[ ] Task: Create inline validation for front matter fields
DoD: Front matter fields show validation errors inline (e.g., required fields, format validation)

[ ] Task: Add field suggestions based on Docusaurus configurations
DoD: When adding front matter fields, suggestions appear based on Docusaurus site configuration

[ ] Task: Implement specialized editors for different front matter types (tags picker, date picker, etc.)
DoD: Special fields like tags, dates, etc. have appropriate UI controls

## Phase 4: Markdown-to-TipTap Conversion

[ ] Task: Enhance markdown parser to convert all Docusaurus markdown features to TipTap nodes
DoD: All Docusaurus markdown content (including MDX) is correctly rendered as TipTap content

[x] Task: Create TipTap-to-markdown serializer that preserves formatting
DoD: Edited content is saved as clean, properly formatted markdown compatible with Docusaurus

[ ] Task: Support for MDX components with props editing
DoD: MDX components can be edited including their props

[ ] Task: Handle code blocks with syntax highlighting in the editor
DoD: Code blocks have proper syntax highlighting and language selection in the editor

## Phase 5: Asset Management

[ ] Task: Implement drag-and-drop image uploading
DoD: Images can be dragged into the editor and are saved to the appropriate assets folder

[ ] Task: Add image resizing and positioning controls
DoD: Images in the editor can be resized and positioned with visual controls

[ ] Task: Create asset browser for existing images and files
DoD: Users can browse and select from existing assets in the project

[ ] Task: Implement proper path resolution for assets in different directories
DoD: Images and other assets are correctly referenced with proper relative paths

## Phase 6: Document Structure and Navigation

[ ] Task: Add document outline sidebar that updates in real time
DoD: A sidebar shows the document's heading structure and allows navigation within the document

[ ] Task: Implement visual sidebar editor for Docusaurus site structure
DoD: Users can visually organize the sidebar structure by dragging and dropping documents

[ ] Task: Create interfaces for managing document relationships (next/previous links, related documents)
DoD: UI for managing document relationships that updates the appropriate Docusaurus configurations

[ ] Task: Implement document linking with autocomplete suggestions
DoD: When creating links to other documents, the editor suggests existing documents

## Phase 7: Collaboration Features

[ ] Task: Implement auto-save functionality
DoD: Changes are automatically saved after a delay or when focus is lost

[ ] Task: Add version history interface showing recent changes
DoD: Users can view recent edits with timestamps and revert if needed

[ ] Task: Implement file change detection and conflict resolution
DoD: App detects when files are changed externally and offers to resolve conflicts

[ ] Task: Add comments and suggestions mode (optional stretch goal)
DoD: Users can add comments or suggestions to content that aren't part of the final output

## Phase 8: Performance and Polish

[ ] Task: Optimize editor performance for large documents
DoD: Editor remains responsive even with large, complex documents

[ ] Task: Implement keyboard shortcuts for common operations
DoD: Comprehensive keyboard shortcuts are available and documented

[ ] Task: Add command palette (ctrl+k) for quick actions
DoD: Command palette allows quick access to all editor functions

[ ] Task: Create helpful onboarding experience for new users
DoD: First-time users see helpful tooltips or a quick tutorial

## Phase 9: Packaging and Distribution

[ ] Task: Configure Electron Builder for cross-platform packaging
DoD: Installable application packages can be built for Windows, macOS, and Linux

[ ] Task: Create npm package for Docusaurus integration
DoD: Package can be installed as a dev dependency in a Docusaurus project

[ ] Task: Implement automatic updates via GitHub releases
DoD: App checks for and can install updates automatically

[ ] Task: Create comprehensive documentation
DoD: Documentation includes installation, usage guides, and keyboard shortcuts

Project Success Criteria:
- Editor feels like Notion with real-time WYSIWYG editing
- All Docusaurus markdown and MDX features are supported
- Changes are properly synchronized with the filesystem
- Performance remains good with large documents
- UI is intuitive and aligned with Docusaurus design principles