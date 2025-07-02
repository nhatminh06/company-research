import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 mt-12 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

          {/* Branding */}
          <div className="text-center md:text-left">
            <h2 className="text-lg font-semibold">Career Compass</h2>
            <p className="text-sm text-blue-100">© {currentYear} All rights reserved.</p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
            <Link to="/" className="hover:underline hover:text-blue-200 transition-colors duration-200">Home</Link>
            <Link to="/dashboard" className="hover:underline hover:text-blue-200 transition-colors duration-200">Dashboard</Link>
            <Link to="/note" className="hover:underline hover:text-blue-200 transition-colors duration-200">Note</Link>
            <Link to="/resume" className="hover:underline hover:text-blue-200 transition-colors duration-200">Resume</Link>
            <Link to="/about" className="hover:underline hover:text-blue-200 transition-colors duration-200">About</Link>
          </nav>

          {/* Contact & Socials */}
          <address className="not-italic flex items-center justify-center md:justify-end gap-4">
            {/* Email */}
            <a
              href="mailto:support@companyresearch.app"
              className="hover:text-blue-200 transition-colors duration-200"
              aria-label="Email support"
              title="Email"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l8 8 8-8" />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/your-repo"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-200 transition-colors duration-200"
              aria-label="GitHub Repository"
              title="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.47v-1.65c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.61.07-.61 1 .07 1.54 1.02 1.54 1.02.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.03a9.56 9.56 0 012.5-.34c.85 0 1.7.12 2.5.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.37.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.69.92.69 1.86v2.76c0 .26.17.56.67.47A10 10 0 0022 12c0-5.52-4.48-10-10-10z"/>
              </svg>
            </a>
          </address>

        </div>
      </div>
    </footer>
  )
}
