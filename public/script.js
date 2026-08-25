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
const accordionView  = document.getElementById('accordion-view');

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

// ── Tabs & Modal ──
const tabs = document.querySelectorAll('.tab-btn');
const notesModal = document.getElementById('notes-modal');
const closeNotesModalBtn = document.getElementById('close-notes-modal');
const notesTextarea = document.getElementById('notes-textarea');
const notesQuestionId = document.getElementById('notes-question-id');
const saveNotesBtn = document.getElementById('save-notes-btn');

/* ============================================================
   3. APP STATE
   editingId: null  = Add mode
              number = Edit mode (that question's id)
   allQuestions holds the last fetched array for dashboard stats.
   ============================================================ */
let editingId    = null;
let allQuestions = [];   // kept in sync with every server response
let currentCategory = 'DSA';
let isRevision = false;


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

  if (isRevision) {
    params.set('starred', 'true');
  } else {
    params.set('category', currentCategory);
  }

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

  accordionView.innerHTML = '';

  if (!questions || questions.length === 0) {
    questionsTable.style.display = 'none';
    accordionView.style.display  = 'none';
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

  emptyState.style.display = 'none';

  // Always use table for Revision as it aggregates across categories
  if (isRevision) {
    accordionView.style.display = 'none';
    questionsTable.style.display = 'table';
    questions.forEach(question => {
      const row = createTableRow(question);
      tableBody.appendChild(row);
    });
    return;
  }
  
  if (currentCategory === 'DSA') {
    questionsTable.style.display = 'none';
    accordionView.style.display = 'block';
    accordionView.innerHTML = '';
    
    // Group by topic
    const grouped = {};
    questions.forEach(q => {
      const topic = q.topic || 'General';
      if (!grouped[topic]) grouped[topic] = [];
      grouped[topic].push(q);
    });
    
    // Create an accordion using DOM elements so we can reuse createTableRow()
    for (const topic in grouped) {
      const chapterDiv = document.createElement('div');
      chapterDiv.className = 'accordion-chapter';
      chapterDiv.style.marginBottom = '1rem'; // spacing between topics
      
      const header = document.createElement('div');
      header.className = 'chapter-header';
      header.onclick = function() { chapterDiv.classList.toggle('open'); };
      header.innerHTML = `
        <h4 class="chapter-title"><i class="fa-solid fa-folder-open"></i> ${topic}</h4>
        <div class="chapter-stats">
          <span>${grouped[topic].length} Questions</span>
          <i class="fa-solid fa-chevron-down chevron"></i>
        </div>
      `;
      
      const content = document.createElement('div');
      content.className = 'chapter-content';
      
      const tableWrap = document.createElement('div');
      tableWrap.className = 'table-wrap';
      tableWrap.style.margin = '0';
      tableWrap.style.padding = '1rem';
      
      const table = document.createElement('table');
      table.className = 'questions-table';
      table.innerHTML = `
        <thead>
          <tr>
            <th>Company</th>
            <th>Topic</th>
            <th>Question</th>
            <th>Difficulty</th>
            <th>Status</th>
            <th>Link</th>
            <th>Star</th>
            <th>Actions</th>
          </tr>
        </thead>
      `;
      
      const tBody = document.createElement('tbody');
      grouped[topic].forEach(q => {
        tBody.appendChild(createTableRow(q));
      });
      table.appendChild(tBody);
      tableWrap.appendChild(table);
      content.appendChild(tableWrap);
      
      chapterDiv.appendChild(header);
      chapterDiv.appendChild(content);
      accordionView.appendChild(chapterDiv);
    }
    
    return;
  }

  // For Core and Development, use the original markdown accordion view
  questionsTable.style.display = 'none';
  accordionView.style.display  = 'block';
  renderAccordion(questions);
}

/* ============================================================
   6B. FUNCTION: renderAccordion(questions)
   Groups questions by Subject (topic) -> Chapter (chapter),
   and builds a nested HTML structure for them.
   ============================================================ */
function renderAccordion(questions) {
  // 1. Group by Topic (Subject)
  const grouped = {};
  questions.forEach(q => {
    const subject = q.topic || 'General';
    const chapter = q.chapter || 'Miscellaneous';
    if (!grouped[subject]) grouped[subject] = {};
    if (!grouped[subject][chapter]) grouped[subject][chapter] = [];
    grouped[subject][chapter].push(q);
  });

  // 2. Build HTML
  let html = '';
  for (const subject in grouped) {
    html += `<div class="accordion-subject"><h3 class="subject-title"><i class="fa-solid fa-book"></i> ${subject}</h3>`;
    
    for (const chapter in grouped[subject]) {
      html += `
      <div class="accordion-chapter">
        <div class="chapter-header" onclick="this.parentElement.classList.toggle('open')">
          <h4 class="chapter-title"><i class="fa-solid fa-folder-open"></i> ${chapter}</h4>
          <div class="chapter-stats">
            <span>${grouped[subject][chapter].length} Topics</span>
            <i class="fa-solid fa-chevron-down chevron"></i>
          </div>
        </div>
        <div class="chapter-content">
          <div class="topic-list">
      `;
      
      grouped[subject][chapter].forEach(q => {
        const starClass = q.starred ? 'star-btn starred' : 'star-btn';
        const starIcon = q.starred ? 'fa-solid fa-star' : 'fa-regular fa-star';
        const checked = q.status === 'Solved' ? 'checked' : '';
        
        html += `
          <div class="topic-item" data-id="${q.id}">
            <div class="topic-header" onclick="toggleTopicContent(this)">
              <div class="topic-left">
                <i class="fa-solid fa-file-lines topic-icon"></i>
                <span class="topic-title-text">${q.title}</span>
              </div>
              <div class="topic-right" onclick="event.stopPropagation()">
                <input type="checkbox" class="status-checkbox" data-id="${q.id}" ${checked} title="Toggle Solved Status">
                <button class="${starClass}" data-id="${q.id}" title="Star this topic">
                  <i class="${starIcon}"></i>
                </button>
                <button class="btn--notes" data-id="${q.id}" title="Notes">
                  <i class="fa-regular fa-clipboard"></i>
                </button>
              </div>
            </div>
            <div class="topic-body markdown-body" style="display: none;">
              <!-- Markdown content rendered dynamically -->
            </div>
          </div>
        `;
      });
      
      html += `
            </div>
          </div>
        </div>
      `;
    }
    
    html += `</div>`; // Close Subject
  }

  accordionView.innerHTML = html;

  // 3. Attach event listeners
  accordionView.querySelectorAll('.btn--notes').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const idStr = this.dataset.id;
      const target = allQuestions.find(q => String(q.id) === idStr || String(q._id) === idStr);
      if (target) openNotesModal(target);
    });
  });

  accordionView.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.stopPropagation();
      const idStr = this.dataset.id;
      const target = allQuestions.find(q => String(q.id) === idStr || String(q._id) === idStr);
      if (target) await toggleStar(target);
    });
  });

  accordionView.querySelectorAll('.status-checkbox').forEach(chk => {
    chk.addEventListener('change', async function(e) {
      e.stopPropagation();
      const idStr = this.dataset.id;
      const target = allQuestions.find(q => String(q.id) === idStr || String(q._id) === idStr);
      if (target) {
        const newStatus = this.checked ? 'Solved' : 'Unsolved';
        await toggleStatus(target, newStatus);
      }
    });
  });

  accordionView.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const idStr = this.dataset.id;
      const target = allQuestions.find(q => String(q.id) === idStr || String(q._id) === idStr);
      if (target) openModal(target);
    });
  });

  accordionView.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.stopPropagation();
      if (confirm('Are you sure you want to delete this question?')) {
        const idStr = this.dataset.id;
        try {
          await apiFetch(`${API_BASE}/${idStr}`, { method: 'DELETE' });
          showToast('✅ Question deleted successfully.', 'success');
          await refreshAll();
        } catch (err) {
          showToast(`❌ Failed to delete question: ${err.message}`, 'error');
        }
      }
    });
  });
}

window.toggleTopicContent = function(headerEl) {
  const itemEl = headerEl.closest('.topic-item');
  const bodyEl = itemEl.querySelector('.topic-body');
  const id = itemEl.dataset.id;
  
  if (bodyEl.style.display === 'none') {
    // Open
    bodyEl.style.display = 'block';
    itemEl.classList.add('open');
    
    // Render markdown if not rendered yet
    if (!bodyEl.dataset.rendered) {
      const q = allQuestions.find(q => String(q.id) === id);
      if (q && q.content) {
        bodyEl.innerHTML = marked.parse(q.content);
      } else {
        bodyEl.innerHTML = '<p class="empty-content">No detailed content available for this topic.</p>';
      }
      bodyEl.dataset.rendered = 'true';
    }
  } else {
    // Close
    bodyEl.style.display = 'none';
    itemEl.classList.remove('open');
  }
};


/* ============================================================
   7. HELPER: createTableRow(question)
   Builds a full <tr> with Edit and Delete buttons wired up.
   ============================================================ */
function createTableRow(question) {
  const row = document.createElement('tr');

  const starClass = question.starred ? 'star-btn starred' : 'star-btn';
  const starIcon = question.starred ? 'fa-solid fa-star' : 'fa-regular fa-star';

  row.innerHTML = `
    <td><span class="tag-company">${question.company}</span></td>
    <td><span class="tag-topic">${question.topic}</span></td>
    <td><span class="question-title-cell">${question.title}</span></td>
    <td>${getDifficultyBadge(question.difficulty)}</td>
    <td>
      <input type="checkbox" class="status-checkbox" data-id="${question.id}" ${question.status === 'Solved' ? 'checked' : ''} title="Toggle Solved Status" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary);">
    </td>
    <td>${getLinkCell(question.link)}</td>
    <td style="text-align: center;">
      <button class="${starClass}" data-id="${question.id}" title="Star this question">
        <i class="${starIcon}"></i>
      </button>
    </td>
    <td>
      <div class="actions-cell">
        <button class="btn--notes" data-id="${question.id}" title="Notes">
          <i class="fa-regular fa-clipboard"></i> Notes
        </button>
        ${question.category === 'DSA' ? `
        <button class="btn--edit" data-id="${question.id}" title="Edit this question">
          <i class="fa-solid fa-pen"></i> Edit
        </button>
        <button class="btn--delete" data-id="${question.id}" title="Delete this question">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
        ` : ''}
      </div>
    </td>
  `;

  // Wire Notes button
  row.querySelector('.btn--notes').addEventListener('click', function () {
    const target = allQuestions.find(q => String(q.id) === String(this.dataset.id));
    if (target) openNotesModal(target);
  });

  // Wire Edit button (if exists)
  const editBtn = row.querySelector('.btn--edit');
  if (editBtn) {
    editBtn.addEventListener('click', function () {
      const target = allQuestions.find(q => String(q.id) === String(this.dataset.id));
      if (target) enterEditMode(target);
    });
  }

  // Wire Delete button (if exists)
  const delBtn = row.querySelector('.btn--delete');
  if (delBtn) {
    delBtn.addEventListener('click', function () {
      deleteQuestion(this.dataset.id);
    });
  }

  // Wire Star button
  row.querySelector('.star-btn').addEventListener('click', async function () {
    const target = allQuestions.find(q => String(q.id) === String(this.dataset.id));
    if (target) await toggleStar(target);
  });

  // Wire Status Checkbox
  row.querySelector('.status-checkbox').addEventListener('change', async function () {
    const target = allQuestions.find(q => String(q.id) === String(this.dataset.id));
    if (target) {
      const newStatus = this.checked ? 'Solved' : 'Unsolved';
      await toggleStatus(target, newStatus);
    }
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
   12A. NEW FEATURES HELPERS (Star & Notes)
   ============================================================ */
async function toggleStar(question) {
  try {
    await apiFetch(`${API_BASE}/${question.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...question, starred: !question.starred }),
    });
    // Optimistic update locally
    question.starred = !question.starred;
    showToast(question.starred ? '⭐ Added to revision list.' : 'Removed from revision list.', 'success');
    // If we are in revision tab, we might want to refresh to remove it, otherwise just re-render
    if (isRevision) {
      await refreshAll();
    } else {
      if (currentCategory === 'Core' || currentCategory === 'Development') {
        const btn = document.querySelector(`.star-btn[data-id="${question.id || question._id}"]`);
        if (btn) {
          btn.className = question.starred ? 'star-btn starred' : 'star-btn';
          btn.innerHTML = `<i class="${question.starred ? 'fa-solid fa-star' : 'fa-regular fa-star'}"></i>`;
        }
      } else {
        renderQuestions(allQuestions); 
      }
    }
  } catch (err) {
    showToast(`❌ Failed to update star: ${err.message}`, 'error');
  }
}

async function toggleStatus(question, newStatus) {
  try {
    await apiFetch(`${API_BASE}/${question.id || question._id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...question, status: newStatus }),
    });
    // Optimistic update locally
    question.status = newStatus;
    showToast(`✅ Marked as ${newStatus}.`, 'success');
    updateDashboard();
  } catch (err) {
    showToast(`❌ Failed to update status: ${err.message}`, 'error');
    // Revert checkbox state
    const chk = document.querySelector(`.status-checkbox[data-id="${question.id || question._id}"]`);
    if (chk) chk.checked = !chk.checked;
  }
}

function openNotesModal(question) {
  notesQuestionId.value = question.id || question._id;
  notesTextarea.value = question.notes || '';
  notesModal.setAttribute('aria-hidden', 'false');
  notesTextarea.focus();
}

function closeNotesModal() {
  notesModal.setAttribute('aria-hidden', 'true');
  notesQuestionId.value = '';
  notesTextarea.value = '';
}

async function saveNotes() {
  const id = notesQuestionId.value;
  const notes = notesTextarea.value.trim();
  const target = allQuestions.find(q => String(q.id) === id || String(q._id) === id);
  if (!target) return;

  try {
    await apiFetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...target, notes }),
    });
    target.notes = notes;
    showToast('✅ Notes saved successfully.', 'success');
    closeNotesModal();
  } catch (err) {
    showToast(`❌ Failed to save notes: ${err.message}`, 'error');
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

// Tabs functionality
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    const cat = tab.dataset.category;
    if (cat === 'Revision') {
      isRevision = true;
    } else {
      isRevision = false;
      currentCategory = cat;
    }

    // Hide the "Add Question" form if not in DSA
    const addSection = document.querySelector('.add-question');
    if (addSection) {
      addSection.style.display = (cat === 'DSA') ? 'block' : 'none';
    }

    loadQuestions();
  });
});

// Modal functionality
closeNotesModalBtn.addEventListener('click', closeNotesModal);
notesModal.addEventListener('click', (e) => {
  if (e.target === notesModal) closeNotesModal();
});
saveNotesBtn.addEventListener('click', saveNotes);


/* ============================================================
   17. FUNCTION: init()
   Entry point — called on page load.
   ============================================================ */
async function init() {
  console.log('🚀 Placement Tracker initialising (API mode)...');
  
  // Check auth state
  try {
    const res = await fetch('/api/auth/current_user');
    if (!res.ok) throw new Error('Auth check failed');
    const user = await res.json();
    
    if (!user) {
      // Not logged in -> redirect to landing page
      window.location.href = '/';
      return;
    }

    // Populate user profile
    document.getElementById('user-name').textContent = user.displayName || 'User';
    if (user.avatar) {
      const img = document.getElementById('user-avatar');
      img.src = user.avatar;
      img.style.display = 'block';
    }
  } catch (err) {
    console.error('Failed to authenticate:', err);
    window.location.href = '/';
    return;
  }

  await refreshAll();
  console.log('🖥️  Initial render complete.');
}

// Start the app
init();