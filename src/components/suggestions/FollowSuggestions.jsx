import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserProfiles } from "@/hooks/authHooks";
import { useQueries } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ChevronRight, Compass, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { getFollowRequestInfo } from "@/api/axios";
import { FollowSuggestionsSkeleton } from "./FollowSuggestionsSkeleton";
import RightUserCard from "../RightUserCard";

export function FollowSuggestions({ compact = false, className }) {
  const navigate = useNavigate();
  const { profileId } = useAuthStore();
  const { data, isLoading } = useUserProfiles();

  const suggestions = useMemo(() => {
    const profiles = data?.profiles || [];
    return profiles.filter((user) => (user?.id ?? user?._id) !== profileId);
  }, [data, profileId]);

  const suggestionRequests = useQueries({
    queries: suggestions.map((user) => {
      const userId = user?.id ?? user?._id;
      return {
        queryKey: ["request_info", profileId, userId],
        queryFn: () =>
          getFollowRequestInfo({ fromId: profileId, toId: userId }),
        enabled: Boolean(profileId && userId),
        refetchOnWindowFocus: false,
      };
    }),
  });

  const unfollowedSuggestions = useMemo(() => {
    return suggestions.filter((user, index) => {
      const request = suggestionRequests[index]?.data?.request;
      if (!request) return true;
      return !request.isFriends && request.status !== "pending";
    });
  }, [suggestions, suggestionRequests]);

  const visibleSuggestions = compact
    ? unfollowedSuggestions.slice(0, 8)
    : unfollowedSuggestions.slice(0, 4);

  const isRequestLoading = suggestionRequests.some((query) => query.isLoading);

  if (isLoading || isRequestLoading) {
    return <FollowSuggestionsSkeleton compact={compact} />;
  }

  if (!visibleSuggestions.length) {
    return null;
  }

  if (compact) {
    return (
      <section
        className={cn(
          "w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-border/70 bg-card p-4 shadow-sm",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-foreground sm:text-base">
                Suggested for you
              </h2>
            </div>
            <CardDescription className="text-[12px]  leading-4 sm:text-sm">
              Follow people you may want to connect with.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate("/userslist")}
            className="h-8 rounded-full px-3 text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
          >
            See all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="flex w-full max-w-full gap-3 overflow-x-auto overflow-y-hidden pb-1 pr-1 no-scrollbar snap-x snap-mandatory overscroll-x-contain scroll-smooth">
          {visibleSuggestions.map((user) => (
            <RightUserCard
              key={user?.id ?? user?._id}
              user={user}
              profileId={profileId}
              compact
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <Card
      className={cn("overflow-hidden border-border/70 shadow-sm", className)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold sm:text-lg">
              <Compass className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5" />
              Follow Suggestions
            </CardTitle>
            <CardDescription className="text-[11px] leading-4 sm:text-sm">
              A clean way to discover more people in your network.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {visibleSuggestions.map((user) => (
          <RightUserCard
            key={user?.id ?? user?._id}
            user={user}
            profileId={profileId}
          />
        ))}

        {suggestions.length > visibleSuggestions.length && (
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/userslist")}
            className="h-10 w-full rounded-full border-dashed border-emerald-200 text-sm font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
          >
            View more suggestions
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
