
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users2 } from "lucide-react";

export function TeamManagement() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Users2 className="w-8 h-8 text-emerald-600" />
        <div>
          <CardTitle>My Teams</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Team management coming soon!</p>
      </CardContent>
    </Card>
  );
}
