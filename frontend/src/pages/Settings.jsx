import { Link } from 'react-router-dom';

export default function Settings() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-gray-600 mb-4">Settings page coming soon!</p>
        <Link to="/account" className="px-4 py-2 bg-blue-700 text-white rounded-md font-medium hover:bg-blue-800 transition">Back to Account</Link>
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