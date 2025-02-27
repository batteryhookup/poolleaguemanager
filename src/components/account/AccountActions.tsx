
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Users2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AccountActions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
    toast({
      title: "Success",
      description: "Logged out successfully!",
    });
  };

  const handleDeleteAccount = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u: { username: string; password: string }) => 
      u.username === currentUser.username && u.password === password
    );

    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Incorrect password.",
      });
      return;
    }

    const updatedUsers = users.filter((u: { username: string }) => 
      u.username !== currentUser.username
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    const allLeagues = JSON.parse(localStorage.getItem("leagues") || "[]");
    const updatedLeagues = allLeagues.filter(
      (league: { createdBy: string }) => league.createdBy !== currentUser.username
    );
    localStorage.setItem("leagues", JSON.stringify(updatedLeagues));

    localStorage.removeItem("currentUser");

    toast({
      title: "Success",
      description: "Your account has been deleted.",
    });
    
    navigate("/");
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Users2 className="w-8 h-8 text-emerald-600" />
          <div>
            <CardTitle>Log Out</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="w-full"
          >
            Log Out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Trash2 className="w-8 h-8 text-destructive" />
          <div>
            <CardTitle>Delete Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete My Account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Confirm your password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="w-full"
                >
                  Delete Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
}
