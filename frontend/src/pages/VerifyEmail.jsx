import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('pending'); // 'pending', 'success', 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    axios.get(`/api/auth/verify-email?token=${token}`)
      .then(res => {
        setStatus('success');
        setMessage(res.data.message || 'Email verified! You can now log in.');
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed.');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
        {status === 'pending' && <div className="text-blue-600">Verifying...</div>}
        {status === 'success' && <div className="text-green-600 font-medium mb-4">{message}</div>}
        {status === 'error' && <div className="text-red-600 font-medium mb-4">{message}</div>}
        <button
          className="mt-4 px-6 py-2 bg-blue-700 text-white rounded-md font-medium hover:bg-blue-800 transition"
          onClick={() => navigate('/auth')}
        >
          Go to Login
        </button>
      </div>
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }
      `}</style>
    </div>
  );
} 