import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './index.css'
import Layout from './Layouts/layout.jsx';
import Dashboard from './Pages/dashboard.jsx';
import Notes from './Pages/notes.jsx';
 import Tasks from './Pages/tasks.jsx';
import Settings from './Pages/settings.jsx';
import ErrorBoundary from './Pages/ErrorBoundary.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '', element: <Dashboard /> },
      { path: 'notes', element: <Notes /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'settings', element: <Settings /> }
    ]
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router = {router}/>
  </StrictMode>,
)
