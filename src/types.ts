export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  user_id: string;
  created_at: string;
  shared_by_user_id?: string | null;
  shared_by_first_name?: string | null;
  shared_by_last_name?: string | null;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}