
import { toast } from "@/hooks/use-toast";

export const initializeTestData = () => {
  // Clear all existing data
  localStorage.clear();

  // Initialize empty arrays for core data structures
  localStorage.setItem("users", JSON.stringify([]));
  localStorage.setItem("leagues", JSON.stringify([]));
  localStorage.setItem("teams", JSON.stringify([]));
  
  // Remove current user if any
  localStorage.removeItem("currentUser");
  
  toast({
    title: "Data Reset Complete",
    description: "All data has been cleared. You can now create new accounts and teams.",
  });
};
