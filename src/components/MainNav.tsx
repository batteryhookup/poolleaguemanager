
import { Link } from "react-router-dom";
import { Search, Trophy, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

export function MainNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const currentUser = localStorage.getItem("currentUser");
      setIsLoggedIn(!!currentUser);
    };

    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

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
      {isLoggedIn && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-sm font-medium transition-colors hover:text-primary">
              <User className="h-4 w-4 mr-2" />
              My Account
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/account/leagues">My Leagues</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/account/teams">My Teams</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/account/stats">My Stats</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}
