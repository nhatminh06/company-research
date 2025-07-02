import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">About Career Compass</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Welcome to <span className="font-semibold text-blue-700">Career Compass</span> — your personalized gateway to understanding the companies that shape your future. We're not just a research platform. We are your career compass, your company exploration toolkit, and your personalized evaluator — all rolled into one seamless digital experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-blue-600 text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600">
                To empower individuals to make informed, confident, and inspired decisions about the companies they aspire to work with. Whether you're a job seeker, student, investor, or curious researcher, we provide the tools and intelligence you need to align your ambitions with the right organizations.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="text-green-600 text-3xl mb-4">💡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Platform Features</h3>
              <ul className="text-gray-600 space-y-2">
                <li><span className="font-bold">🧠 Smart Company Search:</span> Explore companies by name, industry, size, values, or location. Get detailed, up-to-date profiles built from trusted sources.</li>
                <li><span className="font-bold">📊 Company Insights:</span> Access company overviews, history, leadership, financials, culture, and employee reviews.</li>
                <li><span className="font-bold">📝 Save Notes & Build Your List:</span> Use your dashboard to take notes, bookmark companies, and build a shortlist of organizations that interest you.</li>
                <li><span className="font-bold">🎯 Ambition Matching:</span> Our system evaluates how well you align with any company you explore, helping you find your best fit.</li>
                <li><span className="font-bold">💡 Personalized Suggestions:</span> Receive company recommendations based on your interests, background, and goals.</li>
                <li><span className="font-bold">🔒 Private & Secure:</span> Your research and notes are always private and protected.</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Discover</h3>
                <p className="text-gray-600">Search and filter companies by what matters to you.</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Research & Note</h3>
                <p className="text-gray-600">Dive into company profiles and save your own notes and insights.</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Match</h3>
                <p className="text-gray-600">See how your ambitions and values align with each company.</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✨</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Decide & Apply</h3>
                <p className="text-gray-600">Shortlist, compare, and take action with confidence.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl mb-2">🔍</span>
                <span className="font-semibold text-gray-900 mb-1">Transparency</span>
                <span className="text-gray-600">We provide clear, unbiased, and accurate information to empower your decisions.</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl mb-2">🔒</span>
                <span className="font-semibold text-gray-900 mb-1">Privacy</span>
                <span className="text-gray-600">Your research and data are always private and secure.</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl mb-2">🌱</span>
                <span className="font-semibold text-gray-900 mb-1">Growth</span>
                <span className="text-gray-600">We help you grow by matching you with companies where you can thrive.</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We're For</h2>
            <ul className="text-gray-600 space-y-2">
              <li><span className="font-bold">🎓 Students & Grads:</span> Research internships or first employers with confidence.</li>
              <li><span className="font-bold">🔄 Career Changers:</span> See if a company aligns with your new path.</li>
              <li><span className="font-bold">💼 Job Seekers:</span> Dig deeper than job titles to find meaningful work.</li>
              <li><span className="font-bold">📈 Investors & Analysts:</span> Understand internal culture alongside external performance.</li>
              <li><span className="font-bold">🧐 Curious Minds:</span> Get a richer picture of the companies making headlines.</li>
            </ul>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Technology Stack</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">⚛️</div>
                <p className="font-medium text-gray-900">React</p>
                <p className="text-sm text-gray-600">Frontend Framework</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🚀</div>
                <p className="font-medium text-gray-900">Vite</p>
                <p className="text-sm text-gray-600">Build Tool</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🎨</div>
                <p className="font-medium text-gray-900">Tailwind CSS</p>
                <p className="text-sm text-gray-600">Styling</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <p className="font-medium text-gray-900">Node.js</p>
                <p className="text-sm text-gray-600">Backend</p>
              </div>
            </div>
          </div>

          {/* Our Promise & Call to Action */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Promise</h2>
            <p className="text-gray-600 mb-4">
              At <span className="font-semibold text-blue-700">Career Compass</span>, we are dedicated to your journey. We promise to deliver transparent, unbiased, and up-to-date company insights, while protecting your privacy and supporting your growth. Our platform is always evolving—driven by your feedback and the changing world of work—to help you make the best decisions for your future.
            </p>
            <p className="text-gray-600 mb-4">
              Trust us to be your partner in career discovery, every step of the way.
            </p>
            <div className="text-center mt-8">
              <h3 className="text-xl font-bold text-blue-700 mb-2">Ready to Find Your Match?</h3>
              <p className="text-gray-700 mb-2">Start exploring companies, reflecting on your goals, and building your future with confidence. Your next opportunity is just a click away.</p>
              <Link to="/auth" className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200">Get Started</Link>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 mt-8">
            <h2 className="text-2xl font-bold mb-4">Community Call-to-Action</h2>
            <p className="text-gray-700 mb-4">We believe in the power of community! Whether you're a job seeker, student, mentor, or industry expert, your voice matters. Join our community to share insights, suggest features, report bugs, or simply connect with others on their career journey.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-4">
              <a href="mailto:support@companyresearch.app" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200">Contact Us</a>
              <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200">Contribute on GitHub</a>
              <a href="/community" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200">Join the Community</a>
            </div>
            <p className="text-gray-500 text-sm">Let's build a better future, together.</p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Built with ❤️ for job seekers, students, and curious minds
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {/* If you want a static last-updated date, replace with a hardcoded value */}
              Version 1.0.0 • Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
          
        </div>
      </main>
    </div>
  )
} 