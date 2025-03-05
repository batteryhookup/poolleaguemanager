import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MainNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link to="/leagues/find">
        <Button variant="ghost" className="text-sm font-medium transition-colors hover:text-primary">
          <Search className="h-4 w-4 mr-2" />
          Find League
        </Button>
      </Link>
      <Link to="/reset.html">
        <Button variant="ghost" className="text-sm font-medium transition-colors hover:text-primary text-red-500">
          Reset Data
        </Button>
      </Link>
      <Link to="/fix-leagues.html">
        <Button variant="ghost" className="text-sm font-medium transition-colors hover:text-primary text-orange-500">
          Fix Duplicates
        </Button>
      </Link>
      <Link to="/nuke.html">
        <Button variant="ghost" className="text-sm font-medium transition-colors hover:text-primary text-red-700 font-bold">
          NUKE ALL DATA
        </Button>
      </Link>
      <Link to="/admin.html">
        <Button variant="ghost" className="text-sm font-medium transition-colors hover:text-primary text-purple-500 font-bold">
          ADMIN
        </Button>
      </Link>
    </nav>
  );
}