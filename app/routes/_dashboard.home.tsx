import { getSession } from "~/.server/sessions";
import type { Route } from "./+types/_dashboard.home";
import { getName } from "~/.server/models/user";
import {
  createTodo,
  deleteTodo,
  getTodos,
  toggleTodo,
  updateTodo,
} from "~/.server/models/todo";
import { getTodayTime, resetTimer, updateTime } from "~/.server/models/time";
import {
  data,
  useBeforeUnload,
  useBlocker,
  useFetcher,
  useLoaderData,
} from "react-router";
import invariant from "tiny-invariant";
import React, { useEffect, useRef, useState } from "react";
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
import checkImage from "../assets/check.png?url";
import uncheckImage from "../assets/uncheck.png?url";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  invariant(userId, "User id was not resolved at home loader");

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

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  invariant(userId, "User id was not resolved at the home action");

  const formData = await request.formData();

  const intent = formData.get("intent");
  switch (intent) {
    case "createTodo": {
      const newTodo = formData.get("newTodo");

      if (!newTodo) return;

      await createTodo(userId, newTodo as string);
      break;
    }
    case "toggleTodo": {
      const todoId = formData.get("todoId");

      if (!todoId) return;

      const newState = formData.get("completed") === "true";
      await toggleTodo(todoId as string, newState);
      break;
    }
    case "updateTodo": {
      const todoId = formData.get("todoId");
      const newTitle = formData.get("newTitle");

      if (!todoId || !newTitle) return;

      await updateTodo(todoId as string, newTitle as string);
    }
    case "deleteTodo": {
      const todoId = formData.get("todoId");

      if (!todoId) return;
      await deleteTodo(todoId as string);
      break;
    }
    case "updateTime": {
      const newTimeEntry = formData.get("currentTime");

      if (!newTimeEntry) return;

      const newTime = parseInt(String(newTimeEntry), 10);
      if (isNaN(newTime)) return; //checks that the time is a valid number

      await updateTime(userId, newTime);
      break;
    }
    case "resetTimer": {
      await resetTimer(userId);
      break;
    }
    default: {
      console.log("Unhandled request", intent);
      break;
    }
  }
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

  const currentDayRef = useRef(new Date().getDate());

  const hour = Math.floor(time / 3600)
    .toString()
    .padStart(2, "0");
  const minute = Math.floor((time % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const second = (time % 60).toString().padStart(2, "0");

  //side effect that controls the doc title thing
  useEffect(() => {
    if (!isRunning) {
      document.title = "Flowy - Clock in, Check off";
    } else {
      document.title = `Time - ${hour}:${minute}:${second}`;
    }
  });

  const timeFetcher = useFetcher();

  const saveTime = async () => {
    //if the time hasn't changed yet, there's not point in saving anything
    if (time === currentTime) return;
    setIsRunning(false);

    const formData = new FormData();
    formData.set("intent", "updateTime");
    formData.set("currentTime", String(time));

    await timeFetcher.submit(formData, { method: "POST" });
  };

  //used to save time while the browser is being closed
  useBeforeUnload(saveTime);

  //this is used to block the navigation until the time is saved first.
  //the window.before unload event is capable of firing when we navigate
  //however when we normally navigate, we use JS to prevent page reloads,
  //in that scenario it won't fire so this is explicitly for that
  const saveTimeBlocker = useBlocker(true);
  useEffect(() => {
    if (saveTimeBlocker.state === "blocked") {
      saveTime().then(() => {
        if (saveTimeBlocker.proceed) {
          saveTimeBlocker.proceed();
        }
      });
    }
  }, [saveTimeBlocker.state]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        const day = new Date().getDate();
        //when its past midnight; save, reset, start again
        if (day != currentDayRef.current) {
          saveTime().then(() => {
            setTime(0);
            currentDayRef.current = day;
            setIsRunning(true);
          });
        } else {
          setTime((prevTime) => prevTime + 1);
        }
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, time]);

  const handlePause = async () => {
    await saveTime();
  };

  const handlePlay = () => {
    setIsRunning(true);
  };

  const toggleFullScreen = () => {
    setIsFullscreen((prevState) => !prevState);
  };

  const handleReset = () => {
    setTime(0);
    const formData = new FormData();
    formData.set("intent", "resetTimer");
    timeFetcher.submit(formData, { method: "POST" });
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

  const handleSubmition = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    formData.set("intent", "createTodo");

    await createFetcher.submit(formData, { method: "POST" });

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <createFetcher.Form onSubmit={handleSubmition} className="flex gap-2">
      <input
        type="text"
        name="newTodo"
        ref={inputRef}
        placeholder="Add a new task here"
        className="w-full rounded-md border border-blue-100 bg-transparent p-2 focus:border-blue-300 focus:outline-none"
      />
      <button
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

  const todoChecked = toggleFetcher.formData
    ? toggleFetcher.formData.get("completed") === "true"
    : todo.completed;

  const optimisticDeletion =
    deleteFetcher.formData?.get("intent") === "deleteTodo";

  const handleUpdateTodo = async (event: React.FocusEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    formData.set("todoId", todo.id);
    formData.set("intent", "updateTodo");

    await updateFetcher.submit(formData, { method: "POST" });
  };

  return (
    <>
      {!optimisticDeletion && (
        <div className="flex w-full items-center gap-5">
          <toggleFetcher.Form method="POST">
            <button
              type="submit"
              name="completed"
              value={String(!todoChecked)}
              className="h-auto w-6"
            >
              {todoChecked ? (
                <img src={checkImage} className="w-full" />
              ) : (
                <img src={uncheckImage} className="w-full" />
              )}
            </button>
            <input name="todoId" value={todo.id} hidden readOnly />
            <input name="intent" value="toggleTodo" hidden readOnly />
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
          <deleteFetcher.Form method="POST">
            <button type="submit" name="intent" value="deleteTodo">
              <Trash className="size-3 transition-transform duration-200 hover:scale-125 md:size-4" />
              <input name="todoId" value={todo.id} hidden readOnly />
            </button>
          </deleteFetcher.Form>
        </div>
      )}
    </>
  );
}
