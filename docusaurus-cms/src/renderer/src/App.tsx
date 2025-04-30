import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Import components
import SiteSelector from './components/SiteSelector'
import Dashboard from './components/Dashboard'
import DocsEditor from './components/DocsEditor'
import BlogEditor from './components/BlogEditor'
import ConfigEditor from './components/ConfigEditor'
import './assets/main.css'

import * as monaco from 'monaco-editor'
import { loader } from '@monaco-editor/react'

loader.config({ monaco })

function App(): React.JSX.Element {
  const [sitePath, setSitePath] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if site path is already selected
  useEffect(() => {
    async function checkSitePath() {
      try {
        const path = await window.api.getCurrentSitePath()
        setSitePath(path)
      } catch (error) {
        console.error('Failed to get current site path:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSitePath()
  }, [])

  // If still loading, show loading indicator
  if (loading) {
    return <div className="loading">Loading...</div>
  }

  // If no site is selected, show site selector
  if (!sitePath) {
    return <SiteSelector onSiteSelected={setSitePath} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard sitePath={sitePath} />} />
        <Route path="/docs/:filePath" element={<DocsEditor sitePath={sitePath} />} />
        <Route path="/blog/:filePath" element={<BlogEditor sitePath={sitePath} />} />
        <Route path="/config/:filePath" element={<ConfigEditor sitePath={sitePath} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
