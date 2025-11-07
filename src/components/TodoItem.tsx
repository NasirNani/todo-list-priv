"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import type { Todo, Profile } from "@/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TodoItemProps {
  todo: Todo & { shared_by?: Profile | null };
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

export const TodoItem = ({ todo, toggleTodo, deleteTodo }: TodoItemProps) => {
  
  const isShared = !!todo.shared_by_user_id;
  
  const getSharerName = (p: Profile) => {
    if (p.first_name || p.last_name) {
        return `${p.first_name || ''} ${p.last_name || ''}`.trim();
    }
    return p.id.substring(0, 8);
  }

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors">
      <div className="flex items-center space-x-3 overflow-hidden">
        <Checkbox
          id={`todo-${todo.id}`}
          checked={todo.completed}
          onCheckedChange={() => toggleTodo(todo.id)}
          aria-label={`Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`}
          disabled={isShared} // Only the owner can mark as complete
        />
        <label
          htmlFor={`todo-${todo.id}`}
          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate ${
            todo.completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {todo.text}
        </label>
        {isShared && todo.shared_by && (
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="text-xs text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full ml-2 shrink-0">
                        From {getSharerName(todo.shared_by)}
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    Shared by {getSharerName(todo.shared_by)}
                </TooltipContent>
            </Tooltip>
        )}
      </div>
      
      {/* Only the owner can delete */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => deleteTodo(todo.id)} 
        aria-label={`Delete todo: ${todo.text}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};