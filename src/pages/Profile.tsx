export default function Profile() {
  // This is a static profile for now
  const profile = {
    username: 'JohnDoe',
    joinDate: 'March 2024',
    email: 'john@example.com'
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-2xl text-white font-bold">
                  {profile.username[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
                <p className="text-gray-400">Member since {profile.joinDate}</p>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Username</label>
                  <p className="mt-1 text-white">{profile.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Email</label>
                  <p className="mt-1 text-white">{profile.email}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 