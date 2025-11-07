export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
  user_id: string;
  shared_by_user_id?: string;
  shared_by_first_name?: string;
  shared_by_last_name?: string;
  assigned_to_first_name?: string;
  assigned_to_last_name?: string;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}