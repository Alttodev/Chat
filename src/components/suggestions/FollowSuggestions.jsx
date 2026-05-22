import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRequestList, useRecommendedConnections } from "@/hooks/postHooks";
import { cn } from "@/lib/utils";
import { Compass, MoreHorizontal, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { FollowSuggestionsSkeleton } from "./FollowSuggestionsSkeleton";
import RightUserCard from "../RightUserCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MOBILE_FOLLOW_SUGGESTIONS_HIDDEN_KEY = "mobile-follow-suggestions-hidden";

const getEntityId = (value) => {
  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return String(value?.id ?? value?._id ?? "");
};

export function FollowSuggestions({ compact = false, className }) {
  const navigate = useNavigate();
  const { profileId } = useAuthStore();
  const { data: recommendationsData, isLoading: isRecommendationsLoading } =
    useRecommendedConnections();
  const { data: requestListData, isLoading: isRequestListLoading } =
    useRequestList();
  const [isHiddenOnMobile, setIsHiddenOnMobile] = useState(false);

  useEffect(() => {
    if (!compact) return;
    const hidden =
      sessionStorage.getItem(MOBILE_FOLLOW_SUGGESTIONS_HIDDEN_KEY) === "1";
    setIsHiddenOnMobile(hidden);
  }, [compact]);

  const pendingOutgoingIds = useMemo(() => {
    const requestItems =
      requestListData?.requests ||
      requestListData?.followRequests ||
      requestListData?.data?.requests ||
      requestListData?.data ||
      [];

    if (!Array.isArray(requestItems) || !profileId) {
      return new Set();
    }

    return new Set(
      requestItems
        .filter(
          (item) => String(item?.status || "").toLowerCase() === "pending",
        )
        .filter((item) => getEntityId(item?.from) === String(profileId))
        .map((item) => getEntityId(item?.to))
        .filter(Boolean)
        .map((id) => String(id)),
    );
  }, [requestListData, profileId]);

  const suggestions = useMemo(() => {
    const recommended = recommendationsData?.suggestions || [];

    return recommended.filter((user) => {
      const userId = user?.id ?? user?._id;
      if (!userId) return false;

      const normalizedUserId = String(userId);
      return !pendingOutgoingIds.has(normalizedUserId);
    });
  }, [recommendationsData, pendingOutgoingIds]);

  const visibleSuggestions = compact
    ? suggestions.slice(0, 8)
    : suggestions.slice(0, 4);

  const isRequestLoading = isRecommendationsLoading || isRequestListLoading;

  if (isRequestLoading) {
    return <FollowSuggestionsSkeleton compact={compact} />;
  }

  if (compact && isHiddenOnMobile) {
    return null;
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full cursor-pointer"
                aria-label="Open suggestions menu"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-10">
              <DropdownMenuItem
                onClick={() => navigate("/userslist")}
                className="cursor-pointer"
              >
                View all
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setIsHiddenOnMobile(true);
                  sessionStorage.setItem(
                    MOBILE_FOLLOW_SUGGESTIONS_HIDDEN_KEY,
                    "1",
                  );
                }}
                className="cursor-pointer"
              >
                Hide
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            className="h-10 w-full rounded-full  border-emerald-200 text-sm font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
          >
            View more suggestions
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
