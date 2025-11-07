import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FriendsList from "@/components/FriendsList";
import FriendRequests from "@/components/FriendRequests";
import AddFriend from "@/components/AddFriend";

const FriendsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Friends</h1>
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">My Friends</TabsTrigger>
          <TabsTrigger value="requests">Friend Requests</TabsTrigger>
          <TabsTrigger value="add">Add Friend</TabsTrigger>
        </TabsList>
        <TabsContent value="friends">
          <FriendsList />
        </TabsContent>
        <TabsContent value="requests">
          <FriendRequests />
        </TabsContent>
        <TabsContent value="add">
          <AddFriend />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FriendsPage;