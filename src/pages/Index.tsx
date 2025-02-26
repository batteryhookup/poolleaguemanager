
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Trophy, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-500">
            Sports League Manager
          </h1>
          <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
            Create leagues, manage teams, and track tournaments with ease.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 animate-slideUp">
          <Card className="transition-transform hover:scale-105">
            <CardHeader>
              <Trophy className="w-8 h-8 text-emerald-600" />
              <CardTitle>Create League</CardTitle>
              <CardDescription>Start a new sports league</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/leagues/new">
                <Button className="w-full">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-transform hover:scale-105">
            <CardHeader>
              <Users className="w-8 h-8 text-emerald-600" />
              <CardTitle>Manage Teams</CardTitle>
              <CardDescription>Add or edit team details</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/teams">
                <Button className="w-full" variant="outline">View Teams</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-transform hover:scale-105">
            <CardHeader>
              <Calendar className="w-8 h-8 text-emerald-600" />
              <CardTitle>Schedule Games</CardTitle>
              <CardDescription>Plan your league nights</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/schedule">
                <Button className="w-full" variant="outline">Open Calendar</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
