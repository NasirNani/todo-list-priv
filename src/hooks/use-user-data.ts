import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Friend } from "@/types";
import { showError } from "@/utils/toast";

interface UserData {
  profile: Profile | null;
  friends: Profile[];
  isLoading: boolean;
}

export function useUserData(): UserData {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    // 1. Fetch Profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      showError("Failed to load user profile.");
    } else {
      setProfile(profileData as Profile);
    }

    // 2. Fetch Accepted Friends
    const { data: friendsData, error: friendsError } = await supabase
      .from('friends')
      .select(`
        status,
        user_id,
        friend_id,
        friend_profile: friend_id (id, first_name, last_name, avatar_url),
        user_profile: user_id (id, first_name, last_name, avatar_url)
      `)
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (friendsError) {
      console.error("Error fetching friends:", friendsError);
      showError("Failed to load friends list.");
    } else if (friendsData) {
      const acceptedFriends: Profile[] = friendsData.map((f) => {
        // Supabase returns the joined profile data as an array of one element if it exists, 
        // or a single object if the join is simple. We assert it as Profile.
        const friendProfile = f.user_id === user.id ? f.friend_profile : f.user_profile;
        
        // Ensure we handle the case where friendProfile might be an array (due to complex joins)
        const profileObject = Array.isArray(friendProfile) ? friendProfile[0] : friendProfile;
        
        return profileObject as Profile;
      }).filter(p => p.id !== user.id); // Filter out the current user if somehow included
      
      setFriends(acceptedFriends);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return { profile, friends, isLoading };
}