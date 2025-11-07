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
import type { Todo } from "@/types";
import { showError, showSuccess } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const { toast } = useToast();

  const fetchTodos = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching todos:", error);
      showError("Failed to fetch todos.");
    } else {
      setTodos(data || []);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (text: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        showError("You must be logged in to add a todo.");
        return;
    }

    const { data, error } = await supabase
      .from("todos")
      .insert([{ text, user_id: user.id }])
      .select();

    if (error) {
      console.error("Error adding todo:", error);
      showError("Failed to add todo.");
    } else if (data) {
      setTodos([...todos, ...data]);
      // showSuccess is already in TodoForm
    }
  };

  const toggleTodo = async (id: string) => {
    const todoToUpdate = todos.find((todo) => todo.id === id);
    if (!todoToUpdate) return;

    const { data, error } = await supabase
      .from("todos")
      .update({ completed: !todoToUpdate.completed })
      .match({ id })
      .select();

    if (error) {
      console.error("Error updating todo:", error);
      showError("Failed to update todo.");
    } else if (data) {
      setTodos(
        todos.map((todo) => (todo.id === id ? data[0] : todo))
      );
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
            <TodoForm addTodo={addTodo} />
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