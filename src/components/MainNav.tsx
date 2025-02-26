
import { Link } from "react-router-dom";
import { Search, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MainNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
      <Link to="/leagues/find">
        <Button variant="ghost" className="text-sm font-medium transition-colors hover:text-primary">
          <Search className="h-4 w-4 mr-2" />
          Find League
        </Button>
      </Link>
      <Link to="/leagues">
        <Button variant="ghost" className="text-sm font-medium transition-colors hover:text-primary">
          <Trophy className="h-4 w-4 mr-2" />
          Leagues
        </Button>
      </Link>
    </nav>
  );
}
