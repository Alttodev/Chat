import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MessageCircle,
  UserMinus,
  Check,
  X,
  Users,
  Clock,
} from "lucide-react";

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Mock data for friends
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

  // Mock data for friend requests
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
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineFriends = friends.filter((friend) => friend.isOnline);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-white text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{friends.length}</p>
              <p className="text-sm text-gray-500">Total Friends</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="h-5 w-5 bg-green-500 rounded-full" />
            </div>
            <div>
              <p className="text-2xl font-bold">{onlineFriends.length}</p>
              <p className="text-sm text-gray-500">Online Now</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{friendRequests.length}</p>
              <p className="text-sm text-gray-500">Pending Requests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
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

        {/* All Friends */}
        <TabsContent value="all" className="grid gap-4">
          {filteredFriends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </TabsContent>

        {/* Online Friends */}
        <TabsContent value="online" className="grid gap-4">
          {onlineFriends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} onlineOnly />
          ))}
        </TabsContent>

        {/* Friend Requests */}
        <TabsContent value="requests" className="grid gap-4">
          {friendRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* 🔹 Friend Card Component */
const FriendCard = ({ friend, onlineOnly }) => (
  <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-12 w-12  text-emerald-600">
            <AvatarImage src={friend.avatar} alt={friend.name} />
            <AvatarFallback>
              {friend.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div
            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
              friend.isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </div>

        {/* Info */}
        <div>
          <h3 className="font-semibold">{friend.name}</h3>
          <p className="text-sm text-gray-500">{friend.username}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {!onlineOnly && !friend.isOnline && friend.lastSeen && (
              <span className="text-xs text-gray-400">
                Last seen {friend.lastSeen}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Button
          size="sm"
          variant="default"
          className="w-full sm:w-auto cursor-pointer bg-emerald-600 text-white hover:bg-emerald-600"
        >
          <MessageCircle className="h-3 w-3 mr-2" />
          Chat
        </Button>
      </div>
    </CardContent>
  </Card>
);

/* 🔹 Friend Request Card */
const RequestCard = ({ request }) => (
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
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">
              Requested {request.requestDate}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto cursor-pointer"
        >
          <Check className="h-4 w-4 mr-2" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full sm:w-auto text-red-600 border-red-600 hover:bg-red-50 cursor-pointer"
        >
          <X className="h-4 w-4 mr-2" />
          Decline
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default Friends;
