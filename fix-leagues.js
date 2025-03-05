// This script will fix the league duplication issue by ensuring unique leagues by name per user

// Function to fix leagues in localStorage
function fixLeagues() {
  // Get all leagues from localStorage
  const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
  console.log("Original leagues count:", allLeagues.length);
  
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  console.log("Current user:", currentUser.username);
  
  // Group leagues by name (case insensitive) and user
  const leaguesByNameAndUser = {};
  
  allLeagues.forEach(league => {
    const key = `${league.createdBy.toLowerCase()}_${league.name.toLowerCase()}`;
    if (!leaguesByNameAndUser[key]) {
      leaguesByNameAndUser[key] = [];
    }
    leaguesByNameAndUser[key].push(league);
  });
  
  // For each group, keep only the league with the most sessions
  const fixedLeagues = [];
  
  Object.values(leaguesByNameAndUser).forEach(leagues => {
    if (leagues.length === 1) {
      // No duplicates, just add it
      fixedLeagues.push(leagues[0]);
    } else {
      console.log(`Found ${leagues.length} duplicates for league: ${leagues[0].name}`);
      
      // Sort by number of sessions (descending)
      leagues.sort((a, b) => b.sessions.length - a.sessions.length);
      
      // Get the league with the most sessions
      const primaryLeague = leagues[0];
      
      // Merge all sessions from other leagues into the primary league
      const allSessions = [];
      const sessionIds = new Set();
      
      // First add all sessions from the primary league
      primaryLeague.sessions.forEach(session => {
        allSessions.push(session);
        sessionIds.add(session.id);
      });
      
      // Then add unique sessions from other leagues
      for (let i = 1; i < leagues.length; i++) {
        leagues[i].sessions.forEach(session => {
          if (!sessionIds.has(session.id)) {
            // Update the parentLeagueId to match the primary league
            session.parentLeagueId = primaryLeague.id;
            allSessions.push(session);
            sessionIds.add(session.id);
          }
        });
      }
      
      // Update the primary league with all sessions
      primaryLeague.sessions = allSessions;
      
      // Add the merged league to the fixed leagues
      fixedLeagues.push(primaryLeague);
    }
  });
  
  console.log("Fixed leagues count:", fixedLeagues.length);
  console.log("Removed duplicates:", allLeagues.length - fixedLeagues.length);
  
  // Save the fixed leagues back to localStorage
  localStorage.setItem("leagues", JSON.stringify(fixedLeagues));
  
  return {
    original: allLeagues.length,
    fixed: fixedLeagues.length,
    removed: allLeagues.length - fixedLeagues.length
  };
}

// Execute the fix
const result = fixLeagues();
console.log("Fix completed:", result);

// Return the result for display
result; 