"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showSuccess } from "@/utils/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Profile } from "@/types";

interface TodoFormProps {
  addTodo: (text: string, targetUserId: string | null) => void;
  friends: Profile[];
  currentUserId: string;
}

export const TodoForm = ({ addTodo, friends, currentUserId }: TodoFormProps) => {
  const [value, setValue] = useState("");
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    
    // If targetUserId is null, it defaults to the current user in Index.tsx
    addTodo(value, targetUserId); 
    setValue("");
    setTargetUserId(null);
    showSuccess("Todo added successfully!");
  };

  const getDisplayName = (p: Profile) => {
    if (p.first_name || p.last_name) {
        return `${p.first_name || ''} ${p.last_name || ''}`.trim();
    }
    return p.id.substring(0, 8); // Fallback to truncated ID
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-full space-y-2"
    >
      <Input
        type="text"
        placeholder="Add a new todo"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="New todo input"
      />
      
      <div className="flex space-x-2">
        <Select onValueChange={(val) => setTargetUserId(val === currentUserId ? null : val)} value={targetUserId || currentUserId}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Share with..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={currentUserId}>
                    (Me)
                </SelectItem>
                {friends.map((friend) => (
                    <SelectItem key={friend.id} value={friend.id}>
                        {getDisplayName(friend)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        <Button type="submit" className="shrink-0">Add Todo</Button>
      </div>
    </form>
  );
};