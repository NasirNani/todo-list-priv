"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type TodoStatusFilter = "all" | "active" | "completed";
export type TodoSortOrder = "newest" | "oldest";

interface TodoFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: TodoStatusFilter;
  onStatusFilterChange: (value: TodoStatusFilter) => void;
  sortOrder: TodoSortOrder;
  onSortOrderChange: (value: TodoSortOrder) => void;
}

export const TodoFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderChange,
}: TodoFiltersProps) => {
  return (
    <div className="w-full space-y-3 rounded-xl border bg-muted/30 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search your tasks"
          className="pl-10"
          aria-label="Search todos"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as TodoStatusFilter)}>
          <SelectTrigger aria-label="Filter tasks by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tasks</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(value) => onSortOrderChange(value as TodoSortOrder)}>
          <SelectTrigger aria-label="Sort tasks">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
