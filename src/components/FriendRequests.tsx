import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";

interface FriendRequest {
  id: string; // friendship id
  sender_profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

const FriendRequests = () => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        sender_profile:profiles!user_id (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    if (error) {
      console.error("Error fetching friend requests:", error);
      showError("Could not fetch friend requests.");
    } else if (data) {
      setRequests(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequest = async (requestId: string, action: 'accept' | 'decline') => {
    if (action === 'accept') {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', requestId);
      if (error) {
        showError('Failed to accept request.');
        console.error(error);
      } else {
        showSuccess('Friend request accepted.');
        fetchRequests();
      }
    } else { // decline
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId);
      if (error) {
        showError('Failed to decline request.');
        console.error(error);
      } else {
        showSuccess('Friend request declined.');
        fetchRequests();
      }
    }
  };

  if (loading) {
    return <p className="text-center p-4">Loading requests...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Friend Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p>You have no pending friend requests.</p>
        ) : (
          <ul className="space-y-4">
            {requests.map((req) => (
              <li key={req.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={req.sender_profile.avatar_url ?? undefined} />
                    <AvatarFallback>{req.sender_profile.first_name?.[0]}{req.sender_profile.last_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{req.sender_profile.first_name} {req.sender_profile.last_name}</p>
                  </div>
                </div>
                <div className="space-x-2">
                  <Button onClick={() => handleRequest(req.id, 'accept')}>Accept</Button>
                  <Button variant="outline" onClick={() => handleRequest(req.id, 'decline')}>Decline</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendRequests;