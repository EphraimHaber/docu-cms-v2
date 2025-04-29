import './assets/main.css'
import '@mantine/core/styles.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import App from './App'

// Create theme (customize as needed)
const theme = createTheme({
  // You can customize your theme here
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </StrictMode>
)
