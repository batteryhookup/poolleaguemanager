// This script completely nukes all data from localStorage
// It's a fresh start with no leagues, no sessions, nothing

function nukeAllData() {
  console.log("NUKING ALL DATA");
  
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
  
  console.log("ALL DATA NUKED");
  
  return {
    success: true,
    message: "All data has been completely removed from localStorage"
  };
} 