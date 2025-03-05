// This script completely nukes all data from localStorage
// It's a fresh start with no leagues, no sessions, nothing

// Function to clear all localStorage data
function nukeAllData() {
  console.log("Starting nuclear data deletion...");
  
  // Get all keys in localStorage
  const allKeys = Object.keys(localStorage);
  console.log(`Found ${allKeys.length} items in localStorage`);
  
  // Track what was deleted
  const deletedItems = {
    count: 0,
    keys: []
  };
  
  // Delete each item
  allKeys.forEach(key => {
    console.log(`Deleting: ${key}`);
    localStorage.removeItem(key);
    deletedItems.count++;
    deletedItems.keys.push(key);
  });
  
  console.log("Nuclear deletion complete!");
  console.log(`Deleted ${deletedItems.count} items`);
  
  return deletedItems;
}

// Set up event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const nukeButton = document.getElementById('nuke-button');
  const confirmButton = document.getElementById('confirm-button');
  const cancelButton = document.getElementById('cancel-button');
  const confirmationContainer = document.getElementById('confirmation-container');
  const confirmContainer = document.getElementById('confirm-container');
  const countdownContainer = document.getElementById('countdown-container');
  const countdownElement = document.getElementById('countdown');
  
  // First nuke button click
  nukeButton.addEventListener('click', () => {
    confirmationContainer.classList.add('hidden');
    confirmContainer.classList.remove('hidden');
  });
  
  // Cancel button click
  cancelButton.addEventListener('click', () => {
    confirmContainer.classList.add('hidden');
    confirmationContainer.classList.remove('hidden');
  });
  
  // Confirm button click - start countdown
  confirmButton.addEventListener('click', () => {
    confirmContainer.classList.add('hidden');
    countdownContainer.classList.remove('hidden');
    
    let seconds = 5;
    countdownElement.textContent = seconds;
    
    const interval = setInterval(() => {
      seconds--;
      countdownElement.textContent = seconds;
      
      if (seconds <= 0) {
        clearInterval(interval);
        executeNuke();
      }
    }, 1000);
  });
  
  // Execute the nuke operation
  function executeNuke() {
    try {
      const result = nukeAllData();
      console.log("Deletion results:", result);
      
      // Redirect to home page after deletion
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("Error during data deletion:", error);
      alert(`Error during data deletion: ${error.message}`);
    }
  }
}); 