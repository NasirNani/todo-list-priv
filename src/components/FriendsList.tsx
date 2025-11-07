import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";
import type { Profile } from "@/types";

const FriendsList = () => {
  const [friends, setFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_friends');

      if (error) {
        console.error("Error fetching friends:", error);
        showError("Could not fetch friends.");
      } else if (data) {
        setFriends(data);
      }
      setLoading(false);
    };

    fetchFriends();
  }, []);

  const removeFriend = async (friendId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('friends')
      .delete()
      .or(`(user_id.eq.${user.id},friend_id.eq.${friendId}),(user_id.eq.${friendId},friend_id.eq.${user.id})`);

    if (error) {
      showError("Failed to remove friend.");
      console.error(error);
    } else {
      showSuccess("Friend removed.");
      setFriends(friends.filter(f => f.id !== friendId));
    }
  };

  if (loading) {
    return <p className="text-center p-4">Loading friends...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Friends</CardTitle>
      </CardHeader>
      <CardContent>
        {friends.length === 0 ? (
          <p>You don't have any friends yet.</p>
        ) : (
          <ul className="space-y-4">
            {friends.map((friend) => (
              <li key={friend.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={friend.avatar_url ?? undefined} />
                    <AvatarFallback>{friend.first_name?.[0]}{friend.last_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{friend.first_name} {friend.last_name}</p>
                  </div>
                </div>
                <Button variant="destructive" onClick={() => removeFriend(friend.id)}>Remove</Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendsList;