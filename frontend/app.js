const API = '/api/todos';
let todos = [];
let currentFilter = 'all';
let editingId = null;

// ── Utils ──────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `show ${type}`;
  setTimeout(() => el.className = '', 3000);
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ── Render ─────────────────────────────────────────────
function render() {
  const list = document.getElementById('todo-list');
  const empty = document.getElementById('empty-state');

  const filtered = todos.filter(t => {
    if (currentFilter === 'pending') return !t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });

  // Stats
  const done = todos.filter(t => t.completed).length;
  document.getElementById('count-all').textContent = `${todos.length} total`;
  document.getElementById('count-done').textContent = `${done} concluída${done !== 1 ? 's' : ''}`;
  document.getElementById('count-pending').textContent = `${todos.length - done} pendente${todos.length - done !== 1 ? 's' : ''}`;

  // Clear existing items (keep empty state)
  Array.from(list.querySelectorAll('.todo-item')).forEach(el => el.remove());

  if (filtered.length === 0) {
    empty.style.display = '';
    return;
  }
  empty.style.display = 'none';

  filtered.forEach(todo => {
    const item = document.createElement('div');
    item.className = `todo-item${todo.completed ? ' completed' : ''}`;
    item.setAttribute('data-cy', 'todo-item');
    item.setAttribute('data-id', todo.id);
    item.innerHTML = `
      <div class="checkbox-wrap">
        <input type="checkbox" class="checkbox" ${todo.completed ? 'checked' : ''} data-cy="todo-checkbox" aria-label="Concluir tarefa" />
      </div>
      <div class="todo-content">
        <div class="todo-title" data-cy="todo-title">${escapeHtml(todo.title)}</div>
        ${todo.description ? `<div class="todo-desc" data-cy="todo-desc">${escapeHtml(todo.description)}</div>` : ''}
        <div class="todo-date">${formatDate(todo.createdAt)}</div>
      </div>
      <div class="todo-actions">
        <button class="btn-icon" data-cy="edit-btn" title="Editar">✎</button>
        <button class="btn-icon danger" data-cy="delete-btn" title="Excluir">✕</button>
      </div>
    `;

    // Checkbox toggle
    item.querySelector('.checkbox').addEventListener('change', () => toggleTodo(todo.id, item));
    // Edit
    item.querySelector('[data-cy="edit-btn"]').addEventListener('click', () => openEdit(todo));
    // Delete
    item.querySelector('[data-cy="delete-btn"]').addEventListener('click', () => deleteTodo(todo.id));

    list.appendChild(item);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── API calls ──────────────────────────────────────────
async function loadTodos() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    todos = data.data || [];
    render();
  } catch {
    showToast('Erro ao carregar tarefas', 'error');
  }
}

async function addTodo() {
  const titleEl = document.getElementById('todo-title');
  const descEl = document.getElementById('todo-desc');
  const title = titleEl.value.trim();
  if (!title) { showToast('Informe um título', 'error'); titleEl.focus(); return; }

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: descEl.value.trim() })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    todos.unshift(data.data);
    titleEl.value = '';
    descEl.value = '';
    render();
    showToast('Tarefa adicionada! ✦');
  } catch (e) {
    showToast(e.message || 'Erro ao adicionar', 'error');
  }
}

async function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  try {
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    Object.assign(todo, data.data);
    render();
  } catch (e) {
    showToast('Erro ao atualizar', 'error');
  }
}

async function deleteTodo(id) {
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    todos = todos.filter(t => t.id !== id);
    render();
    showToast('Tarefa removida');
  } catch {
    showToast('Erro ao remover', 'error');
  }
}

// ── Edit modal ─────────────────────────────────────────
function openEdit(todo) {
  editingId = todo.id;
  document.getElementById('edit-title').value = todo.title;
  document.getElementById('edit-desc').value = todo.description || '';
  document.getElementById('edit-modal').classList.add('open');
  document.getElementById('edit-title').focus();
}

function closeEdit() {
  editingId = null;
  document.getElementById('edit-modal').classList.remove('open');
}

async function saveEdit() {
  const title = document.getElementById('edit-title').value.trim();
  const description = document.getElementById('edit-desc').value.trim();
  if (!title) { showToast('Título não pode ser vazio', 'error'); return; }

  try {
    const res = await fetch(`${API}/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    const idx = todos.findIndex(t => t.id === editingId);
    if (idx !== -1) Object.assign(todos[idx], data.data);
    closeEdit();
    render();
    showToast('Tarefa atualizada! ✦');
  } catch (e) {
    showToast(e.message || 'Erro ao salvar', 'error');
  }
}

// ── Event listeners ────────────────────────────────────
document.getElementById('add-btn').addEventListener('click', addTodo);
document.getElementById('todo-title').addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });
document.getElementById('save-edit').addEventListener('click', saveEdit);
document.getElementById('cancel-edit').addEventListener('click', closeEdit);
document.getElementById('edit-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeEdit(); });

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

// ── Init ───────────────────────────────────────────────
loadTodos();
