import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import RightUserCard from "../RightUserCard";
import { useNavigate } from "react-router-dom";

export function UserProfiles({ data }) {
  const navigate = useNavigate();
  const profiles = data?.profiles || [];
  const { profileId } = useAuthStore();
  

  if (!data?.profiles || data?.profiles.length === 0) {
    return <div className="text-center py-10 text-gray-500">No User</div>;
  }
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">People You May Know</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {profiles.slice(0, 4).map((user, index) => {
          return (
            <RightUserCard key={index} user={user} profileId={profileId} />
          );
        })}

        {profiles.length > 4 && (
          <div className="flex justify-center mt-3">
            <button
              onClick={() => navigate("/userslist")}
              className="text-sm text-emerald-600 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
