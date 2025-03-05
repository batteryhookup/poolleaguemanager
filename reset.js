// Script to clear all localStorage data
function clearAllData() {
  localStorage.clear();
  console.log("All localStorage data has been cleared");
  alert("All data cleared successfully! The page will now reload.");
  window.location.href = "/";
}

// Auto-execute when loaded directly
if (document.readyState === "complete" || document.readyState === "interactive") {
  clearAllData();
} else {
  document.addEventListener("DOMContentLoaded", clearAllData);
}
