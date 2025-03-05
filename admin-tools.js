// Admin tools for managing user data on the server

// API URL based on environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5001'
  : 'https://pool-league-manager-backend.onrender.com';

// Function to delete a user from the server
async function deleteUser(username, password) {
  try {
    console.log(`Attempting to delete user: ${username}`);
    
    // First, try to login to verify credentials
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error('Invalid credentials. Please check your username and password.');
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // Now delete the user
    const deleteResponse = await fetch(`${API_URL}/users/${username}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      throw new Error(errorData.message || 'Failed to delete user');
    }
    
    return {
      success: true,
      message: `User ${username} has been deleted from the server`
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      message: error.message || 'An unknown error occurred'
    };
  }
}

// Function to clear all local data
function clearLocalData() {
  console.log("Clearing all local data");
  
  // List of all keys to remove
  const keysToRemove = [
    "leagues",
    "teams",
    "currentUser",
    "userPreferences",
    "sessions",
    "auth",
    "token",
    "user"
  ];
  
  // Remove each key
  keysToRemove.forEach(key => {
    console.log(`Removing ${key} from localStorage`);
    localStorage.removeItem(key);
  });
  
  // Also clear everything else just to be sure
  console.log("Clearing all localStorage");
  localStorage.clear();
  
  console.log("ALL LOCAL DATA CLEARED");
  
  return {
    success: true,
    message: "All data has been completely removed from localStorage"
  };
} 