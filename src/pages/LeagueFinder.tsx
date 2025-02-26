
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface League {
  id: number;
  name: string;
  location: string;
  createdAt: string;
}

const LeagueFinder = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    setLeagues(storedLeagues);
  }, []);

  const filteredLeagues = leagues.filter(
    (league) =>
      league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      league.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedLeagues = [...filteredLeagues].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">League Finder</h1>
          <p className="text-gray-500">
            Find leagues by name or location
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search leagues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>League Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeagues.map((league) => (
                <TableRow key={league.id}>
                  <TableCell className="font-medium">{league.name}</TableCell>
                  <TableCell>{league.location}</TableCell>
                  <TableCell>
                    {new Date(league.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Join League
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sortedLeagues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No leagues found. Try a different search term or create a new league.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default LeagueFinder;

