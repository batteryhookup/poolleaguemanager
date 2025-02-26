
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MyStats = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Stats</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Statistics tracking coming soon!
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MyStats;
