const STORAGE_KEYS = {
  TASKS: "todo_tasks",
  LISTS: "todo_lists",
  TAGS: "todo_tags",
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

function getLists() {
  const data = localStorage.getItem(STORAGE_KEYS.LISTS);
  if (data) return JSON.parse(data);
  const defaultLists = [
    { id: 1, name: "Personal", color: "#e14b4b" },
    { id: 2, name: "Work", color: "#4a8cf6" },
  ];
  saveLists(defaultLists);
  return defaultLists;
}

function saveLists(lists) {
  localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
}

function addList(name, color) {
  if (!name.trim()) return null;
  const lists = getLists();
  const newList = { id: Date.now(), name: name.trim(), color: color || "#999" };
  lists.push(newList);
  saveLists(lists);
  return newList;
}

function deleteList(id) {
  saveLists(getLists().filter((l) => l.id !== id));
}

// ---------- Tags ----------
function getTags() {
  const data = localStorage.getItem(STORAGE_KEYS.TAGS);
  if (data) return JSON.parse(data);
  const defaultTags = ["Tag 1"];
  saveTags(defaultTags);
  return defaultTags;
}

function saveTags(tags) {
  localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
}

function addTag(name) {
  const tags = getTags();
  if (!tags.includes(name)) {
    tags.push(name);
    saveTags(tags);
  }
  return tags;
}

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = String(date.getFullYear()).slice(-2);
  return `${d}-${m}-${y}`;
}

function getTodayTasks() {
  const todayStr = new Date().toISOString().slice(0, 10);
  return getTasks().filter((t) => t.dueDate === todayStr);
}

function getUpcomingTasks() {
  const todayStr = new Date().toISOString().slice(0, 10);
  return getTasks().filter((t) => t.dueDate && t.dueDate > todayStr);
}

function getTasksByList(listName) {
  return getTasks().filter((t) => t.list === listName);
}

function countActiveByList(listName) {
  return getTasks().filter((t) => t.list === listName && !t.completed).length;
}

function countUpcoming() {
  return getUpcomingTasks().filter((t) => !t.completed).length;
}

function searchTasks(keyword) {
  const kw = keyword.toLowerCase();
  return getTasks().filter((t) => t.title.toLowerCase().includes(kw));
}