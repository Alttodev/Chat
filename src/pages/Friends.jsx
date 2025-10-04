import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { StatsCards } from "@/components/Friends/StatusCard";
import { FriendCard } from "@/components/Friends/FriendCard";
import { RequestCard } from "@/components/Friends/RequestCard";

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const friends = [
    {
      id: "1",
      name: "Sarah Johnson",
      username: "@sarah_j",
      avatar: "/professional-woman.png",
      isOnline: true,
      mutualFriends: 12,
    },
    {
      id: "2",
      name: "Mike Chen",
      username: "@mike_c",
      avatar: "/man-asian-professional.jpg",
      isOnline: true,
      mutualFriends: 8,
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      username: "@emily_r",
      avatar: "/woman-latina-professional.jpg",
      isOnline: false,
      lastSeen: "2 hours ago",
      mutualFriends: 15,
    },
    {
      id: "4",
      name: "David Kim",
      username: "@david_k",
      avatar: "/man-korean-professional.jpg",
      isOnline: false,
      lastSeen: "1 day ago",
      mutualFriends: 6,
    },
    {
      id: "5",
      name: "Lisa Thompson",
      username: "@lisa_t",
      avatar: "/professional-blonde-woman.png",
      isOnline: true,
      mutualFriends: 20,
    },
  ];
  const friendRequests = [
    {
      id: "1",
      name: "Alex Martinez",
      username: "@alex_m",
      avatar: "/man-hispanic-professional.jpg",
      mutualFriends: 5,
      requestDate: "2 days ago",
    },
    {
      id: "2",
      name: "Jessica Wong",
      username: "@jessica_w",
      avatar: "/woman-asian-professional.jpg",
      mutualFriends: 3,
      requestDate: "1 week ago",
    },
  ];

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const onlineFriends = friends.filter((f) => f.isOnline);

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
        total={friends.length}
        online={onlineFriends.length}
        requests={friendRequests.length}
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
          {filteredFriends.map((f) => (
            <FriendCard key={f.id} friend={f} />
          ))}
        </TabsContent>

        <TabsContent value="online" className="grid gap-4">
          {onlineFriends.map((f) => (
            <FriendCard key={f.id} friend={f} onlineOnly />
          ))}
        </TabsContent>

        <TabsContent value="requests" className="grid gap-4">
          <RequestCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Friends;
