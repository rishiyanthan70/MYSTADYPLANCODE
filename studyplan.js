// ================================================
// STUDY PLAN PAGE FUNCTIONALITY (studyplan.html)
// ================================================
 
class StudyPlanApp {
  constructor() {
    this.groups = [];
    this.tasks = [];
    this.selectedGroupId = null;
    this.init();
  }
 
  init() {
    this.loadData();
    this.attachListeners();
    this.generateCalendar();
    this.startClock();
    this.renderGroups();
    this.renderTasks();
  }
 
  loadData() {
    const stored = localStorage.getItem('studyAppData');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.groups = data.groups || [];
        this.tasks = data.tasks || [];
      } catch (e) {
        console.error('Load error:', e);
      }
    }
  }
 
  saveData() {
    let data = { groups: this.groups, tasks: this.tasks, subjects: [], dayOrders: [], folders: [] };
    const stored = localStorage.getItem('studyAppData');
    if (stored) {
      try {
        const existing = JSON.parse(stored);
        data.subjects = existing.subjects || [];
        data.dayOrders = existing.dayOrders || [];
        data.folders = existing.folders || [];
      } catch (e) {}
    }
    localStorage.setItem('studyAppData', JSON.stringify(data));
  }
 
  notify(msg) {
    const notif = document.getElementById('notification');
    document.getElementById('notifText').textContent = msg;
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 2500);
  }
 
  attachListeners() {
    // Create Plan Group
    document.getElementById('createGroupBtn').addEventListener('click', () => {
      document.getElementById('createGroupModal').classList.add('active');
    });
 
    const groupModal = document.getElementById('createGroupModal');
    document.getElementById('createGroupOverlay').addEventListener('click', () => {
      groupModal.classList.remove('active');
    });
    document.getElementById('closeGroupModal').addEventListener('click', () => {
      groupModal.classList.remove('active');
    });
    document.getElementById('cancelGroupModal').addEventListener('click', () => {
      groupModal.classList.remove('active');
    });
 
    document.getElementById('confirmGroupModal').addEventListener('click', () => {
      const name = document.getElementById('groupName').value.trim();
      if (!name) {
        this.notify('Enter group name!');
        return;
      }
      this.groups.push({
        id: Date.now(),
        name: name,
        date: new Date().toLocaleDateString()
      });
      this.saveData();
      document.getElementById('groupName').value = '';
      groupModal.classList.remove('active');
      this.renderGroups();
      this.notify('📋 Plan Group created!');
    });
 
    // Create Plan
    document.getElementById('createPlanBtn').addEventListener('click', () => {
      if (this.groups.length === 0) {
        this.notify('Create a plan group first!');
        return;
      }
      document.getElementById('createPlanModal').classList.add('active');
      this.updateGroupSelect();
    });
 
    const planModal = document.getElementById('createPlanModal');
    document.getElementById('createPlanOverlay').addEventListener('click', () => {
      planModal.classList.remove('active');
    });
    document.getElementById('closePlanModal').addEventListener('click', () => {
      planModal.classList.remove('active');
    });
    document.getElementById('cancelPlanModal').addEventListener('click', () => {
      planModal.classList.remove('active');
    });
 
    document.getElementById('confirmPlanModal').addEventListener('click', () => {
      const groupId = parseInt(document.getElementById('groupSelect').value);
      const name = document.getElementById('planName').value.trim();
      const desc = document.getElementById('planDesc').value.trim();
 
      if (!groupId) {
        this.notify('Select a group!');
        return;
      }
      if (!name) {
        this.notify('Enter plan name!');
        return;
      }
 
      this.tasks.push({
        id: Date.now(),
        groupId: groupId,
        name: name,
        desc: desc,
        completed: false,
        date: new Date().toLocaleDateString()
      });
 
      this.saveData();
      document.getElementById('planName').value = '';
      document.getElementById('planDesc').value = '';
      planModal.classList.remove('active');
      this.renderTasks();
      this.notify('✅ Plan created!');
    });
 
    // Clear buttons
    document.getElementById('clearNonCompletedBtn').addEventListener('click', () => {
      const nonCompleted = this.tasks.filter(t => !t.completed && (!this.selectedGroupId || t.groupId === this.selectedGroupId));
      if (nonCompleted.length === 0) {
        this.notify('No non-completed tasks to clear!');
        return;
      }
      if (confirm('Delete all non-completed tasks in this group?')) {
        this.tasks = this.tasks.filter(t => t.completed || (this.selectedGroupId && t.groupId !== this.selectedGroupId));
        this.saveData();
        this.renderTasks();
        this.notify('🗑️ Tasks cleared!');
      }
    });
 
    document.getElementById('clearCompletedBtn').addEventListener('click', () => {
      const completed = this.tasks.filter(t => t.completed && (!this.selectedGroupId || t.groupId === this.selectedGroupId));
      if (completed.length === 0) {
        this.notify('No completed tasks to clear!');
        return;
      }
      if (confirm('Delete all completed tasks in this group?')) {
        this.tasks = this.tasks.filter(t => !t.completed || (this.selectedGroupId && t.groupId !== this.selectedGroupId));
        this.saveData();
        this.renderTasks();
        this.notify('🗑️ Tasks cleared!');
      }
    });
  }
 
  updateGroupSelect() {
    const select = document.getElementById('groupSelect');
    select.innerHTML = '<option value="">-- Select Group --</option>';
    this.groups.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = g.name;
      if (this.selectedGroupId === g.id) opt.selected = true;
      select.appendChild(opt);
    });
  }
 
  renderGroups() {
    const container = document.getElementById('groupsList');
    if (this.groups.length === 0) {
      container.innerHTML = '<p class="hint-text">No groups</p>';
      return;
    }
 
    container.innerHTML = this.groups.map(g => `
      <div class="group-item ${this.selectedGroupId === g.id ? 'active' : ''}" onclick="studyPlanApp.selectGroup(${g.id})">
        <div class="group-name">📋 ${this.escapeHtml(g.name)}</div>
        <button class="group-delete-btn" onclick="studyPlanApp.deleteGroup(${g.id}); event.stopPropagation();">🗑️</button>
      </div>
    `).join('');
  }
 
  selectGroup(id) {
    this.selectedGroupId = this.selectedGroupId === id ? null : id;
    this.renderGroups();
    this.renderTasks();
  }
 
  deleteGroup(id) {
    if (confirm('Delete this group and all its plans?')) {
      this.groups = this.groups.filter(g => g.id !== id);
      this.tasks = this.tasks.filter(t => t.groupId !== id);
      if (this.selectedGroupId === id) this.selectedGroupId = null;
      this.saveData();
      this.renderGroups();
      this.renderTasks();
      this.notify('📋 Group deleted!');
    }
  }
 
  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveData();
      this.renderTasks();
      this.notify(task.completed ? '✅ Task completed!' : '↻ Marked incomplete');
    }
  }
 
  renderTasks() {
    let filtered = this.tasks;
    if (this.selectedGroupId) {
      filtered = this.tasks.filter(t => t.groupId === this.selectedGroupId);
    }
 
    const nonCompleted = filtered.filter(t => !t.completed);
    const completed = filtered.filter(t => t.completed);
 
    // Render non-completed
    const nonCompContainer = document.getElementById('nonCompletedTasks');
    if (nonCompleted.length === 0) {
      nonCompContainer.innerHTML = '<p class="hint-text">No tasks</p>';
    } else {
      nonCompContainer.innerHTML = nonCompleted.map(t => `
        <div class="task-item">
          <input type="checkbox" class="task-checkbox" onchange="studyPlanApp.toggleTask(${t.id})">
          <div class="task-content">
            <div class="task-name">${this.escapeHtml(t.name)}</div>
            ${t.desc ? `<div class="task-desc">${this.escapeHtml(t.desc)}</div>` : ''}
            <div class="task-date">${t.date}</div>
          </div>
        </div>
      `).join('');
    }
 
    // Render completed
    const compContainer = document.getElementById('completedTasks');
    if (completed.length === 0) {
      compContainer.innerHTML = '<p class="hint-text">No completed</p>';
    } else {
      compContainer.innerHTML = completed.map(t => `
        <div class="task-item completed">
          <input type="checkbox" class="task-checkbox" checked onchange="studyPlanApp.toggleTask(${t.id})">
          <div class="task-content">
            <div class="task-name">${this.escapeHtml(t.name)}</div>
            ${t.desc ? `<div class="task-desc">${this.escapeHtml(t.desc)}</div>` : ''}
            <div class="task-date">${t.date}</div>
          </div>
        </div>
      `).join('');
    }
  }
 
  generateCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
 
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
 
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();
    const nextDays = 7 - new Date(year, month + 1, 0).getDay();
 
    let html = `<div class="calendar-month">${monthNames[month]} ${year}</div><div class="calendar-grid">`;
 
    for (let i = firstDay; i > 0; i--) {
      html += `<div class="calendar-day other">${prevLastDay - i + 1}</div>`;
    }
 
    for (let i = 1; i <= lastDay; i++) {
      const isToday = i === today;
      html += `<div class="calendar-day ${isToday ? 'today' : ''}">${i}</div>`;
    }
 
    for (let i = 1; i <= nextDays; i++) {
      html += `<div class="calendar-day other">${i}</div>`;
    }
 
    html += '</div>';
    document.getElementById('calendarWidget').innerHTML = html;
  }
 
  startClock() {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      document.getElementById('currentTime').textContent = `${h}:${m}:${s}`;
    };
    update();
    setInterval(update, 1000);
  }
 
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
 
let studyPlanApp = new StudyPlanApp();
 