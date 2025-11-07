import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { showError, showSuccess } from "@/utils/toast";
import { UserPlus, Check, X, Loader2 } from "lucide-react";
import type { Profile, Friend } from "@/types";
import { useUserData } from "@/hooks/use-user-data";

interface FriendsManagerProps {
  onFriendshipChange: () => void;
}

// Helper function to get the friend's profile from a friendship object
const getFriendProfile = (friendship: any, currentUserId: string): Profile => {
    const friendProfileData = friendship.user_id === currentUserId 
        ? friendship.friend_profile 
        : friendship.user_profile;
    
    // Handle potential array return from Supabase join
    const profileObject = Array.isArray(friendProfileData) ? friendProfileData[0] : friendProfileData;
    
    return profileObject as Profile;
};

export const FriendsManager = ({ onFriendshipChange }: FriendsManagerProps) => {
  const { profile, friends: acceptedFriends, isLoading: isUserDataLoading } = useUserData();
  const [email, setEmail] = useState("");
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUserId = profile?.id;

  const fetchPendingRequests = useCallback(async () => {
    if (!currentUserId) return;

    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        status,
        user_id,
        friend_id,
        created_at,
        friend_profile: friend_id (id, first_name, last_name),
        user_profile: user_id (id, first_name, last_name)
      `)
      .eq('status', 'pending')
      .eq('friend_id', currentUserId); // Requests sent TO the current user

    if (error) {
      console.error("Error fetching pending requests:", error);
      showError("Failed to load pending friend requests.");
    } else {
      setPendingRequests(data as Friend[]);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !currentUserId) return;

    setIsSubmitting(true);

    try {
      // 1. Use the Edge Function to get the friend's ID from their email
      const { data, error: functionError } = await supabase.functions.invoke('get-user-by-email', {
        body: { email },
      });

      if (functionError) {
        throw new Error(functionError.message);
      }
      
      const friendId = data.userId;

      if (!friendId) {
        showError("User with that email was not found.");
        setIsSubmitting(false);
        return;
      }

      if (friendId === currentUserId) {
          showError("You cannot add yourself as a friend.");
          setIsSubmitting(false);
          return;
      }

      // 2. Check if friendship already exists (pending or accepted)
      const { data: existingFriendship } = await supabase
          .from('friends')
          .select('id, status')
          .or(`and(user_id.eq.${currentUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${currentUserId})`)
          .limit(1);

      if (existingFriendship && existingFriendship.length > 0) {
          showError(`Friendship already exists with status: ${existingFriendship[0].status}`);
          setIsSubmitting(false);
          return;
      }

      // 3. Send request
      const { error: insertError } = await supabase
        .from("friends")
        .insert([{ user_id: currentUserId, friend_id: friendId, status: 'pending' }]);

      if (insertError) {
        throw insertError;
      }
      
      showSuccess("Friend request sent!");
      setEmail("");

    } catch (error: any) {
        console.error("Error sending friend request:", error);
        const errorMessage = error.message.includes("User not found") 
            ? "User with that email was not found."
            : "Failed to send friend request.";
        showError(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleUpdateFriendship = async (friendshipId: string, newStatus: 'accepted' | 'blocked') => {
    const { error } = await supabase
      .from('friends')
      .update({ status: newStatus })
      .match({ id: friendshipId });

    if (error) {
      console.error(`Error updating friendship to ${newStatus}:`, error);
      showError(`Failed to ${newStatus} friend request.`);
    } else {
      showSuccess(`Friend request ${newStatus}.`);
      fetchPendingRequests();
      onFriendshipChange(); // Trigger re-fetch of accepted friends/todos
    }
  };

  const getDisplayName = (p: Profile) => {
    if (p.first_name || p.last_name) {
        return `${p.first_name || ''} ${p.last_name || ''}`.trim();
    }
    return p.id.substring(0, 8); // Fallback to truncated ID
  }

  if (isUserDataLoading) {
    return <Loader2 className="h-6 w-6 animate-spin mx-auto" />;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Friends Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Add Friend Form */}
        <form onSubmit={handleSendRequest} className="flex space-x-2">
          <Input
            type="email"
            placeholder="Enter Friend's Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Friend's Email"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
            Add
          </Button>
        </form>

        <Separator />

        {/* Pending Requests */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Pending Requests ({pendingRequests.length})</h3>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending requests.</p>
          ) : (
            <div className="space-y-2">
              {pendingRequests.map((f) => {
                const senderProfile = getFriendProfile(f, currentUserId!);
                return (
                    <div key={f.id} className="flex justify-between items-center p-2 border rounded-md">
                        <span className="text-sm">{getDisplayName(senderProfile)}</span>
                        <div className="space-x-2">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleUpdateFriendship(f.id, 'accepted')}
                                aria-label="Accept friend request"
                            >
                                <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleUpdateFriendship(f.id, 'blocked')}
                                aria-label="Reject friend request"
                            >
                                <X className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    </div>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* Accepted Friends */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Accepted Friends ({acceptedFriends.length})</h3>
          {acceptedFriends.length === 0 ? (
            <p className="text-sm text-muted-foreground">No accepted friends yet.</p>
          ) : (
            <div className="space-y-2">
              {acceptedFriends.map((friend) => (
                <div key={friend.id} className="flex justify-between items-center p-2 border rounded-md bg-secondary/50">
                  <span className="text-sm font-medium">{getDisplayName(friend)}</span>
                  {/* Future: Add options to remove friend */}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};