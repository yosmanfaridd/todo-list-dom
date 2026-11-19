const form = document.getElementById('todo-form');
const titleInput = document.getElementById('todo-title');
const dateInput = document.getElementById('date-picker');
const todoList = document.getElementById('todo-list');
const taskCount = document.getElementById('task-count');
const emptyState = document.getElementById('empty-state');
const themeButton = document.getElementById('theme-button');

let todos = JSON.parse(localStorage.getItem('todos')) || [];

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function formatDate(dateString) {
  if (!dateString) return 'Sin fecha';

  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function render() {
  todoList.innerHTML = '';

  todos.forEach((todo) => {
    const item = document.createElement('article');
    item.className = `task-item${todo.completed ? ' completed' : ''}`;
    item.dataset.id = todo.id;

    item.innerHTML = `
      <button class="check-button" type="button" aria-label="${todo.completed ? 'Marcar como pendiente' : 'Marcar como completada'}">
        ${todo.completed ? '✓' : ''}
      </button>
      <div class="task-content">
        <span class="task-title"></span>
        <span class="task-date">${formatDate(todo.dueDate)}</span>
      </div>
      <div class="task-actions">
        <button class="icon-button edit" type="button" aria-label="Editar tarea">✎</button>
        <button class="icon-button delete" type="button" aria-label="Eliminar tarea">×</button>
      </div>
    `;

    item.querySelector('.task-title').textContent = todo.title;
    todoList.appendChild(item);
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
    id: crypto.randomUUID(),
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

    editInput.addEventListener('blur', finishEditing);
    editInput.addEventListener('keydown', (keyboardEvent) => {
      if (keyboardEvent.key === 'Enter') editInput.blur();
      if (keyboardEvent.key === 'Escape') render();
    });
    return;
  }

  saveTodos();
  render();
});

themeButton.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeButton.innerHTML = `<span aria-hidden="true">${isDark ? '☀' : '☾'}</span>`;
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeButton.innerHTML = '<span aria-hidden="true">☀</span>';
}

render();
