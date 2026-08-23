const STORAGE_KEYS = {
  LISTS: "todo_lists",
};

function getTasks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

function createTaskObject({ title, description, list, dueDate, tags }) {
  return {
    id: Date.now(),
    title: (title || "").trim(),
    description: (description || "").trim(),
    completed: false,
    list: list || "Personal",
    dueDate: dueDate || null,
    tags: tags || [],
    createdAt: new Date().toISOString(),
  };
}

function addTask(data) {
  if (!data.title || !data.title.trim()) return null;
  const tasks = getTasks();
  const newTask = createTaskObject(data);
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

function updateTask(id, updates) {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === id);
  if (task) Object.assign(task, updates);
  saveTasks(tasks);
  return task;
}

function deleteTask(id) {
  saveTasks(getTasks().filter((t) => t.id !== id));
}

function toggleComplete(id) {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === id);
  if (task) task.completed = !task.completed;
  saveTasks(tasks);
  return task;
}
