
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";

export const CreateLeagueCard = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <Card className="md:col-span-2 transition-transform hover:scale-105">
      <CardHeader>
        <Trophy className="w-8 h-8 text-emerald-600" />
        <CardTitle>Create League</CardTitle>
        <CardDescription>Start a new pool league</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link to="/leagues/new">
          <Button className="w-full">Create League</Button>
        </Link>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onLogout}
        >
          Logout
        </Button>
      </CardContent>
    </Card>
  );
};
