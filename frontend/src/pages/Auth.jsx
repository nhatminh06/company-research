import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Auth() {
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', {
        email: signInEmail,
        password: signInPassword,
      });
      localStorage.setItem('token', res.data.token);
      setLoading(false);
      navigate('/');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Sign in failed');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/signup', {
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
      });
      localStorage.setItem('token', res.data.token);
      setLoading(false);
      navigate('/');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Sign up failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f5f7] font-['Montserrat',sans-serif]">
      <div className="relative w-[768px] max-w-full min-h-[480px] bg-white rounded-[10px] shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)] overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <span className="text-blue-700 font-semibold">Processing...</span>
          </div>
        )}
        {error && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded shadow z-50">
            {error}
          </div>
        )}
        {/* Sign Up Form */}
        <div className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-1000 ease-in-out
          ${rightPanelActive ? 'translate-x-full opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}>
          <form className="bg-white flex flex-col items-center justify-center h-full px-[50px] text-center" onSubmit={handleSignUp}>
            <h1 className="font-bold text-3xl mb-2">Create Account</h1>
            <span className="text-xs mb-2">Use your email for registration</span>
            <input className="bg-[#eee] border-none p-3 my-2 w-full rounded" type="text" placeholder="Name" value={signUpName} onChange={e => setSignUpName(e.target.value)} required />
            <input className="bg-[#eee] border-none p-3 my-2 w-full rounded" type="email" placeholder="Email" value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} required />
            <input className="bg-[#eee] border-none p-3 my-2 w-full rounded" type="password" placeholder="Password" value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)} required />
            <button type="submit" className="mt-4 rounded-[20px] border border-blue-600 bg-blue-600 text-white font-bold px-[45px] py-[12px] uppercase text-xs tracking-wider transition-transform active:scale-95">Sign Up</button>
          </form>
        </div>
        {/* Sign In Form */}
        <div className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-1000 ease-in-out
          ${rightPanelActive ? 'translate-x-full opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}
        `}>
          <form className="bg-white flex flex-col items-center justify-center h-full px-[50px] text-center" onSubmit={handleSignIn}>
            <h1 className="font-bold text-3xl mb-2">Sign in</h1>
            <span className="text-xs mb-2">Use your account</span>
            <input className="bg-[#eee] border-none p-3 my-2 w-full rounded" type="email" placeholder="Email" value={signInEmail} onChange={e => setSignInEmail(e.target.value)} required />
            <input className="bg-[#eee] border-none p-3 my-2 w-full rounded" type="password" placeholder="Password" value={signInPassword} onChange={e => setSignInPassword(e.target.value)} required />
            <a href="#" className="text-[#333] text-sm my-2">Forgot your password?</a>
            <button type="submit" className="mt-4 rounded-[20px] border border-blue-600 bg-blue-600 text-white font-bold px-[45px] py-[12px] uppercase text-xs tracking-wider transition-transform active:scale-95">Sign In</button>
          </form>
        </div>
        {/* Overlay */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-1000 ease-in-out
          ${rightPanelActive ? '-translate-x-full' : ''}
        `}>
          <div className={`absolute left-[-100%] w-[200%] h-full transition-transform duration-1000 ease-in-out
            ${rightPanelActive ? 'translate-x-1/2' : ''}
          `}>
            {/* Overlay Left */}
            <div className="absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center text-center px-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <h1 className="font-bold text-3xl mb-2">Welcome Back!</h1>
              <p className="text-sm font-light mb-6">To keep connected with us please login with your personal info</p>
              <button
                className="ghost bg-transparent border border-white text-white px-10 py-3 rounded-full font-bold hover:bg-white hover:text-blue-700 transition text-lg"
                onClick={() => setRightPanelActive(false)}
              >
                Sign In
              </button>
            </div>
            {/* Overlay Right */}
            <div className="absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center text-center px-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <h1 className="font-bold text-3xl mb-2">Hello, Friend!</h1>
              <p className="text-sm font-light mb-6">Enter your personal details and start journey with us</p>
              <button
                className="ghost bg-transparent border border-white text-white px-10 py-3 rounded-full font-bold hover:bg-white hover:text-blue-700 transition text-lg"
                onClick={() => setRightPanelActive(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}