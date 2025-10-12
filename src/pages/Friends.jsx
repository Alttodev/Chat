import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { StatsCards } from "@/components/Friends/StatusCard";
import { FriendCard } from "@/components/Friends/FriendCard";
import { RequestCard } from "@/components/Friends/RequestCard";
import { useFriendsCount } from "@/hooks/postHooks";

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { data: count } = useFriendsCount();
  const countData = useMemo(() => count, [count]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4  space-y-8">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-6 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Friends</h1>
            <p className="text-white/90">
              Connect and stay in touch with your network
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-white text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsCards
        total={countData?.totalFriends}
        online={countData?.totalOnline}
        requests={countData?.totalRequests}
      />

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
