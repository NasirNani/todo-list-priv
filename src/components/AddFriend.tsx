import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";
import type { Profile } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const AddFriend = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length < 3) {
      showError("Please enter at least 3 characters to search.");
      return;
    }
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.rpc('search_users', {
      p_search_term: searchTerm,
      p_user_id: user.id
    });

    if (error) {
      console.error("Error searching users:", error);
      showError("Failed to search for users.");
    } else {
      setSearchResults(data || []);
    }
    setLoading(false);
  };

  const sendFriendRequest = async (recipientId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('friends').insert({
      user_id: user.id,
      friend_id: recipientId,
      status: 'pending'
    });

    if (error) {
      showError("Failed to send friend request. You may have already sent one.");
      console.error(error);
    } else {
      showSuccess("Friend request sent!");
      setSearchResults(searchResults.filter(u => u.id !== recipientId));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find New Friends</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" disabled={loading}>Search</Button>
        </form>
        {loading && <p>Searching...</p>}
        {searchResults.length > 0 && (
          <ul className="space-y-4">
            {searchResults.map((profile) => (
              <li key={profile.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback>{profile.first_name?.[0]}{profile.last_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                  </div>
                </div>
                <Button onClick={() => sendFriendRequest(profile.id)}>Add Friend</Button>
              </li>
            ))}
          </ul>
        )}
        {!loading && searchResults.length === 0 && searchTerm.length > 2 && <p>No users found.</p>}
      </CardContent>
    </Card>
  );
};

export default AddFriend;