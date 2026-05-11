import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock } from "lucide-react";

export const StatsCards = ({ total, online, requests }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <Card className="bg-card shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Users className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{total}</p>
          <p className="text-sm text-muted-foreground">Total Friends</p>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-card shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <div className="h-5 w-5 bg-green-500 rounded-full" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{online}</p>
          <p className="text-sm text-muted-foreground">Online Now</p>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-card shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Clock className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{requests}</p>
          <p className="text-sm text-muted-foreground">Pending Requests</p>
        </div>
      </CardContent>
    </Card>
  </div>
);
