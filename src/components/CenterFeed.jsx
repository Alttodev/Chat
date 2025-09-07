import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

export function CenterFeed() {
  const posts = [
    {
      id: 1,
      author: "Sarah Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      time: "2 hours ago",
      content:
        "Just finished an amazing hike in the mountains! The view was absolutely breathtaking. Nature never fails to inspire me. 🏔️",
      image: "/placeholder.svg?height=300&width=500",
      likes: 24,
      comments: 8,
      shares: 3,
    },
    {
      id: 2,
      author: "Mike Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      time: "4 hours ago",
      content:
        "Working on a new project and loving every minute of it! The creative process is so rewarding when you see your ideas come to life.",
      likes: 15,
      comments: 5,
      shares: 2,
    },
    {
      id: 3,
      author: "Emma Davis",
      avatar: "/placeholder.svg?height=40&width=40",
      time: "6 hours ago",
      content:
        "Coffee and code - the perfect combination for a productive morning! ☕️ What's everyone else working on today?",
      image: "/placeholder.svg?height=300&width=500",
      likes: 32,
      comments: 12,
      shares: 5,
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 space-y-6">
      {/* Create Post */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 text-emerald-600">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind, John?"
                className="min-h-[60px] resize-none border-0 bg-muted focus:bg-background text-sm sm:text-base"
              />
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0 mt-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-600 text-white cursor-pointer text-xs sm:text-sm"
                  >
                    Photo/Video
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-600 cursor-pointer text-xs sm:text-sm"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 text-emerald-600">
                  <AvatarImage src={post.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {post.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm sm:text-base">
                    {post.author}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {post.time}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-foreground mb-4 leading-relaxed text-sm sm:text-base">
              {post.content}
            </p>

            {post.image && (
              <div className="mb-4 -mx-4 sm:-mx-6">
                <img
                  src={post.image || "/placeholder.svg"}
                  alt="Post content"
                  className="w-full h-auto max-h-[400px] object-cover rounded-md"
                />
              </div>
            )}

            {/* Post Stats */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-3 pb-3 border-b border-border">
              <span>{post.likes} likes</span>
              <div className="flex gap-4">
                <span>{post.comments} comments</span>
                <span>{post.shares} shares</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs sm:text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                Like
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs sm:text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Comment
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs sm:text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
              >
                <Share className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
