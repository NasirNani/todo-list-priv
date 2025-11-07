"use client";

import { useState, useEffect, useCallback } from "react";
import { TodoForm } from "@/components/TodoForm";
import { TodoList } from "@/components/TodoList";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Todo, Profile } from "@/types";
import { showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [friends, setFriends] = useState<Profile[]>([]);

  const fetchTodos = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_todos');

    if (error) {
      console.error("Error fetching todos:", error);
      showError("Failed to fetch todos.");
    } else {
      setTodos(data || []);
    }
  }, []);

  const fetchFriends = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_friends');
    if (error) {
      console.error("Error fetching friends:", error);
    } else if (data) {
      setFriends(data);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
    fetchFriends();
  }, [fetchTodos, fetchFriends]);

  const addTodo = async (text: string, friendId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
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
    const todoToUpdate = todos.find((todo) => todo.id === id);
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
      setTodos(todos.filter((todo) => todo.id !== id));
      showError("Todo removed.");
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            My Todo List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <TodoForm addTodo={addTodo} friends={friends} />
            <TodoList
              todos={todos}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
            />
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Index;