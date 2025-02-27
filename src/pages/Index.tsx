
import { Layout } from "@/components/Layout";
import { AuthForm } from "@/components/auth/AuthForm";
import { CreateLeagueCard } from "@/components/home/CreateLeagueCard";
import { WelcomeHeader } from "@/components/home/WelcomeHeader";

const Index = () => {
  // Clear any existing user data on initial page load
  localStorage.removeItem("currentUser");
  
  const currentUser = localStorage.getItem("currentUser");

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.reload();
  };

  return (
    <Layout>
      <div className="space-y-16">
        <WelcomeHeader />
        <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
          {!currentUser ? (
            <AuthForm />
          ) : (
            <CreateLeagueCard onLogout={handleLogout} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
