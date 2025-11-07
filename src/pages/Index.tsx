"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { PullToRefresh } from 'react-pull-to-refresh'; // FIX: Changed to named import
import { TodoForm } from "@/components/TodoForm";
import { TodoList } from "@/components/TodoList";
import { SharedTodoList } from "@/components/SharedTodoList";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { Todo, Profile } from "@/types";
import { showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/Spinner";
import type { User } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [myTodos, setMyTodos] = useState<Todo[]>([]);
  const [sharedByMeTodos, setSharedByMeTodos] = useState<Todo[]>([]);
  const [friends, setFriends] = useState<Profile[]>([]);

  const checkProfile = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', currentUser.id)
      .single();

    if (error || !profile || !profile.first_name) {
      navigate('/profilesetup');
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const fetchTodos = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.rpc('get_todos');

    if (error) {
      console.error("Error fetching todos:", error);
      showError("Failed to fetch todos.");
    } else {
      const allTodos = data || [];
      setMyTodos(allTodos.filter(t => t.user_id === user.id));
      setSharedByMeTodos(allTodos.filter(t => t.shared_by_user_id === user.id));
    }
  }, [user]);

  const fetchFriends = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_friends');
    if (error) {
      console.error("Error fetching friends:", error);
    } else if (data) {
      setFriends(data);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchTodos(), fetchFriends()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkProfile();
  }, [checkProfile]);

  useEffect(() => {
    if (!loading && user) {
      fetchTodos();
      fetchFriends();
    }
  }, [loading, user, fetchTodos, fetchFriends]);

  const addTodo = async (text: string, friendId?: string) => {
    if (!user) {
        showError("You must be logged in to add a todo.");
        return;
    }

    const newTodo = friendId
      ? { text, user_id: friendId, shared_by_user_id: user.id }
      : { text, user_id: user.id };

    const { error } = await supabase
      .from("todos")
      .insert([newTodo]);

    if (error) {
      console.error("Error adding todo:", error);
      showError("Failed to add todo.");
    } else {
      fetchTodos();
    }
  };

  const toggleTodo = async (id: string) => {
    const todoToUpdate = myTodos.find((todo) => todo.id === id);
    if (!todoToUpdate) return;

    const { error } = await supabase
      .from("todos")
      .update({ completed: !todoToUpdate.completed })
      .match({ id });

    if (error) {
      console.error("Error updating todo:", error);
      showError("Failed to update todo.");
    } else {
      fetchTodos();
    }
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from("todos").delete().match({ id });

    if (error) {
      console.error("Error deleting todo:", error);
      showError("Failed to delete todo.");
    } else {
      setMyTodos(myTodos.filter((todo) => todo.id !== id));
      showError("Todo removed.");
    }
  };

  if (loading) {
    return <Spinner />;
  }

  const isTouchDevice = 'ontouchstart' in window;

  return (
    <PullToRefresh onRefresh={handleRefresh} disabled={!isTouchDevice}>
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold tracking-tight">
              My Todo List
            </CardTitle>
            {!isTouchDevice && (
              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <TodoForm addTodo={addTodo} friends={friends} />
              <TodoList
                todos={myTodos}
                toggleTodo={toggleTodo}
                deleteTodo={deleteTodo}
              />
              <SharedTodoList todos={sharedByMeTodos} />
            </div>
          </CardContent>
        </Card>
      </main>
    </PullToRefresh>
  );
};

export default Index;