Project Goal: Create a cross-platform Desktop Application using Electron that serves as a CMS for local Docusaurus projects. The application should allow users to browse project files, edit Markdown/MDX content with a Notion-like WYSIWYG interface, manage front matter, create new pages/categories, and view a live preview of the Docusaurus site (by embedding the localhost dev server output). The application should be installable as a dev dependency within a Docusaurus project.
Core Architecture:
Electron Application: Main process handles windowing, file system operations, and potentially managing the Docusaurus dev server process. Renderer process provides the UI (React).
UI: Includes file browser, WYSIWYG editor pane, metadata editor, and an embedded browser view (BrowserView or <webview>) for live preview.
Installation: Packaged as an application but potentially triggerable via an npm script defined in the target Docusaurus project's package.json.
Phase 1: Electron Foundation & Project Setup
[x] Task: Initialize Electron application using a standard template (e.g., electron-forge, electron-react-boilerplate) with TypeScript.
DoD: Basic Electron window opens showing a placeholder message. Project structure (main, renderer, preload) is established. Build/start scripts work.
[ ] Task: Set up main window management (creation, basic lifecycle events).
DoD: Application window can be opened, closed, and potentially resized.
[ ] Task: Implement basic layout structure in the Renderer process (e.g., using React components for sidebar, editor pane, preview pane).
DoD: UI displays distinct placeholder areas for file browser, editor, and preview.
[ ] Task: Set up IPC (Inter-Process Communication) basics between Main and Renderer processes for future use (e.g., file operations).
DoD: A simple message can be sent from Renderer to Main and acknowledged back.
Phase 2: Project Loading & File System Core
[ ] Task: Implement functionality to open/select a Docusaurus project directory.
DoD: User can click a button, use a dialog to select a folder. The selected project path is stored and displayed.
[ ] Task: Implement a file/directory browser UI component in the Renderer, displaying the contents of the selected project's docs (or configured content) directory.
DoD: UI lists files and folders within the relevant project directory. Folders are expandable/collapsible. Clicking a Markdown file signals intent to edit.
[ ] Task: Implement core file reading logic in the Main process, exposed via IPC.
DoD: Renderer can request the content of a specific Markdown file; Main process reads it and sends the content back to the Renderer.
[ ] Task: Implement core file writing logic in the Main process, exposed via IPC.
DoD: Renderer can send updated content for a specific file path; Main process saves the content to the local file system.
Phase 3: Markdown Editing & Front Matter
[ ] Task: Integrate a Rich Text / WYSIWYG Editor library (e.g., TipTap, Slate.js) into the editor pane component in the Renderer.
DoD: Editor component is displayed when a Markdown file is selected.
[ ] Task: Implement loading of Markdown file content (received from Main via IPC) into the WYSIWYG editor.
DoD: Content of the selected file appears correctly formatted within the editor.
[ ] Task: Configure the editor for optimal Markdown input/output and Notion-like features (inline formatting toolbar, block manipulation).
DoD: User can apply basic Markdown formatting (bold, italic, headings, lists, code) using UI controls. Editor state can be reliably converted back to clean Markdown.
[ ] Task: Implement front matter parsing (in Main or Renderer using a library like gray-matter) and display/editing UI.
DoD: Front matter is separated from Markdown body upon loading. A dedicated UI section allows viewing and modifying key-value pairs.
[ ] Task: Implement saving logic: Combine updated front matter (as YAML) and Markdown body (from editor state), send to Main process via IPC for file writing.
DoD: Clicking a "Save" button correctly updates the local file with both modified front matter and body content.
Phase 4: Live Preview Integration
[ ] Task: Implement functionality to embed a browser view (Electron's BrowserView is generally preferred over <webview>) within the application's preview pane.
DoD: Preview pane exists within the Electron window.
[ ] Task: Point the embedded BrowserView to the Docusaurus development server URL (e.g., http://localhost:3000). Assume the user runs npm run start separately for now.
DoD: When the Docusaurus dev server is running, the live site is displayed within the Electron app's preview pane.
[ ] Task: Verify that saving a file in the editor (Phase 3) triggers HMR updates in the embedded BrowserView.
DoD: Changes made in the editor and saved are reflected in the preview pane almost instantly without a full page reload.
[ ] Task: (Stretch Goal) Implement logic for the Electron app to optionally manage (start/stop) the Docusaurus dev server process (npm run start) for the selected project.
DoD: A button within the Electron app can launch the Docusaurus dev server for the current project; output/status is displayed.
Phase 5: Structural Editing (Files/Categories)
[ ] Task: Implement UI actions ("New Doc", "New Category") in the file browser area.
DoD: Buttons/context menu options exist for creating new items.
[ ] Task: Implement "New Doc" flow: Prompt for filename/location, send request via IPC to Main process to create the empty .md/.mdx file with basic front matter.
DoD: New file appears in the file browser UI and on the local disk. HMR updates preview if applicable (e.g., autogenerated sidebars).
[ ] Task: Implement "New Category" flow: Prompt for folder name/location, optional _category_.json details; send request via IPC to Main to create folder and metadata file.
DoD: New folder (and _category_.json if specified) appears in UI and on disk. Preview updates sidebar if applicable.
[ ] Task: (Stretch) Add file/folder rename and delete functionality via IPC calls to the Main process.
DoD: User can rename/delete items from the file browser UI, changes are reflected on disk.
Phase 6: Application Polish & Packaging
[ ] Task: Implement file watching in the Main process to detect external changes (prompt user if edited file changed outside the app).
DoD: App notifies the user if the currently opened file is modified by another program.
[ ] Task: Refine UI/UX (loading states, error handling, consistent design).
DoD: Application feels stable and provides clear feedback to the user.
[ ] Task: Configure Electron Builder or Forge for cross-platform packaging (Windows, macOS, Linux).
DoD: Installable application packages can be built for major OSs.
[ ] Task: Define how the app is "installed in the project": Likely involves adding a devDependency and a script in package.json (e.g., "cms": "electron ./path-to-cms-app" or similar, depending on packaging).
DoD: Clear instructions exist. Running npm run cms (or similar) in a Docusaurus project successfully launches the Electron CMS application targeting that project directory.
Phase 7: Testing & Documentation
[ ] Task: Develop basic unit/integration tests for file operations in the Main process.
[ ] Task: Perform manual end-to-end testing across different OSs.
[ ] Task: Create user documentation (README) explaining setup, usage, and architecture.
How to Judge AI Performance:
Code Generation: Does the generated code for each task align with Electron/Node.js/React best practices? Does it correctly implement the described functionality (e.g., file reading/writing, IPC communication, WYSIWYG integration)?
Completeness: Does the solution address all requirements specified in the DoD for each task?
Architecture Adherence: Does the code respect the Main/Renderer process separation and use IPC correctly? Is the file system logic properly isolated in the Main process?
Functionality: When testing manually (or via automated tests), does the application behave as expected? Does saving trigger HMR? Can new files/folders be created?
Clarity: Is the code well-structured and commented appropriately?