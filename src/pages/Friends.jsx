import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCards } from "@/components/Friends/StatusCard";
import { FriendCard } from "@/components/Friends/FriendCard";
import { RequestCard } from "@/components/Friends/RequestCard";
import { useFriendsCount } from "@/hooks/postHooks";
import { useLocation } from "react-router-dom";

const Friends = () => {
  const location = useLocation();
  const defaultTab = location.state?.tab || "all";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { data: count } = useFriendsCount();
  const countData = useMemo(() => count, [count]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4  space-y-8">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-6 rounded-lg hidden sm:block">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Friends</h1>
            <p className="text-white/90">
              Connect and stay in touch with your network
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:block">
      <StatsCards
        total={countData?.totalFriends}
        online={countData?.totalOnline}
        requests={countData?.totalRequests}
        />
        </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="cursor-pointer">
            All Friends
          </TabsTrigger>
          <TabsTrigger value="online" className="cursor-pointer">
            Online
          </TabsTrigger>
          <TabsTrigger value="requests" className="cursor-pointer">
            Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="grid gap-4">
          <FriendCard />
        </TabsContent>

        <TabsContent value="online" className="grid gap-4">
          <FriendCard tabValue="online" />
        </TabsContent>

        <TabsContent value="requests" className="grid gap-4">
          <RequestCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Friends;
