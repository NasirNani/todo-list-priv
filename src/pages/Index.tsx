"use client";

import { useState, useEffect, useCallback } from "react";
import { TodoForm } from "@/components/TodoForm";
import { TodoList } from "@/components/TodoList";
import { FriendsManager } from "@/components/FriendsManager";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Todo, Profile } from "@/types";
import { showError, showSuccess } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/hooks/use-user-data";
import { Spinner } from "@/components/Spinner";

const Index = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const { profile, friends, isLoading: isUserDataLoading } = useUserData();
  const [isTodoLoading, setIsTodoLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    setIsTodoLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setIsTodoLoading(false);
        return;
    }

    const { data, error } = await supabase
      .from("todos")
      .select(`
        *,
        shared_by: shared_by_user_id (id, first_name, last_name)
      `)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching todos:", error);
      showError("Failed to fetch todos.");
    } else {
      setTodos(data as Todo[] || []);
    }
    setIsTodoLoading(false);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (text: string, targetUserId: string | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        showError("You must be logged in to add a todo.");
        return;
    }

    const isShared = targetUserId && targetUserId !== user.id;
    
    const insertData = { 
        text, 
        user_id: targetUserId || user.id, // Target user is the owner of the todo
        shared_by_user_id: isShared ? user.id : null // Only set sharer if it's a shared todo
    };

    const { data, error } = await supabase
      .from("todos")
      .insert([insertData])
      .select(`
        *,
        shared_by: shared_by_user_id (id, first_name, last_name)
      `);

    if (error) {
      console.error("Error adding todo:", error);
      showError("Failed to add todo.");
    } else if (data) {
      // We need to re-fetch all todos to ensure we get the latest list including shared items
      // For simplicity and correctness with RLS, we'll re-fetch everything.
      fetchTodos();
      // showSuccess is already in TodoForm
    }
  };

  const toggleTodo = async (id: string) => {
    const todoToUpdate = todos.find((todo) => todo.id === id);
    if (!todoToUpdate) return;

    // Only the owner (user_id) can update the todo status
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id !== todoToUpdate.user_id) {
        showError("You can only mark your own todos as complete/incomplete.");
        return;
    }

    const { data, error } = await supabase
      .from("todos")
      .update({ completed: !todoToUpdate.completed })
      .match({ id })
      .select(`
        *,
        shared_by: shared_by_user_id (id, first_name, last_name)
      `);

    if (error) {
      console.error("Error updating todo:", error);
      showError("Failed to update todo.");
    } else if (data) {
      setTodos(
        todos.map((todo) => (todo.id === id ? data[0] as Todo : todo))
      );
    }
  };

  const deleteTodo = async (id: string) => {
    const todoToDelete = todos.find((todo) => todo.id === id);
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.id !== todoToDelete?.user_id) {
        showError("You can only delete your own todos.");
        return;
    }

    const { error } = await supabase.from("todos").delete().match({ id });

    if (error) {
      console.error("Error deleting todo:", error);
      showError("Failed to delete todo.");
    } else {
      setTodos(todos.filter((todo) => todo.id !== id));
      showError("Todo removed.");
    }
  };
  
  if (isUserDataLoading || isTodoLoading) {
    return <Spinner />;
  }

  const myTodos = todos.filter(t => t.user_id === profile?.id);
  const sharedTodos = todos.filter(t => t.user_id !== profile?.id);

  return (
    <main className="min-h-screen bg-background flex flex-col lg:flex-row items-start justify-center p-4 gap-6">
      
      {/* Todo List Card */}
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            My Todo List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <TodoForm 
                addTodo={addTodo} 
                friends={friends} 
                currentUserId={profile?.id || ''}
            />
            
            <Tabs defaultValue="mine" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mine">My Todos ({myTodos.length})</TabsTrigger>
                    <TabsTrigger value="shared">Shared With Me ({sharedTodos.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="mine">
                    <TodoList
                        todos={myTodos}
                        toggleTodo={toggleTodo}
                        deleteTodo={deleteTodo}
                    />
                </TabsContent>
                <TabsContent value="shared">
                    <TodoList
                        todos={sharedTodos}
                        toggleTodo={toggleTodo}
                        deleteTodo={deleteTodo}
                    />
                </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Friends Manager Card */}
      <FriendsManager onFriendshipChange={fetchTodos} />
    </main>
  );
};

export default Index;