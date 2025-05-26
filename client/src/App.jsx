import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import AuthProvider from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Documents from './pages/Documents.jsx'
import Collections from './pages/Collections.jsx'
import Records from './pages/Records.jsx'

function App() {
  
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-16">
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/home' element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path='/documents' element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            } />
            <Route path='/collections' element={
              <ProtectedRoute>
                <Collections />
              </ProtectedRoute>
            } />
            <Route path='/records' element={
              <ProtectedRoute>
                <Records />
              </ProtectedRoute>
            } />
            <Route path='/' element={<Home />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  )
}

export default App
