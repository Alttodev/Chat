import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";

export const RequestCard = ({ request }) => (
  <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 text-emerald-600">
          <AvatarImage src={request.avatar} alt={request.name} />
          <AvatarFallback>
            {request.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{request.name}</h3>
          <p className="text-sm text-gray-500">{request.username}</p>
          <span className="text-xs text-gray-400">
            Requested {request.requestDate}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
        >
          <Check className="h-4 w-4 mr-2" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-600 hover:bg-red-50 cursor-pointer"
        >
          <X className="h-4 w-4 mr-2" />
          Decline
        </Button>
      </div>
    </CardContent>
  </Card>
);
