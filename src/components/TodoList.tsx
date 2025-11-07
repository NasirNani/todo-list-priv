"use client";

import { TodoItem } from "./TodoItem";
import type { Todo } from "@/types";

interface TodoListProps {
  todos: Todo[];
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
}

export const TodoList = ({ todos, toggleTodo, deleteTodo }: TodoListProps) => {
  if (todos.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        No todos yet. Add one above!
      </p>
    );
  }

  return (
    <div className="w-full space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          toggleTodo={toggleTodo}
          deleteTodo={deleteTodo}
        />
      ))}
    </div>
  );
};