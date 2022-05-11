import { Task } from "..";
import { AuthorTask } from "./Task";

export const TaskFactory = (task: Task) => {
    return new AuthorTask().restore(task);
}