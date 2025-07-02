import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [companyNames, setCompanyNames] = useState([])
  const [user, setUser] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await axios.get('/api/dashboard')
        const names = Array.from(new Set(res.data.map(c => c.company))).sort()
        setCompanyNames(names)
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchCompanies()
  }, [])

  // Check for user token and decode user info (simple demo, not secure decode)
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ email: payload.email, name: payload.name || '', id: payload.id })
      } catch (e) {
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }, [])

  const filteredCompanyNames = search
    ? companyNames.filter(name => name.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : []

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/dashboard/${encodeURIComponent(search.trim())}`)
      setShowAutocomplete(false)
      setSearch('')
      setIsOpen(false)
    }
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/auth')
  }

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Note', href: '/note' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'About', href: '/about' },
    { name: 'Resume', href: '/resume' }
  ]

  // Helper for avatar (initials)
  const getInitials = (name, email) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    if (email) return email[0].toUpperCase()
    return '?'
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              {/* Logo */}
              <svg 
                className="h-8 w-8 text-white mr-3" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span className="text-2xl font-bold text-white tracking-wide">
                Company Research
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <form onSubmit={handleSearch} className="relative w-full max-w-xs">
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="Search companies..."
                value={search}
                onChange={e => { setSearch(e.target.value); setShowAutocomplete(true) }}
                onFocus={() => setShowAutocomplete(true)}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
                autoComplete="off"
              />
              {showAutocomplete && filteredCompanyNames.length > 0 && (
                <ul className="absolute z-20 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow mt-1 max-h-60 overflow-y-auto">
                  {filteredCompanyNames.map(name => (
                    <li
                      key={name}
                      className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-left"
                      onMouseDown={() => { setSearch(name); setShowAutocomplete(false); navigate(`/dashboard/${encodeURIComponent(name)}`) }}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </form>
          </div>

          {/* Right side - User actions */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <div className="relative">
                  <button
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-700 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={() => setDropdownOpen(v => !v)}
                  >
                    {getInitials(user.name, user.email)}
                  </button>
                  {dropdownOpen && (
                    <>
                      {/* Caret */}
                      <div className="absolute left-1/2 top-10 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white z-40"></div>
                      <div className="absolute left-1/2 top-12 -translate-x-1/2 w-64 bg-white rounded-lg shadow-lg py-2 z-30 border transition-all duration-200 ease-out animate-dropdown-fade">
                        {/* User info */}
                        <div className="px-4 py-3 text-center border-b">
                          <div className="font-bold text-lg text-blue-700">{user.name || 'No name set'}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                        <Link to="/account" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>Account</Link>
                        <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>Settings</Link>
                        <Link to="/help" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>Help</Link>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Logout</button>
                      </div>
                      <style>{`
                        @keyframes dropdown-fade {
                          0% { opacity: 0; transform: translateY(-10px); }
                          100% { opacity: 1; transform: translateY(0); }
                        }
                        .animate-dropdown-fade {
                          animation: dropdown-fade 0.18s ease-out;
                        }
                      `}</style>
                    </>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  Get Started
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-blue-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
              aria-expanded="false"
              aria-label="Toggle menu"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700 shadow-lg relative transition-all duration-200 ease-out animate-dropdown-fade">
            {/* Mobile Search Bar */}
            <form onSubmit={handleSearch} className="mb-3 relative">
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
                placeholder="Search companies..."
                value={search}
                onChange={e => { setSearch(e.target.value); setShowAutocomplete(true) }}
                onFocus={() => setShowAutocomplete(true)}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
                autoComplete="off"
              />
              {showAutocomplete && filteredCompanyNames.length > 0 && (
                <ul className="absolute z-20 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow mt-1 max-h-60 overflow-y-auto">
                  {filteredCompanyNames.map(name => (
                    <li
                      key={name}
                      className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-left"
                      onMouseDown={() => { setSearch(name); setShowAutocomplete(false); navigate(`/dashboard/${encodeURIComponent(name)}`); setIsOpen(false) }}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </form>
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-blue-600">
              {user ? (
                <div className="flex flex-col items-center gap-2 transition-all duration-200 ease-out animate-dropdown-fade">
                  {/* Caret */}
                  <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white mb-1"></div>
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-800 text-white font-bold text-xl mb-1">
                    {getInitials(user.name, user.email)}
                  </span>
                  <div className="text-center mb-2">
                    <div className="font-bold text-lg text-white">{user.name || 'No name set'}</div>
                    <div className="text-xs text-blue-100">{user.email}</div>
                  </div>
                  <Link to="/account" className="w-full block text-center px-4 py-2 bg-white text-blue-700 rounded-md font-medium mb-2" onClick={() => setIsOpen(false)}>
                    Account
                  </Link>
                  <Link to="/settings" className="w-full block text-center px-4 py-2 bg-white text-blue-700 rounded-md font-medium mb-2" onClick={() => setIsOpen(false)}>
                    Settings
                  </Link>
                  <Link to="/help" className="w-full block text-center px-4 py-2 bg-white text-blue-700 rounded-md font-medium mb-2" onClick={() => setIsOpen(false)}>
                    Help
                  </Link>
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full block text-center px-4 py-2 bg-white text-blue-700 rounded-md font-medium">
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="w-full block text-center bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                  Get Started
                </Link>
              )}
            </div>
            <style>{`
              @keyframes dropdown-fade {
                0% { opacity: 0; transform: translateY(-10px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              .animate-dropdown-fade {
                animation: dropdown-fade 0.18s ease-out;
              }
            `}</style>
          </div>
        </div>
      )}
    </nav>
  )
}
