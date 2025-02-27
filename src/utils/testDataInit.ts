
import { League } from "@/components/account/types/league";
import { Team } from "@/components/account/types/team";
import { toast } from "@/hooks/use-toast";

export const initializeTestData = () => {
  // Clear all existing data
  localStorage.clear();

  // Set up test users
  const users = [
    { username: "user1", password: "test123" },
    { username: "user2", password: "test123" }
  ];
  localStorage.setItem("users", JSON.stringify(users));
  
  // Set current user as user1
  localStorage.setItem("currentUser", JSON.stringify(users[0]));

  // Set up test leagues with proper dates
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 30);
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 30);

  const testLeagues = [
    {
      id: 1,
      name: "Active League 1",
      location: "Location 1",
      createdAt: today.toISOString(),
      createdBy: "user1",
      password: "league1",
      teams: [],
      type: "team",
      gameType: "casual",
      schedule: [
        {
          date: today.toISOString(),
          startTime: "18:00",
          endTime: "20:00"
        }
      ]
    },
    {
      id: 2,
      name: "Upcoming League 1",
      location: "Location 2",
      createdAt: today.toISOString(),
      createdBy: "user2",
      password: "league2",
      teams: [],
      type: "team",
      gameType: "casual",
      schedule: [
        {
          date: futureDate.toISOString(),
          startTime: "18:00",
          endTime: "20:00"
        }
      ]
    },
    {
      id: 3,
      name: "Archived League 1",
      location: "Location 3",
      createdAt: pastDate.toISOString(),
      createdBy: "user1",
      password: "league3",
      teams: [],
      type: "team",
      gameType: "casual",
      schedule: [
        {
          date: pastDate.toISOString(),
          startTime: "18:00",
          endTime: "20:00"
        }
      ]
    }
  ];
  localStorage.setItem("leagues", JSON.stringify(testLeagues));

  // Set up test teams
  const testTeams = [
    {
      id: 1,
      name: "Team 1",
      password: "team1",
      createdAt: today.toISOString(),
      createdBy: "user1",
      members: ["user1", "user2"]
    },
    {
      id: 2,
      name: "Team 2",
      password: "team2",
      createdAt: today.toISOString(),
      createdBy: "user2",
      members: ["user2", "user1"]
    }
  ];
  localStorage.setItem("teams", JSON.stringify(testTeams));

  toast({
    title: "Test Data Initialized",
    description: "Fresh test data has been set up. You can now switch between user1 and user2 (password: test123)",
  });
};

