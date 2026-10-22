import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import './pages.css'

// A refresh always lands on the home page at the very top (admin panel excepted)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
const nav = performance.getEntriesByType('navigation')[0]
if (nav?.type === 'reload' && !location.pathname.startsWith('/admin')) history.replaceState(null, '', '/')
window.scrollTo(0, 0)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
