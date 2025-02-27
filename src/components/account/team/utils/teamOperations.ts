
import { type ToastProps } from "@/components/ui/toast";
import { type Team } from "../../types/team";

export const updateTeamInStorage = (updatedTeam: Team) => {
  const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
  const updatedTeams = allTeams.map((t: Team) =>
    t.id === updatedTeam.id ? updatedTeam : t
  );
  localStorage.setItem("teams", JSON.stringify(updatedTeams));
  window.dispatchEvent(new Event("storage"));
};

export const handlePlayerRemoval = (
  team: Team,
  playerToRemove: string,
  password: string,
  toast: (props: ToastProps) => void
): boolean => {
  if (password !== team.password) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Incorrect team password.",
    });
    return false;
  }

  const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
  const updatedTeams = allTeams.map((t: Team) => {
    if (t.id === team.id) {
      return {
        ...t,
        members: t.members.filter((member) => member !== playerToRemove),
      };
    }
    return t;
  });
  localStorage.setItem("teams", JSON.stringify(updatedTeams));
  window.dispatchEvent(new Event("storage"));
  return true;
};

export const handleCaptainTransfer = (
  teamId: number,
  newCaptain: string,
  teamName: string
) => {
  const pendingTransfers = JSON.parse(
    localStorage.getItem("pendingCaptainTransfers") || "[]"
  );
  pendingTransfers.push({
    teamId,
    newCaptain,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(
    "pendingCaptainTransfers",
    JSON.stringify(pendingTransfers)
  );

  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  notifications.push({
    id: Date.now(),
    userId: newCaptain,
    message: `You have been selected as the new team captain for "${teamName}". Please accept the role and set a new team password.`,
    read: false,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem("notifications", JSON.stringify(notifications));
  window.dispatchEvent(new Event("storage"));
};
