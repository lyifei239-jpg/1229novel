import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NovelProvider } from '@/contexts/NovelContext'
import NovelListPage from '@/pages/NovelListPage'
import NovelCreatePage from '@/pages/NovelCreatePage'
import NovelEditorPage from '@/pages/NovelEditorPage'
import OutlinePage from '@/pages/OutlinePage'
import CharacterPage from '@/pages/CharacterPage'
import SettingsPage from '@/pages/SettingsPage'
import './App.css'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <NovelProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<NovelListPage />} />
            <Route path="/novel/new" element={<NovelCreatePage />} />
            <Route path="/novel/:id" element={<NovelEditorPage />} />
            <Route path="/novel/:id/outline" element={<OutlinePage />} />
            <Route path="/novel/:id/characters" element={<CharacterPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </NovelProvider>
    </BrowserRouter>
  )
}

export default App
