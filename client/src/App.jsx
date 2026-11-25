import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Listings from './pages/Listings'
import PropertyDetails from './pages/PropertyDetails'
import NotFound from './pages/NotFound'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import ManageListings from './pages/admin/ManageListings'
import PropertyForm from './pages/admin/PropertyForm'
import Inquiries from './pages/admin/Inquiries'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          {/* Customer portal */}
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Listings />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />

          {/* Broker / admin dashboard */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="listings" element={<ManageListings />} />
            <Route path="listings/new" element={<PropertyForm />} />
            <Route path="listings/:id/edit" element={<PropertyForm />} />
            <Route path="inquiries" element={<Inquiries />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
