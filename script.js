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

let lists = [
  { id: 'personal', name: 'Personal', color: '#F14C4C' },
  { id: 'work', name: 'Work', color: '#3B82F6' }
];

let tasks = [
  { id: 1, title: 'PROJEK MAPIL KELOMPOK', description: '', listId: 'personal', dueDate: '2026-11-06', tags: ['Tag 1'], completed: true },
  { id: 2, title: 'Beli bahan presentasi', description: '', listId: 'personal', dueDate: '2026-11-02', tags: [], completed: false },
  { id: 3, title: 'Meeting tim marketing', description: '', listId: 'work', dueDate: '2026-11-02', tags: ['Tag 1'], completed: false },
  { id: 4, title: 'Kirim laporan mingguan', description: '', listId: 'work', dueDate: '2026-11-05', tags: [], completed: false }
];

let currentView = 'today'; // 'today' | 'upcoming' | listId
let selectedTaskId = null;
let nextTaskId = 5;
let draftTags = [];
let todayStr = new Date().toISOString().slice(0, 10);

// ---------- DOM REFS ----------
const navToday = document.getElementById('navToday');
const navUpcoming = document.getElementById('navUpcoming');
const listsContainer = document.getElementById('listsContainer');
const addListBtn = document.getElementById('addListBtn');
const viewTitle = document.getElementById('viewTitle');
const viewCount = document.getElementById('viewCount');
const taskListEl = document.getElementById('taskList');
const addTaskRow = document.getElementById('addTaskRow');
const addTasksBtn = document.getElementById('addTasksBtn');
const upcomingCount = document.getElementById('upcomingCount');

const taskPanel = document.getElementById('taskPanel');
const fieldTitle = document.getElementById('fieldTitle');
const fieldDesc = document.getElementById('fieldDesc');
const fieldList = document.getElementById('fieldList');
const fieldDate = document.getElementById('fieldDate');
const tagsWrap = document.getElementById('tagsWrap');
const addTagBtn = document.getElementById('addTagBtn');
const deleteTaskBtn = document.getElementById('deleteTaskBtn');
const saveTaskBtn = document.getElementById('saveTaskBtn');

// ---------- HELPERS ----------
function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y.slice(2)}`;
}

function getListById(id) {
  return lists.find(l => l.id === id);
}

function getFilteredTasks() {
  if (currentView === 'today') {
    return tasks.filter(t => t.dueDate === todayStr || !t.dueDate);
  }
  if (currentView === 'upcoming') {
    return tasks.filter(t => t.dueDate && t.dueDate >= todayStr);
  }
  return tasks.filter(t => t.listId === currentView);
}

function updateCounts() {
  const upcoming = tasks.filter(t => t.dueDate && t.dueDate >= todayStr && !t.completed);
  upcomingCount.textContent = upcoming.length;
  lists.forEach(l => {
    const badge = document.getElementById('badge-' + l.id);
    if (badge) {
      const count = tasks.filter(t => t.listId === l.id && !t.completed).length;
      badge.textContent = count;
    }
  });
}

// ---------- RENDER: SIDEBAR LISTS ----------
function renderLists() {
  listsContainer.innerHTML = '';
  lists.forEach(l => {
    const btn = document.createElement('button');
    btn.className = 'nav-item' + (currentView === l.id ? ' active' : '');
    btn.dataset.view = l.id;
    btn.innerHTML = `
      <span class="nav-left">
        <span class="list-dot" style="background:${l.color}"></span>
        <span>${escapeHtml(l.name)}</span>
      </span>
      <span class="count-badge" id="badge-${l.id}">0</span>
    `;
    btn.addEventListener('click', () => setView(l.id));
    listsContainer.appendChild(btn);
  });
  updateCounts();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- VIEW SWITCHING ----------
function setView(view) {
  currentView = view;
  selectedTaskId = null;
  closeTaskPanel();

  navToday.classList.toggle('active', view === 'today');
  navUpcoming.classList.toggle('active', view === 'upcoming');
  document.querySelectorAll('#listsContainer .nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });

  if (view === 'today') viewTitle.textContent = 'Today';
  else if (view === 'upcoming') viewTitle.textContent = 'Upcoming';
  else viewTitle.textContent = getListById(view)?.name || 'Tasks';

  renderTasks();
}

// ---------- RENDER: TASK LIST ----------
function renderTasks() {
  const filtered = getFilteredTasks();
  viewCount.textContent = filtered.length > 0 ? filtered.length : '';
  taskListEl.innerHTML = '';

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Belum ada tugas. Tambahkan tugas baru di atas.';
    taskListEl.appendChild(empty);
    return;
  }

  filtered.forEach(task => {
    const list = getListById(task.listId);
    const card = document.createElement('div');
    card.className = 'task-card' + (selectedTaskId === task.id ? ' selected' : '');

    const tagsHtml = task.tags.map(t => `<span class="pill tag">${escapeHtml(t)}</span>`).join('');
    const listHtml = list
      ? `<span class="pill list-pill"><span class="pill-dot" style="background:${list.color}"></span>${escapeHtml(list.name)}</span>`
      : '';
    const dateHtml = task.dueDate
      ? `<span class="date-tag">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="#6B7280" stroke-width="2"/><path d="M3 10H21" stroke="#6B7280" stroke-width="2"/><path d="M8 3V7" stroke="#6B7280" stroke-width="2" stroke-linecap="round"/><path d="M16 3V7" stroke="#6B7280" stroke-width="2" stroke-linecap="round"/></svg>
           ${formatDate(task.dueDate)}
         </span>`
      : '';

    card.innerHTML = `
      <div class="task-card-label">List Item</div>
      <div class="task-card-top">
        <span class="checkbox-circle ${task.completed ? 'checked' : ''}" data-id="${task.id}">
          ${task.completed ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="#4A9DEB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}
        </span>
        <div class="task-card-main">
          <div class="task-card-title ${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</div>
          <div class="task-card-bottom">
            ${dateHtml}
            ${tagsHtml}
            ${listHtml}
          </div>
        </div>
      </div>
    `;

    card.querySelector('.checkbox-circle').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleComplete(task.id);
    });

    card.addEventListener('click', () => openTaskPanel(task.id));

    taskListEl.appendChild(card);
  });
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.completed = !task.completed;
  renderTasks();
  updateCounts();
}

// ---------- RIGHT PANEL (ADD / EDIT) ----------
function populateListSelect() {
  fieldList.innerHTML = '';
  lists.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = l.name;
    fieldList.appendChild(opt);
  });
}

function renderDraftTags() {
  tagsWrap.querySelectorAll('.tag-chip').forEach(el => el.remove());
  draftTags.forEach((tag, idx) => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = `${escapeHtml(tag)} <span class="remove-x">&times;</span>`;
    chip.querySelector('.remove-x').addEventListener('click', (e) => {
      e.stopPropagation();
      draftTags.splice(idx, 1);
      renderDraftTags();
    });
    tagsWrap.insertBefore(chip, addTagBtn);
  });
}

function openTaskPanel(id) {
  selectedTaskId = id;
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  populateListSelect();
  fieldTitle.value = task.title;
  fieldDesc.value = task.description || '';
  fieldList.value = task.listId;
  fieldDate.value = task.dueDate || '';
  draftTags = [...task.tags];
  renderDraftTags();
  deleteTaskBtn.style.display = 'block';

  taskPanel.classList.add('open');
  renderTasks();
}

function openNewTaskPanel() {
  selectedTaskId = null;
  populateListSelect();
  fieldTitle.value = '';
  fieldDesc.value = '';
  fieldList.value = (currentView !== 'today' && currentView !== 'upcoming') ? currentView : lists[0]?.id;
  fieldDate.value = currentView === 'today' ? todayStr : '';
  draftTags = [];
  renderDraftTags();
  deleteTaskBtn.style.display = 'none';

  taskPanel.classList.add('open');
  fieldTitle.focus();
}

function closeTaskPanel() {
  taskPanel.classList.remove('open');
}

function saveTask() {
  const title = fieldTitle.value.trim();
  if (!title) {
    fieldTitle.focus();
    return;
  }

  if (selectedTaskId) {
    const task = tasks.find(t => t.id === selectedTaskId);
    task.title = title;
    task.description = fieldDesc.value;
    task.listId = fieldList.value;
    task.dueDate = fieldDate.value;
    task.tags = [...draftTags];
  } else {
    tasks.push({
      id: nextTaskId++,
      title,
      description: fieldDesc.value,
      listId: fieldList.value,
      dueDate: fieldDate.value,
      tags: [...draftTags],
      completed: false
    });
  }

  closeTaskPanel();
  renderTasks();
  updateCounts();
}

function deleteTask() {
  if (!selectedTaskId) return;
  tasks = tasks.filter(t => t.id !== selectedTaskId);
  selectedTaskId = null;
  closeTaskPanel();
  renderTasks();
  updateCounts();
}

// ---------- ADD LIST ----------
function addNewList() {
  const name = prompt('Nama list baru:');
  if (!name || !name.trim()) return;
  const colors = ['#F14C4C', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const color = colors[lists.length % colors.length];
  const id = 'list-' + Date.now();
  lists.push({ id, name: name.trim(), color });
  renderLists();
}

// ---------- SEARCH ----------
document.getElementById('searchInput').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = getFilteredTasks().filter(t => t.title.toLowerCase().includes(q));
  taskListEl.innerHTML = '';
  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = q ? 'Tidak ada tugas yang cocok.' : 'Belum ada tugas.';
    taskListEl.appendChild(empty);
    return;
  }
  const temp = tasks;
  tasks = filtered.concat(tasks.filter(t => !filtered.includes(t)));
  renderTasksFromList(filtered);
});

function renderTasksFromList(list) {
  taskListEl.innerHTML = '';
  list.forEach(task => {
    const listInfo = getListById(task.listId);
    const card = document.createElement('div');
    card.className = 'task-card' + (selectedTaskId === task.id ? ' selected' : '');
    const tagsHtml = task.tags.map(t => `<span class="pill tag">${escapeHtml(t)}</span>`).join('');
    const listHtml = listInfo
      ? `<span class="pill list-pill"><span class="pill-dot" style="background:${listInfo.color}"></span>${escapeHtml(listInfo.name)}</span>`
      : '';
    const dateHtml = task.dueDate ? `<span class="date-tag">${formatDate(task.dueDate)}</span>` : '';
    card.innerHTML = `
      <div class="task-card-label">List Item</div>
      <div class="task-card-top">
        <span class="checkbox-circle ${task.completed ? 'checked' : ''}" data-id="${task.id}"></span>
        <div class="task-card-main">
          <div class="task-card-title ${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</div>
          <div class="task-card-bottom">${dateHtml}${tagsHtml}${listHtml}</div>
        </div>
      </div>
    `;
    card.querySelector('.checkbox-circle').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleComplete(task.id);
    });
    card.addEventListener('click', () => openTaskPanel(task.id));
    taskListEl.appendChild(card);
  });
}

// ---------- EVENT LISTENERS ----------
navToday.addEventListener('click', () => setView('today'));
navUpcoming.addEventListener('click', () => setView('upcoming'));
addListBtn.addEventListener('click', addNewList);
addTaskRow.addEventListener('click', openNewTaskPanel);
addTasksBtn.addEventListener('click', openNewTaskPanel);
saveTaskBtn.addEventListener('click', saveTask);
deleteTaskBtn.addEventListener('click', deleteTask);
addTagBtn.addEventListener('click', () => {
  const tag = prompt('Nama tag:', 'Tag ' + (draftTags.length + 1));
  if (tag && tag.trim()) {
    draftTags.push(tag.trim());
    renderDraftTags();
  }
});

document.getElementById('menuToggle').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('collapsed');
});

// ---------- INIT ----------
renderLists();
setView('today');