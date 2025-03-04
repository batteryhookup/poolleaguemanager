import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8">
        <h1 className="text-5xl font-bold text-white mb-4">
          Welcome to <span className="text-blue-500">Pool League Manager</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Manage your pool leagues, track scores, and organize tournaments with ease.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 mx-2"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/leagues/find')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 mx-2"
          >
            Find a League
          </button>
          <div className="mt-4 text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-500 hover:text-blue-400 underline"
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 