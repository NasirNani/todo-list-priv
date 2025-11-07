import type { Todo } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface SharedTodoListProps {
  todos: Todo[];
}

export const SharedTodoList = ({ todos }: SharedTodoListProps) => {
  if (todos.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Tasks I've Shared</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between p-2 rounded-md bg-muted"
            >
              <div className="flex items-center space-x-3">
                <Checkbox checked={todo.completed} disabled />
                <div>
                  <span className={todo.completed ? "line-through text-muted-foreground" : ""}>
                    {todo.text}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Assigned to: {todo.assigned_to_first_name} {todo.assigned_to_last_name}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};