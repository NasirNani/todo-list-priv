"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import type { Todo } from "@/types";

interface TodoItemProps {
  todo: Todo;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
}

export const TodoItem = ({ todo, toggleTodo, deleteTodo }: TodoItemProps) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors">
      <div className="flex items-center space-x-3">
        <Checkbox
          id={`todo-${todo.id}`}
          checked={todo.completed}
          onCheckedChange={() => toggleTodo(todo.id)}
          aria-label={`Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`}
        />
        <label
          htmlFor={`todo-${todo.id}`}
          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
            todo.completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {todo.text}
        </label>
      </div>
      <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.id)} aria-label={`Delete todo: ${todo.text}`}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};