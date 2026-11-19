const form = document.getElementById('todo-form');
const titleInput = document.getElementById('todo-title');
const dateInput = document.getElementById('date-picker');
const todoList = document.getElementById('todo-list');
const taskCount = document.getElementById('task-count');
const emptyState = document.getElementById('empty-state');
const themeButton = document.getElementById('theme-button');
const themeIcon = document.getElementById('theme-icon');
const themeMeta = document.querySelector('meta[name="theme-color"]');

let todos = loadTodos();

function loadTodos() {
  try {
    const storedTodos = JSON.parse(localStorage.getItem('todos'));
    if (!Array.isArray(storedTodos)) return [];

    return storedTodos.filter((todo) =>
      todo &&
      typeof todo.id === 'string' &&
      typeof todo.title === 'string'
    );
  } catch {
    return [];
  }
}

function saveTodos() {
  try {
    localStorage.setItem('todos', JSON.stringify(todos));
  } catch {
    taskCount.textContent = 'No se pudo guardar la lista';
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Sin fecha';

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';

  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function createTaskElement(todo) {
  const item = document.createElement('article');
  item.className = `task-item${todo.completed ? ' completed' : ''}`;
  item.dataset.id = todo.id;

  const checkButton = document.createElement('button');
  checkButton.className = 'check-button';
  checkButton.type = 'button';
  checkButton.setAttribute(
    'aria-label',
    todo.completed ? 'Marcar como pendiente' : 'Marcar como completada'
  );
  checkButton.setAttribute('aria-pressed', String(Boolean(todo.completed)));
  checkButton.textContent = todo.completed ? '✓' : '';

  const content = document.createElement('div');
  content.className = 'task-content';

  const title = document.createElement('span');
  title.className = 'task-title';
  title.textContent = todo.title;

  const date = document.createElement('span');
  date.className = 'task-date';
  date.textContent = formatDate(todo.dueDate);

  content.append(title, date);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editButton = document.createElement('button');
  editButton.className = 'icon-button edit';
  editButton.type = 'button';
  editButton.setAttribute('aria-label', `Editar ${todo.title}`);
  editButton.textContent = '✎';

  const deleteButton = document.createElement('button');
  deleteButton.className = 'icon-button delete';
  deleteButton.type = 'button';
  deleteButton.setAttribute('aria-label', `Eliminar ${todo.title}`);
  deleteButton.textContent = '×';

  actions.append(editButton, deleteButton);
  item.append(checkButton, content, actions);
  return item;
}

function render() {
  todoList.replaceChildren();
  todos.forEach((todo) => {
    todoList.appendChild(createTaskElement(todo));
  });

  const pendingCount = todos.filter((todo) => !todo.completed).length;
  taskCount.textContent = `${pendingCount} ${pendingCount === 1 ? 'tarea' : 'tareas'} pendientes`;
  emptyState.classList.toggle('hidden', todos.length > 0);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  if (!title) return;

  todos.push({
    id: typeof globalThis.crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    dueDate: dateInput.value,
    completed: false,
  });

  titleInput.value = '';
  dateInput.value = '';
  saveTodos();
  render();
  titleInput.focus();
});

todoList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const item = button.closest('.task-item');
  const id = item.dataset.id;
  const todo = todos.find((entry) => entry.id === id);
  if (!todo) return;

  if (button.classList.contains('check-button')) {
    todo.completed = !todo.completed;
  } else if (button.classList.contains('delete')) {
    todos = todos.filter((entry) => entry.id !== id);
  } else if (button.classList.contains('edit')) {
    const titleElement = item.querySelector('.task-title');
    const editInput = document.createElement('input');
    editInput.className = 'edit-input';
    editInput.value = todo.title;
    editInput.maxLength = 100;
    editInput.setAttribute('aria-label', 'Editar nombre de la tarea');
    titleElement.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    const finishEditing = () => {
      const newTitle = editInput.value.trim();
      if (newTitle) {
        todo.title = newTitle;
        saveTodos();
      }
      render();
    };

    let editingFinished = false;
    const finishOnce = () => {
      if (editingFinished) return;
      editingFinished = true;
      finishEditing();
    };

    editInput.addEventListener('blur', finishOnce);
    editInput.addEventListener('keydown', (keyboardEvent) => {
      if (keyboardEvent.key === 'Enter') {
        keyboardEvent.preventDefault();
        finishOnce();
      }
      if (keyboardEvent.key === 'Escape') {
        editingFinished = true;
        render();
      }
    });
    return;
  }

  saveTodos();
  render();
});

function setTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  themeIcon.textContent = isDark ? '☀' : '☾';
  themeButton.setAttribute(
    'aria-label',
    isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
  );
  themeMeta.setAttribute('content', isDark ? '#17181d' : '#f3f1ec');
}

themeButton.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark');
  setTheme(isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
let storedTheme = null;
try {
  storedTheme = localStorage.getItem('theme');
} catch {
  storedTheme = null;
}
setTheme(storedTheme ? storedTheme === 'dark' : prefersDark.matches);

render();
