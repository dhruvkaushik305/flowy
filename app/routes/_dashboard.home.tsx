import { getSession } from "~/.server/sessions";
import type { Route } from "./+types/_dashboard.home";
import { getName } from "~/.server/models/user";
import { getTodos } from "~/.server/models/todo";
import { getTodayTime } from "~/.server/models/time";
import { data, useFetcher, useLoaderData } from "react-router";
import invariant from "tiny-invariant";
import { useEffect, useRef, useState } from "react";
import {
  CheckCheck,
  Clock,
  Ellipsis,
  List,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Trash,
} from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  invariant(userId, "User id was not resolved at home");

  const [name, todos, currentTime] = await Promise.all([
    getName(userId),
    getTodos(userId),
    getTodayTime(userId),
  ]);

  return data({
    name,
    todos,
    currentTime,
  });
}

export default function HomePage() {
  return (
    <section className="mx-auto flex h-full max-w-6xl flex-col space-y-6 py-5">
      <Header />
      <Todos />
    </section>
  );
}

function Header() {
  const { name } = useLoaderData<typeof loader>();

  return (
    <header className="p-4">
      <h2 className="font-roboto text-2xl font-medium md:text-3xl">
        Welcome back,{" "}
        <span className="underline underline-offset-4">{name}</span>
      </h2>
      <Stopwatch />
    </header>
  );
}

function Stopwatch() {
  const { currentTime } = useLoaderData<typeof loader>();

  const [time, setTime] = useState<number>(currentTime);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hour = Math.floor(time / 3600)
    .toString()
    .padStart(2, "0");
  const minute = Math.floor((time % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const second = (time % 60).toString().padStart(2, "0");

  useEffect(() => {
    if (!isRunning) {
      document.title = "Flowy - Clock in, Check off";
    } else {
      document.title = `Time - ${hour}:${minute}:${second}`;
    }
  });

  const handlePause = () => {
    setIsRunning(false);
  };

  const handlePlay = () => {
    setIsRunning(true);
  };

  const toggleFullScreen = () => {
    setIsFullscreen((prevState) => !prevState);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  return (
    <div
      className={`${
        isFullscreen
          ? "absolute left-0 top-0 z-20 h-screen w-screen bg-indigo-100"
          : ""
      } flex flex-col items-end justify-center gap-5`}
    >
      <button className="" onClick={toggleFullScreen}>
        {isFullscreen ? (
          <Minimize2 />
        ) : (
          <Maximize2 className="size-8 rounded-md border border-blue-200 p-2 transition-colors duration-200 hover:bg-blue-100/80 md:size-9" />
        )}
      </button>
      <p className="w-full text-center font-mono text-7xl font-bold md:text-9xl">
        <span>{hour}:</span>
        <span>{minute}:</span>
        <span>{second}</span>
      </p>
      <div className="flex w-full justify-center gap-5">
        {isRunning ? (
          <button className="stopwatch-btn" onClick={handlePause}>
            <Pause className="size-5" />
          </button>
        ) : (
          <button className="stopwatch-btn" onClick={handlePlay}>
            <Play className="size-5" />
          </button>
        )}
        {!isRunning && time > 0 ? (
          <button className="stopwatch-btn" onClick={handleReset}>
            <RotateCcw className="size-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Todos() {
  return (
    <div className="mx-4 space-y-4">
      <AddTodo />
      <TodoList />
    </div>
  );
}

function AddTodo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const createFetcher = useFetcher();

  const handleSubmition = () => {};

  return (
    <createFetcher.Form
      method="POST"
      onSubmit={handleSubmition}
      className="flex gap-2"
    >
      <input
        type="text"
        name="newTodo"
        ref={inputRef}
        placeholder="Add a new task here"
        className="w-full rounded-md border border-blue-100 bg-transparent p-2 focus:border-blue-300 focus:outline-none"
      />
      <button
        name="intent"
        value="createTodo"
        disabled={createFetcher.state !== "idle"}
        className="rounded-xl bg-black p-3 text-white transition-transform duration-200 hover:scale-105"
      >
        {createFetcher.state === "idle" ? (
          <Plus className="size-4 md:size-5" />
        ) : (
          <Ellipsis className="size-4 md:size-5" />
        )}
      </button>
    </createFetcher.Form>
  );
}

type TodoState = "all" | "completed" | "pending";

function TodoList() {
  const { todos } = useLoaderData<typeof loader>();
  const [filter, setFilter] = useState<TodoState>("pending");

  let displayTodos = [];

  switch (filter) {
    case "completed":
      displayTodos = todos.filter((todo) => todo.completed === true);
      break;
    case "pending":
      displayTodos = todos.filter((todo) => todo.completed === false);
      break;
    default:
      displayTodos = todos;
      break;
  }
  return (
    <div className="space-y-5 rounded-xl border-4 border-blue-200 p-5">
      <div className="flex items-center justify-between divide-x-2 divide-blue-200/50 overflow-hidden rounded-lg bg-blue-100">
        <button
          className={`flex-1 py-2 ${filter === "pending" ? "bg-blue-200" : ""}`}
          onClick={() => setFilter("pending")}
        >
          <Clock className="mx-auto" />
        </button>
        <button
          className={`flex-1 py-2 ${filter === "completed" ? "bg-blue-200" : ""}`}
          onClick={() => setFilter("completed")}
        >
          <CheckCheck className="mx-auto" />
        </button>
        <button
          className={`flex-1 py-2 ${filter === "all" ? "bg-blue-200" : ""}`}
          onClick={() => setFilter("all")}
        >
          <List className="mx-auto" />
        </button>
      </div>
      {displayTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}

interface TodoItemProps {
  todo: {
    id: string;
    title: string;
    completed: boolean;
  };
}

function TodoItem({ todo }: Readonly<TodoItemProps>) {
  const toggleFetcher = useFetcher();
  const updateFetcher = useFetcher();
  const deleteFetcher = useFetcher();

  const handleToggleTodo = () => {};
  const todoChecked = toggleFetcher.formData
    ? toggleFetcher.formData.get("completed") === "true"
    : todo.completed;

  const handleUpdateTodo = () => {};
  const handleDeleteTodo = () => {};
  const optimisticDeletion =
    deleteFetcher.formData?.get("intent") === "deleteTodo";

  return (
    <>
      {!optimisticDeletion && (
        <div className="flex w-full items-center gap-5">
          <toggleFetcher.Form>
            <input
              type="checkbox"
              checked={todoChecked}
              name="completed"
              onChange={handleToggleTodo}
              className="size-4"
            />
          </toggleFetcher.Form>
          <updateFetcher.Form onBlur={handleUpdateTodo} className="w-full">
            <input
              defaultValue={todo.title}
              name="newTitle"
              className={`${
                todo.completed ? "line-through" : ""
              } w-full bg-transparent hover:cursor-text focus:outline-none`}
            />
          </updateFetcher.Form>
          <deleteFetcher.Form onSubmit={handleDeleteTodo}>
            <button type="submit">
              <Trash className="size-3 transition-transform duration-200 hover:scale-125 md:size-4" />
            </button>
          </deleteFetcher.Form>
        </div>
      )}
    </>
  );
}
