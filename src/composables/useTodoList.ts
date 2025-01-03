import {Ref, ref} from "vue";
import {
  BaseDirectory,
  exists,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { Item } from "jstodotxt";
import {VList} from "vuetify/components";

interface Todo {
  body: string;
  complete: boolean;
}

const pathTodoList = "vumurt-todo.txt";

async function fileExists(filePath: string): Promise<boolean> {
  return await exists(filePath, { baseDir: BaseDirectory.Home });
}

async function readFile(filePath: string): Promise<string> {
  return await readTextFile(filePath, { baseDir: BaseDirectory.Home });
}

async function writeFile(filePath: string, content: string): Promise<void> {
  await writeTextFile(filePath, content, { baseDir: BaseDirectory.Home });
}

function parseTodoString(todoString: string): Todo | null {
  if (!todoString) return null;
  const todoItem = new Item(todoString);
  return { body: todoItem.body(), complete: todoItem.complete() };
}

function createTodoString(todo: Todo): string {
  const todoItem = new Item(todo.body);
  todoItem.setComplete(todo.complete);
  return todoItem.toString();
}

export function useTodoList(todoListElement: Ref<VList | null>) {
  const todoList = ref<Todo[]>([]);
  const isLoading = ref(false);

  async function loadTodoList() {
    try {
      if (!(await fileExists(pathTodoList))) return;
      const contents = await readFile(pathTodoList);
      todoList.value = contents
          .split("\n")
          .map(parseTodoString)
          .filter((todo): todo is Todo => todo !== null);
    } catch (error) {
      console.error("Failed to load todo list:", error);
    } finally {
      isLoading.value = false;
    }
  }

  async function saveTodoList() {
    try {
      const content = todoList.value.map(createTodoString).join("\n");
      await writeFile(pathTodoList, content);
    } catch (error) {
      console.error("Failed to save todo list:", error);
    }
  }

  async function completeTodo(todoIndex: number) {
    todoList.value[todoIndex].complete = true;
    todoListElement.value?.focus('first');
    await saveTodoList();
  }

  async function addTodo(todoString: Ref<string>) {
    const todo = parseTodoString(todoString.value);
    todoString.value = "";
    if (todo) {
      todoList.value.push({ body: todo.body, complete: false });
      await saveTodoList();
    }
  }

  async function removeTodo(todoIndex: number) {
    todoList.value.splice(todoIndex, 1);
    await saveTodoList();
  }

  loadTodoList();

  return {
    todoList,
    addTodo,
    completeTodo,
    removeTodo,
  };
}
