import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8">
        <h1 className="text-5xl font-bold text-white mb-4">
          Welcome to <span className="text-blue-500">MyWebsite</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Your journey begins here. Join our community and start exploring today.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
        >
          Start Playing
        </button>
      </div>
    </div>
  );
} 