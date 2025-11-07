"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showSuccess } from "@/utils/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Profile } from "@/types";

interface TodoFormProps {
  addTodo: (text: string, friendId?: string) => void;
  friends: Profile[];
}

export const TodoForm = ({ addTodo, friends }: TodoFormProps) => {
  const [value, setValue] = useState("");
  const [selectedFriend, setSelectedFriend] = useState("myself");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    addTodo(value, selectedFriend === 'myself' ? undefined : selectedFriend);
    setValue("");
    setSelectedFriend("myself");
    showSuccess("Todo added successfully!");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col space-y-2"
    >
      <div className="flex w-full items-center space-x-2">
        <Input
          type="text"
          placeholder="Add a new todo"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="New todo input"
        />
        <Button type="submit">Add Todo</Button>
      </div>
      {friends.length > 0 && (
        <Select value={selectedFriend} onValueChange={setSelectedFriend}>
          <SelectTrigger>
            <SelectValue placeholder="Assign to..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="myself">For Myself</SelectItem>
            {friends.map((friend) => (
              <SelectItem key={friend.id} value={friend.id}>
                {friend.first_name} {friend.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </form>
  );
};