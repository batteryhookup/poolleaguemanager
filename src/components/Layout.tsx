
import { MainNav } from "./MainNav";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <MainNav />
          <Link to="/account">
            <Button variant="ghost" className="font-medium">
              My Account
            </Button>
          </Link>
        </div>
      </header>
      <main className="container py-6 animate-fadeIn">{children}</main>
    </div>
  );
}
