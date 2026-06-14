import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useFriendsList } from "@/hooks/postHooks";
import { useEffect, useMemo, useRef } from "react";
import { SkeletonRequest } from "../skeleton/RequestSkeleton";
import { Link, useNavigate } from "react-router-dom";
import { BadgeCheck, MapPin, Users } from "lucide-react";
import { Button } from "../ui/button";

export const FriendCard = ({ tabValue }) => {
  const navigate = useNavigate();
  const loadMoreRef = useRef(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFriendsList();

  const allFriends = useMemo(() => {
    return data?.pages?.flatMap((page) => page?.friends || []) || [];
  }, [data]);

  const friends = useMemo(() => {
    return allFriends.filter((item) => item?.isFriends === true);
  }, [allFriends]);

  const onlineFriends = useMemo(() => {
    return allFriends.filter(
      (item) => item?.from?.isOnline === true && item?.isFriends === true,
    );
  }, [allFriends]);

  const friendsData = tabValue === "online" ? onlineFriends : friends;

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <SkeletonRequest />;
  }

  if (friendsData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <Users className="h-6 w-6 text-slate-400" />
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          No data found
        </p>
      </div>
    );
  }

  return (
    <>
      {friendsData.map((item) => {
        const friendId = item?.from?._id || item?.to?._id || item?._id;

        return (
          <Link key={friendId} to={`/users/${item?.from?._id}`}>
            <Card className="bg-card shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-row items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                      <AvatarImage
                        className="h-full w-full cursor-pointer object-cover object-top"
                        src={item?.from?.profileImage || "/placeholder.svg"}
                      />
                      <AvatarFallback className="text-base font-semibold text-emerald-700 sm:text-xl">
                        {item?.from?.userName?.charAt(0).toUpperCase() || "-"}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={`absolute -bottom-0 right-1 h-3 w-3 rounded-full border-2 border-background ${
                        item?.from?.isOnline ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-foreground sm:text-md">
                      {item?.from?.userName}
                      {item?.from?.isVerified && (
                        <BadgeCheck className="h-4 w-4 fill-blue-500 text-white sm:h-5 sm:w-5" />
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                      <MapPin className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                      <span>{item?.from?.address || "-"}</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(
                      `/messages?userId=${item?.from?._id}&name=${item?.from?.userName}`,
                    );
                  }}
                  className="w-28 h-8 rounded-lg text-xs font-semibold shadow-none cursor-pointer"
                >
                  Message
                </Button>
              </CardContent>
            </Card>
          </Link>
        );
      })}

      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage ? <SkeletonRequest /> : null}
        {!hasNextPage && friendsData.length > 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No more friends
          </p>
        ) : null}
      </div>
    </>
  );
};
