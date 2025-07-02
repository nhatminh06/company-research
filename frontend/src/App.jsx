import './App.css'
import './index.css'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Note from './pages/Note'
import About from './pages/About'
import Resume from './pages/Resume'
import Dashboard from './pages/Dashboard'
import CompanyAIInfo from './pages/CompanyAIInfo'
import Auth from './pages/Auth';
import Account from './pages/Account';
import Settings from './pages/Settings';
import Help from './pages/Help';
import VerifyEmail from './pages/VerifyEmail';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/auth';
  const hideFooter = location.pathname === '/auth';
  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/note" element={<Note />} />
          <Route path="/about" element={<About />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:company" element={<CompanyAIInfo />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/account" element={<Account />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/signup" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App