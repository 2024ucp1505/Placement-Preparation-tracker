/* ============================================================
   public/script.js — Frontend (View Layer)
   Communicates with the Express REST API via fetch().
   No data is stored locally — the server is the source of truth.

   API Base: /api/questions
     GET    /api/questions            → load all (with filters)
     POST   /api/questions            → add new
     PUT    /api/questions/:id        → update existing
     DELETE /api/questions/:id        → delete
   ============================================================ */


/* ============================================================
   1. API BASE URL
   ============================================================ */
const API_BASE = '/api/questions';


/* ============================================================
   2. DOM ELEMENT REFERENCES
   ============================================================ */

// ── Form ──
const questionForm    = document.getElementById('question-form');

// ── Form Fields ──
const companyInput    = document.getElementById('company');
const topicInput      = document.getElementById('topic');
const titleInput      = document.getElementById('question-title');
const linkInput       = document.getElementById('leetcode-link');
const difficultyInput = document.getElementById('difficulty');
const statusInput     = document.getElementById('status');

// ── Buttons ──
const addBtn   = document.getElementById('add-question-btn');
const resetBtn = document.getElementById('reset-form-btn');

// ── Table ──
const tableBody      = document.getElementById('questions-table-body');
const questionsTable = document.querySelector('.questions-table');

// ── Empty State ──
const emptyState = document.getElementById('empty-state');

// ── Dashboard ──
const totalEl              = document.getElementById('total-questions');
const solvedEl             = document.getElementById('solved-questions');
const remainingEl          = document.getElementById('remaining-questions');
const progressPercentEl    = document.getElementById('progress-percent');
const progressBarFill      = document.getElementById('progress-bar-fill');
const progressBarTrack     = document.getElementById('progress-bar-track');
const progressBarPercent   = document.getElementById('progress-bar-percent');
const progressLegendSolved    = document.getElementById('progress-legend-solved');
const progressLegendRemaining = document.getElementById('progress-legend-remaining');

// ── Filters ──
const searchInput   = document.getElementById('search-input');
const filterCompany = document.getElementById('filter-company');
const filterTopic   = document.getElementById('filter-topic');


/* ============================================================
   3. APP STATE
   editingId: null  = Add mode
              number = Edit mode (that question's id)
   allQuestions holds the last fetched array for dashboard stats.
   ============================================================ */
let editingId    = null;
let allQuestions = [];   // kept in sync with every server response


/* ============================================================
   4. UTILITY — apiFetch
   Thin wrapper around fetch() that:
     - Adds Content-Type header for write requests
     - Parses JSON (or returns null for 204)
     - Throws a readable error for non-2xx responses
   ============================================================ */
async function apiFetch(url, options = {}) {
  const defaults = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = await fetch(url, { ...defaults, ...options });

  // 204 No Content — no body to parse
  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    // Throw server error message so callers can show it
    const message = data.error || `HTTP ${res.status}`;
    const err = new Error(message);
    err.fields = data.fields || null; // field-level errors from validation
    throw err;
  }

  return data;
}


/* ============================================================
   5. FUNCTION: loadQuestions()
   Fetches from GET /api/questions with current filter values.
   Stores the result in allQuestions, then renders.
   ============================================================ */
async function loadQuestions() {
  const params = new URLSearchParams();

  const search  = searchInput.value.trim();
  const company = filterCompany.value;
  const topic   = filterTopic.value;

  if (search)  params.set('search',  search);
  if (company) params.set('company', company);
  if (topic)   params.set('topic',   topic);

  const url = params.toString()
    ? `${API_BASE}?${params.toString()}`
    : API_BASE;

  try {
    const questions = await apiFetch(url);
    allQuestions = questions;
    renderQuestions(questions);
    updateDashboard();
  } catch (err) {
    console.error('Failed to load questions:', err.message);
    showToast(`❌ Could not load questions: ${err.message}`, 'error');
  }
}


/* ============================================================
   6. FUNCTION: renderQuestions(questions)
   Clears the table and re-draws rows from the given array.
   ============================================================ */
function renderQuestions(questions) {
  tableBody.innerHTML = '';

  if (!questions || questions.length === 0) {
    questionsTable.style.display = 'none';
    emptyState.style.display     = 'flex';

    const emptyText = emptyState.querySelector('.empty-state-text');
    const emptySub  = emptyState.querySelector('.empty-state-sub');

    const isFiltering = searchInput.value.trim() || filterCompany.value || filterTopic.value;

    if (isFiltering) {
      emptyText.textContent = 'No matching questions found.';
      emptySub.textContent  = 'Try adjusting your search or clearing the filters.';
    } else {
      emptyText.textContent = 'No questions added yet.';
      emptySub.textContent  = 'Fill in the form above to start tracking your progress.';
    }
    return;
  }

  questionsTable.style.display = 'table';
  emptyState.style.display     = 'none';

  questions.forEach(question => {
    const row = createTableRow(question);
    tableBody.appendChild(row);
  });
}


/* ============================================================
   7. HELPER: createTableRow(question)
   Builds a full <tr> with Edit and Delete buttons wired up.
   ============================================================ */
function createTableRow(question) {
  const row = document.createElement('tr');

  row.innerHTML = `
    <td><span class="tag-company">${question.company}</span></td>
    <td><span class="tag-topic">${question.topic}</span></td>
    <td><span class="question-title-cell">${question.title}</span></td>
    <td>${getDifficultyBadge(question.difficulty)}</td>
    <td>${getStatusBadge(question.status)}</td>
    <td>${getLinkCell(question.link)}</td>
    <td>
      <div class="actions-cell">
        <button class="btn--edit"   data-id="${question.id}" title="Edit this question">
          <i class="fa-solid fa-pen"></i> Edit
        </button>
        <button class="btn--delete" data-id="${question.id}" title="Delete this question">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    </td>
  `;

  // Wire Edit button
  row.querySelector('.btn--edit').addEventListener('click', function () {
    const target = allQuestions.find(q => q.id === Number(this.dataset.id));
    if (target) enterEditMode(target);
  });

  // Wire Delete button
  row.querySelector('.btn--delete').addEventListener('click', function () {
    deleteQuestion(Number(this.dataset.id));
  });

  return row;
}


/* ============================================================
   8. BADGE / CELL HELPERS
   ============================================================ */
function getDifficultyBadge(difficulty) {
  const classMap = { Easy: 'badge--easy', Medium: 'badge--medium', Hard: 'badge--hard' };
  return `<span class="badge ${classMap[difficulty] || 'badge--easy'}">${difficulty}</span>`;
}

function getStatusBadge(status) {
  const css = status === 'Solved' ? 'badge--solved' : 'badge--unsolved';
  return `<span class="badge ${css}">${status}</span>`;
}

function getLinkCell(link) {
  if (link) {
    return `
      <div class="link-cell">
        <a href="${link}" target="_blank" rel="noopener noreferrer">
          Open <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>`;
  }
  return '<span style="color: var(--clr-text-muted);">—</span>';
}


/* ============================================================
   9. FUNCTION: updateDashboard()
   Computes stats from allQuestions and pushes to DOM.
   NOTE: allQuestions always holds the FULL unfiltered list
         so dashboard numbers are always accurate.
   ============================================================ */
function updateDashboard() {
  // We want dashboard to always reflect the full, unfiltered count.
  // After a mutating operation (add/edit/delete), we refresh allQuestions
  // by re-fetching without filters before calling updateDashboard().
  const total     = allQuestions.length;
  const solved    = allQuestions.filter(q => q.status === 'Solved').length;
  const remaining = total - solved;
  const percent   = total === 0 ? 0 : Math.round((solved / total) * 100);

  totalEl.textContent              = total;
  solvedEl.textContent             = solved;
  remainingEl.textContent          = remaining;
  progressPercentEl.textContent    = percent + '%';
  progressBarFill.style.width      = percent + '%';
  progressBarTrack.setAttribute('aria-valuenow', percent);
  progressBarPercent.textContent   = percent + '%';
  progressLegendSolved.textContent    = solved;
  progressLegendRemaining.textContent = remaining;
}


/* ============================================================
   10. FUNCTION: handleFormSubmit(event)
   Unified Add + Edit handler.
   Calls POST (add) or PUT (edit) then refreshes the view.
   ============================================================ */
async function handleFormSubmit(event) {
  event.preventDefault();

  const payload = {
    company:    companyInput.value.trim(),
    topic:      topicInput.value.trim(),
    title:      titleInput.value.trim(),
    link:       linkInput.value.trim(),
    difficulty: difficultyInput.value.trim(),
    status:     statusInput.value.trim(),
  };

  // Quick client-side presence checks (full validation is server-side)
  if (!payload.company)    { showToast('⚠️ Please select a Company.',         'warning'); companyInput.focus();    return; }
  if (!payload.topic)      { showToast('⚠️ Please select a Topic.',           'warning'); topicInput.focus();      return; }
  if (!payload.title)      { showToast('⚠️ Please enter the Question Title.', 'warning'); titleInput.focus();      return; }
  if (!payload.difficulty) { showToast('⚠️ Please select a Difficulty.',      'warning'); difficultyInput.focus(); return; }
  if (!payload.status)     { showToast('⚠️ Please select a Status.',          'warning'); statusInput.focus();     return; }

  try {
    if (editingId !== null) {
      // ── EDIT MODE ── PUT /api/questions/:id
      await apiFetch(`${API_BASE}/${editingId}`, {
        method: 'PUT',
        body:   JSON.stringify(payload),
      });

      showToast('✅ Question updated successfully!', 'success');
      exitEditMode();
    } else {
      // ── ADD MODE ── POST /api/questions
      await apiFetch(API_BASE, {
        method: 'POST',
        body:   JSON.stringify(payload),
      });

      showToast('✅ Question added successfully!', 'success');
      questionForm.reset();
    }

    // Refresh full list (no filters) then re-apply current filter view
    await refreshAll();
    scrollToTable();

  } catch (err) {
    // Show server-side validation errors if present
    if (err.fields) {
      const msgs = Object.values(err.fields).join('\n');
      showToast(`⚠️ ${msgs}`, 'warning');
    } else {
      showToast(`❌ ${err.message}`, 'error');
    }
  }
}


/* ============================================================
   11. FUNCTION: deleteQuestion(id)
   Asks for confirmation then calls DELETE /api/questions/:id.
   ============================================================ */
async function deleteQuestion(id) {
  const confirmed = confirm('🗑️  Delete this question?\nThis action cannot be undone.');
  if (!confirmed) return;

  try {
    await apiFetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    showToast('🗑️ Question deleted.', 'info');
    await refreshAll();
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }
}


/* ============================================================
   12. EDIT MODE HELPERS
   ============================================================ */
function enterEditMode(question) {
  editingId = question.id;

  companyInput.value    = question.company;
  topicInput.value      = question.topic;
  titleInput.value      = question.title;
  linkInput.value       = question.link;
  difficultyInput.value = question.difficulty;
  statusInput.value     = question.status;

  addBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Update Question';
  questionForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  companyInput.focus();
}

function exitEditMode() {
  editingId = null;
  questionForm.reset();
  addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Question';
}


/* ============================================================
   13. HELPER: refreshAll()
   Fetches the complete list (no filters) to update allQuestions
   for the dashboard, then re-fetches with current filters for
   the table view.
   ============================================================ */
async function refreshAll() {
  // Fetch unfiltered to get accurate dashboard numbers
  try {
    allQuestions = await apiFetch(API_BASE);
    updateDashboard();
  } catch (err) {
    console.error('Dashboard refresh failed:', err.message);
  }

  // Re-apply current search/filter for the table
  await loadQuestions();
}


/* ============================================================
   14. HELPER: scrollToTable()
   ============================================================ */
function scrollToTable() {
  const tableSection = document.querySelector('.question-list');
  if (tableSection) {
    tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


/* ============================================================
   15. TOAST NOTIFICATION SYSTEM
   Replaces blocking alert() calls with a non-blocking toast.
   Types: 'success' | 'error' | 'warning' | 'info'
   ============================================================ */
function showToast(message, type = 'info') {
  // Create toast container on first use
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; bottom: 24px; right: 24px;
      display: flex; flex-direction: column; gap: 10px;
      z-index: 9999; max-width: 360px;
    `;
    document.body.appendChild(container);
  }

  const colorMap = {
    success: { bg: '#dcfce7', border: '#16a34a', text: '#15803d', icon: '✅' },
    error:   { bg: '#fee2e2', border: '#dc2626', text: '#b91c1c', icon: '❌' },
    warning: { bg: '#fef3c7', border: '#d97706', text: '#b45309', icon: '⚠️' },
    info:    { bg: '#dbeafe', border: '#2563eb', text: '#1d4ed8', icon: 'ℹ️' },
  };

  const c = colorMap[type] || colorMap.info;

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: ${c.bg};
    border: 1.5px solid ${c.border};
    color: ${c.text};
    padding: 12px 16px;
    border-radius: 10px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    display: flex; align-items: flex-start; gap: 10px;
    animation: toastIn 0.3s ease;
    cursor: pointer;
  `;
  toast.innerHTML = `<span style="font-size:1.1rem;line-height:1">${c.icon}</span><span>${message}</span>`;

  // Inject keyframe once
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes toastIn  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      @keyframes toastOut { from { opacity:1; transform:translateY(0);     } to { opacity:0; transform:translateY(12px); } }
    `;
    document.head.appendChild(style);
  }

  container.appendChild(toast);

  // Auto-dismiss after 3.5 seconds
  const dismiss = () => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  };

  toast.addEventListener('click', dismiss);
  setTimeout(dismiss, 3500);
}


/* ============================================================
   16. EVENT LISTENERS
   ============================================================ */
questionForm.addEventListener('submit', handleFormSubmit);

resetBtn.addEventListener('click', () => {
  if (editingId !== null) exitEditMode();
});

// Search & filter — debounced for performance
let filterTimer;
function onFilterChange() {
  clearTimeout(filterTimer);
  filterTimer = setTimeout(loadQuestions, 300);
}

searchInput.addEventListener('input',    onFilterChange);
filterCompany.addEventListener('change', loadQuestions);
filterTopic.addEventListener('change',   loadQuestions);


/* ============================================================
   17. FUNCTION: init()
   Entry point — called on page load.
   ============================================================ */
async function init() {
  console.log('🚀 Placement Tracker initialising (API mode)...');
  await refreshAll();
  console.log('🖥️  Initial render complete.');
}

// Start the app
init();