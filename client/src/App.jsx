import { Routes, Route } from 'react-router-dom'
import './index.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import AuthProvider from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Documents from './pages/Upload.jsx'
import Collections from './pages/CollectionPages/Collections.jsx'
import CollectionDetails from './pages/CollectionPages/CollectionDetails.jsx'
import SharedCollection from './pages/CollectionPages/SharedCollection.jsx'
import Records from './pages/RecordPages/Records.jsx'
import RecordDetail from './pages/RecordPages/RecordDetail.jsx'
import SharedRecord from './pages/RecordPages/SharedRecord.jsx'
import Profile from './pages/Profile.jsx'

// Doctor Pages
import DoctorDashboard from './pages/DoctorPages/DoctorDashboard.jsx'
import PatientManagement from './pages/DoctorPages/PatientManagement.jsx'
import PatientDetail from './pages/DoctorPages/PatientDetail.jsx'
import AppointmentManagement from './pages/DoctorPages/AppointmentManagement.jsx'
import AddPatient from './pages/DoctorPages/AddPatient.jsx'
import Analytics from './pages/DoctorPages/Analytics.jsx'
import DoctorPortalHome from './pages/DoctorPages/DoctorPortalHome.jsx'

function App() {
  
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-16">
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/records/share' element={<SharedRecord />} />
            <Route path='/collections/share' element={<SharedCollection />} />            <Route path='/' element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path='/upload' element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            } />
            <Route path='/collections' element={
              <ProtectedRoute>
                <Collections />
              </ProtectedRoute>
            } />
            <Route path='/collections/:id' element={
              <ProtectedRoute>
                <CollectionDetails />
              </ProtectedRoute>
            } />
            <Route path='/records' element={
              <ProtectedRoute>
                <Records />
              </ProtectedRoute>
            } />
            <Route path='/records/:id' element={
              <ProtectedRoute>
                <RecordDetail />
              </ProtectedRoute>
            } />
            <Route path='/profile' element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            {/* Doctor Routes */}
            <Route path='/doctor' element={
              <ProtectedRoute>
                <DoctorPortalHome />
              </ProtectedRoute>
            } />
            <Route path='/doctor/dashboard' element={
              <ProtectedRoute>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path='/doctor/patients' element={
              <ProtectedRoute>
                <PatientManagement />
              </ProtectedRoute>
            } />
            <Route path='/doctor/patients/:id' element={
              <ProtectedRoute>
                <PatientDetail />
              </ProtectedRoute>
            } />
            <Route path='/doctor/appointments' element={
              <ProtectedRoute>
                <AppointmentManagement />
              </ProtectedRoute>
            } />
            <Route path='/doctor/patients/new' element={
              <ProtectedRoute>
                <AddPatient />
              </ProtectedRoute>
            } />
            <Route path='/doctor/analytics' element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  )
}

export default App
