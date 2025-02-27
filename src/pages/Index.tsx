
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Trophy, UserCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface User {
  username: string;
  password: string;
  phoneNumber: string;
  zipCode: string;
}

const Index = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (isLogin) {
      const user = users.find((u: User) => 
        u.username === username && u.password === password
      );
      
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        navigate("/account");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid username or password.",
        });
      }
    } else {
      const userExists = users.some((u: User) => u.username === username);
      
      if (userExists) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Username already exists.",
        });
        return;
      }

      const newUser = { username, password, phoneNumber, zipCode };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      navigate("/account");
    }
  };

  const currentUser = localStorage.getItem("currentUser");

  return (
    <Layout>
      <div className="space-y-16">
        <div className="text-center space-y-8 pt-4">
          <h1 className="text-3xl leading-normal font-bold tracking-tighter sm:text-5xl xl:text-6xl/normal bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-500">
            Pool League Manager
          </h1>
          <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
            Create leagues, manage teams, and run tournaments with ease.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
          {!currentUser ? (
            <Card className="md:col-span-2 transition-transform hover:scale-105">
              <CardHeader>
                <UserCircle2 className="w-8 h-8 text-emerald-600" />
                <CardTitle>{isLogin ? "Login" : "Create Account"}</CardTitle>
                <CardDescription>
                  {isLogin ? "Sign in to your account" : "Create a new account"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {!isLogin && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          pattern="[0-9]{10}"
                          placeholder="1234567890"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">Zip Code</Label>
                        <Input
                          id="zipCode"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          pattern="[0-9]{5}"
                          placeholder="12345"
                          required
                        />
                      </div>
                    </>
                  )}
                  <Button type="submit" className="w-full">
                    {isLogin ? "Login" : "Create Account"}
                  </Button>
                </form>
                <Button
                  variant="link"
                  className="w-full mt-2"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setPassword("");
                    setConfirmPassword("");
                    if (!isLogin) {
                      setPhoneNumber("");
                      setZipCode("");
                    }
                  }}
                >
                  {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
                </Button>
              </CardContent>
            </Card>
          ) : (
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
                  onClick={() => {
                    localStorage.removeItem("currentUser");
                    window.location.reload();
                  }}
                >
                  Logout
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;

