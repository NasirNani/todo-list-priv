import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types";
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

    // 1. Fetch Profile, and create if it doesn't exist
    let { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // "PGRST116" is the code for "The result contains 0 rows" which is not a fatal error here.
    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error fetching profile:", profileError);
      showError("Failed to load user profile.");
    } else if (!profileData) {
      // Profile doesn't exist, so let's create one for the user.
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: user.id }) // Create a minimal profile
        .select()
        .single();
      
      if (insertError) {
        console.error("Error creating profile:", insertError);
        showError("Failed to create user profile.");
      } else {
        profileData = newProfile;
      }
    }
    
    setProfile(profileData as Profile);

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
      const acceptedFriends: Profile[] = friendsData.map((f: any) => {
        const friendProfile = f.user_id === user.id ? f.friend_profile : f.user_profile;
        const profileObject = Array.isArray(friendProfile) ? friendProfile[0] : friendProfile;
        return profileObject as Profile;
      }).filter(p => p && p.id !== user.id);
      
      setFriends(acceptedFriends);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return { profile, friends, isLoading };
}