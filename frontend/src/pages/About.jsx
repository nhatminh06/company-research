import { Link } from 'react-router-dom'
import { motion, useAnimation } from 'framer-motion'
import { useRef } from 'react'

export default function About() {
  const confettiControls = useAnimation();
  const confettiRef = useRef();

  // Confetti burst animation (simple circles)
  const handleConfetti = () => {
    confettiControls.start({
      opacity: [1, 1, 0],
      scale: [1, 1.5, 0.5],
      transition: { duration: 1, times: [0, 0.5, 1] }
    });
    setTimeout(() => confettiControls.set({ opacity: 0, scale: 1 }), 1200);
  };

  const featureList = [
    { icon: '🧠', label: 'Smart Company Search', desc: 'Explore companies by name, industry, size, values, or location. Get detailed, up-to-date profiles built from trusted sources.' },
    { icon: '📊', label: 'Company Insights', desc: 'Access company overviews, history, leadership, financials, culture, and employee reviews.' },
    { icon: '📝', label: 'Save Notes & Build Your List', desc: 'Use your dashboard to take notes, bookmark companies, and build a shortlist of organizations that interest you.' },
    { icon: '🎯', label: 'Ambition Matching', desc: 'Our system evaluates how well you align with any company you explore, helping you find your best fit.' },
    { icon: '💡', label: 'Personalized Suggestions', desc: 'Receive company recommendations based on your interests, background, and goals.' },
    { icon: '🔒', label: 'Private & Secure', desc: 'Your research and notes are always private and protected.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <motion.h1
              className="text-3xl font-bold text-gray-900 mb-4 inline-block cursor-pointer"
              whileHover={{ color: '#2563eb', textShadow: '0 2px 0 #a5b4fc', scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              About Career Compass
            </motion.h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Welcome to <span className="font-semibold text-blue-700">Career Compass</span> — your personalized gateway to understanding the companies that shape your future. We're not just a research platform. We are your career compass, your company exploration toolkit, and your personalized evaluator — all rolled into one seamless digital experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <motion.div className="bg-blue-50 p-6 rounded-lg" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <motion.div
                className="text-blue-600 text-3xl mb-4 inline-block cursor-pointer"
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
                transition={{ duration: 0.5 }}
              >🎯</motion.div>
              <motion.h3
                className="text-xl font-semibold text-gray-900 mb-3 inline-block cursor-pointer"
                whileHover={{ color: '#2563eb', textDecoration: 'underline' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >Our Mission</motion.h3>
              <p className="text-gray-600">
                To empower individuals to make informed, confident, and inspired decisions about the companies they aspire to work with. Whether you're a job seeker, student, investor, or curious researcher, we provide the tools and intelligence you need to align your ambitions with the right organizations.
              </p>
            </motion.div>

            <motion.div className="bg-green-50 p-6 rounded-lg" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <motion.div
                className="text-green-600 text-3xl mb-4 inline-block cursor-pointer"
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
                transition={{ duration: 0.5 }}
              >💡</motion.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Platform Features</h3>
              <motion.ul className="text-gray-600 space-y-2" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
                {featureList.map((f, i) => (
                  <motion.li
                    key={f.label}
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 * i }}
                  >
                    <motion.span
                      className="text-xl mr-2 cursor-pointer"
                      whileHover={{ scale: 1.3, rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >{f.icon}</motion.span>
                    <span className="font-bold">{f.label}:</span> {f.desc}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </div>

          <motion.div className="bg-gray-50 p-6 rounded-lg mb-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <motion.h2
              className="text-2xl font-bold text-gray-900 mb-4 inline-block cursor-pointer"
              whileHover={{ color: '#16a34a', textDecoration: 'underline' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >How It Works</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[{
                icon: '🔍', title: '1. Discover', desc: 'Search and filter companies by what matters to you.'
              }, {
                icon: '📝', title: '2. Research & Note', desc: 'Dive into company profiles and save your own notes and insights.'
              }, {
                icon: '🤝', title: '3. Match', desc: 'See how your ambitions and values align with each company.'
              }, {
                icon: '✨', title: '4. Decide & Apply', desc: 'Shortlist, compare, and take action with confidence.'
              }].map((step, i) => (
                <motion.div
                  key={step.title}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * (i + 1) }}
                  whileHover={{ scale: 1.07, boxShadow: '0 8px 24px rgba(59,130,246,0.12)' }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl cursor-pointer"
                    style={{ backgroundColor: i === 1 ? '#bbf7d0' : i === 2 ? '#fef08a' : i === 3 ? '#e9d5ff' : '#dbeafe' }}
                    whileHover={{ rotate: [0, 10, -10, 0], scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  >{step.icon}</motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div className="bg-white p-6 rounded-lg mb-8 border border-gray-200" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
            <motion.h2
              className="text-2xl font-bold text-gray-900 mb-4 inline-block cursor-pointer"
              whileHover={{ color: '#f59e42', textDecoration: 'underline' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >Our Values</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[{
                icon: '🔍', title: 'Transparency', desc: 'We provide clear, unbiased, and accurate information to empower your decisions.'
              }, {
                icon: '🔒', title: 'Privacy', desc: 'Your research and data are always private and secure.'
              }, {
                icon: '🌱', title: 'Growth', desc: 'We help you grow by matching you with companies where you can thrive.'
              }].map((value, i) => (
                <motion.div
                  key={value.title}
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * (i + 1) }}
                  whileHover={{ scale: 1.08, boxShadow: '0 8px 24px rgba(16,185,129,0.12)' }}
                >
                  <motion.span
                    className="text-3xl mb-2 cursor-pointer"
                    whileHover={{ scale: 1.3, rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >{value.icon}</motion.span>
                  <span className="font-semibold text-gray-900 mb-1">{value.title}</span>
                  <span className="text-gray-600">{value.desc}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div className="bg-gray-50 p-6 rounded-lg mb-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
            <motion.h2
              className="text-2xl font-bold text-gray-900 mb-4 inline-block cursor-pointer"
              whileHover={{ color: '#2563eb', textDecoration: 'underline' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >Who We're For</motion.h2>
            <ul className="text-gray-600 space-y-2">
              <li><span className="font-bold">🎓 Students & Grads:</span> Research internships or first employers with confidence.</li>
              <li><span className="font-bold">🔄 Career Changers:</span> See if a company aligns with your new path.</li>
              <li><span className="font-bold">💼 Job Seekers:</span> Dig deeper than job titles to find meaningful work.</li>
              <li><span className="font-bold">📈 Investors & Analysts:</span> Understand internal culture alongside external performance.</li>
              <li><span className="font-bold">🧐 Curious Minds:</span> Get a richer picture of the companies making headlines.</li>
            </ul>
          </motion.div>

          <motion.div className="border-t border-gray-200 pt-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}>
            <motion.h2
              className="text-2xl font-bold text-gray-900 mb-4 inline-block cursor-pointer"
              whileHover={{ color: '#2563eb', textDecoration: 'underline' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >Technology Stack</motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{
                icon: '⚛️', name: 'React', desc: 'Frontend Framework'
              }, {
                icon: '🚀', name: 'Vite', desc: 'Build Tool'
              }, {
                icon: '🎨', name: 'Tailwind CSS', desc: 'Styling'
              }, {
                icon: '⚡', name: 'Node.js', desc: 'Backend'
              }].map((tech, i) => (
                <motion.div
                  key={tech.name}
                  className="text-center p-4 bg-gray-50 rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * (i + 1) }}
                  whileHover={{ rotate: [0, 6, -6, 0], scale: 1.12, boxShadow: '0 8px 24px rgba(59,130,246,0.12)' }}
                >
                  <div className="text-2xl mb-2">{tech.icon}</div>
                  <p className="font-medium text-gray-900">{tech.name}</p>
                  <p className="text-sm text-gray-600">{tech.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Our Promise & Call to Action */}
          <motion.div className="border-t border-gray-200 pt-8 mt-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.7 }}>
            <motion.h2
              className="text-2xl font-bold text-gray-900 mb-4 inline-block cursor-pointer"
              whileHover={{ color: '#2563eb', textDecoration: 'underline' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >Our Promise</motion.h2>
            <p className="text-gray-600 mb-4">
              At <span className="font-semibold text-blue-700">Career Compass</span>, we are dedicated to your journey. We promise to deliver transparent, unbiased, and up-to-date company insights, while protecting your privacy and supporting your growth. Our platform is always evolving—driven by your feedback and the changing world of work—to help you make the best decisions for your future.
            </p>
            <p className="text-gray-600 mb-4">
              Trust us to be your partner in career discovery, every step of the way.
            </p>
            <div className="text-center mt-8">
              <h3 className="text-xl font-bold text-blue-700 mb-2">Ready to Find Your Match?</h3>
              <p className="text-gray-700 mb-2">Start exploring companies, reflecting on your goals, and building your future with confidence. Your next opportunity is just a click away.</p><br/>
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block relative"
                onClick={handleConfetti}
              >
                <Link to="/auth" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200">Get Started</Link>
                {/* Confetti burst (simple circles) */}
                <motion.div
                  ref={confettiRef}
                  animate={confettiControls}
                  initial={{ opacity: 0, scale: 1 }}
                  style={{ position: 'absolute', left: '50%', top: '-1.5rem', pointerEvents: 'none', zIndex: 10 }}
                >
                  {[...Array(12)].map((_, i) => (
                    <motion.span
                      key={i}
                      style={{
                        display: 'inline-block',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: `hsl(${i * 30}, 90%, 60%)`,
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        transform: `rotate(${i * 30}deg) translateY(-24px)`
                      }}
                      animate={confettiControls}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div className="border-t border-gray-200 pt-8 mt-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.8 }}>
            <motion.h2
              className="text-2xl font-bold mb-4 inline-block cursor-pointer"
              whileHover={{ color: '#2563eb', textDecoration: 'underline' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >Community Call-to-Action</motion.h2>
            <p className="text-gray-700 mb-4">We believe in the power of community! Whether you're a job seeker, student, mentor, or industry expert, your voice matters. Join our community to share insights, suggest features, report bugs, or simply connect with others on their career journey.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-4">
              <motion.a whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }} href="mailto:support@companyresearch.app" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200">Contact Us</motion.a>
              <motion.a whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }} href="https://github.com/nhatminh06/company-research" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200">Contribute on GitHub</motion.a>
              <motion.a whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }} href="/community" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200">Join the Community</motion.a>
            </div>
            <p className="text-gray-500 text-sm">Let's build a better future, together.</p>
          </motion.div>

          <motion.div className="mt-8 text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
            <p className="text-gray-600">
              Built with ❤️ for job seekers, students, and curious minds
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Version 1.0.0 • Last updated: {new Date().toLocaleDateString()}
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
} 