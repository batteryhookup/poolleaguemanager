
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "lucide-react";

export function StatsManagement() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <LineChart className="w-8 h-8 text-emerald-600" />
        <div>
          <CardTitle>My Stats</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Statistics tracking coming soon!</p>
      </CardContent>
    </Card>
  );
}
