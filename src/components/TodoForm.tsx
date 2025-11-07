"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showSuccess } from "@/utils/toast";

interface TodoFormProps {
  addTodo: (text: string) => void;
}

export const TodoForm = ({ addTodo }: TodoFormProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    addTodo(value);
    setValue("");
    showSuccess("Todo added successfully!");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center space-x-2"
    >
      <Input
        type="text"
        placeholder="Add a new todo"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="New todo input"
      />
      <Button type="submit">Add Todo</Button>
    </form>
  );
};