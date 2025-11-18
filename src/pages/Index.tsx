"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import PullToRefresh from 'react-pull-to-refresh';
import { TodoForm } from "@/components/TodoForm";
import { TodoList } from "@/components/TodoList";
import { SharedTodoList } from "@/components/SharedTodoList";
import { TodoStats } from "@/components/TodoStats";
import { TodoFilters, type TodoSortOrder, type TodoStatusFilter } from "@/components/TodoFilters";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TodoStatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<TodoSortOrder>("newest");

  const checkUserAndProfile = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (currentUser) {
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
    }
    // If currentUser is null, the Layout component will handle redirection.
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
    checkUserAndProfile();
  }, [checkUserAndProfile]);

  useEffect(() => {
    if (user) {
      fetchTodos();
      fetchFriends();
    }
  }, [user, fetchTodos, fetchFriends]);

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

  // More robust touch device detection
  const isTouchDevice = (() => {
    try {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    } catch (e) {
      return false;
    }
  })();

  const filteredTodos = useMemo(() => {
    let updatedTodos = [...myTodos];

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      updatedTodos = updatedTodos.filter((todo) =>
        todo.text.toLowerCase().includes(lowerQuery)
      );
    }

    if (statusFilter === "active") {
      updatedTodos = updatedTodos.filter((todo) => !todo.completed);
    } else if (statusFilter === "completed") {
      updatedTodos = updatedTodos.filter((todo) => todo.completed);
    }

    updatedTodos.sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortOrder === "newest" ? -diff : diff;
    });

    return updatedTodos;
  }, [myTodos, searchQuery, statusFilter, sortOrder]);

  const completedCount = useMemo(
    () => myTodos.filter((todo) => todo.completed).length,
    [myTodos]
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 pt-8 md:pt-16">
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
            <TodoStats total={myTodos.length} completed={completedCount} shared={sharedByMeTodos.length} />
            <TodoFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />
            {isTouchDevice ? (
              <PullToRefresh onRefresh={handleRefresh} disabled={false}>
                <div className="w-full">
                  <TodoList
                    todos={filteredTodos}
                    toggleTodo={toggleTodo}
                    deleteTodo={deleteTodo}
                  />
                  <SharedTodoList todos={sharedByMeTodos} />
                </div>
              </PullToRefresh>
            ) : (
              <div className="w-full">
                <TodoList
                  todos={filteredTodos}
                  toggleTodo={toggleTodo}
                  deleteTodo={deleteTodo}
                />
                <SharedTodoList todos={sharedByMeTodos} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;