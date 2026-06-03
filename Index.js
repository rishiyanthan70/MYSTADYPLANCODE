// ================================================
// HOME PAGE FUNCTIONALITY (index.html)
// ================================================
 
class HomeApp {
  constructor() {
    this.subjects = [];
    this.dayOrders = [];
    this.folders = [];
    this.pendingFiles = [];
    this.currentDay = 1;
    this.init();
  }
 
  init() {
    this.loadData();
    this.attachListeners();
    this.startClock();
    this.renderSubjects();
    this.renderDayOrders();
  }
 
  loadData() {
    const stored = localStorage.getItem('studyAppData');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.subjects = data.subjects || [];
        this.dayOrders = data.dayOrders || [];
        this.folders = data.folders || [];
      } catch (e) {
        console.error('Load error:', e);
      }
    }
  }
 
  saveData() {
    localStorage.setItem('studyAppData', JSON.stringify({
      subjects: this.subjects,
      dayOrders: this.dayOrders,
      folders: this.folders
    }));
  }
 
  notify(msg) {
    const notif = document.getElementById('notification');
    document.getElementById('notifText').textContent = msg;
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 2500);
  }
 
  attachListeners() {
    // Create Subject
    document.getElementById('createSubjectBtn').addEventListener('click', () => {
      const name = document.getElementById('subjectInput').value.trim();
      const desc = document.getElementById('descInput').value.trim();
      if (!name) {
        this.notify('Please enter subject name!');
        return;
      }
      this.subjects.push({
        id: Date.now(),
        name,
        desc,
        date: new Date().toLocaleDateString()
      });
      this.saveData();
      document.getElementById('subjectInput').value = '';
      document.getElementById('descInput').value = '';
      this.renderSubjects();
      this.notify('Subject created!');
    });
 
    // Reset
    document.getElementById('resetBtn').addEventListener('click', () => {
      document.getElementById('subjectInput').value = '';
      document.getElementById('descInput').value = '';
    });
 
    // Search
    document.getElementById('searchBtn').addEventListener('click', () => {
      this.search();
    });
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.search();
    });
 
    // Create Day-Order
    document.getElementById('createDayOrderBtn').addEventListener('click', () => {
      const day = document.getElementById('daySelect').value;
      const subject = document.getElementById('daySubjectInput').value.trim();
      const start = document.getElementById('startTime').value;
      const end = document.getElementById('endTime').value;
      if (!subject || !start || !end) {
        this.notify('Please fill all day-order fields!');
        return;
      }
      this.dayOrders.push({
        id: Date.now(),
        day,
        subject,
        start,
        end
      });
      this.saveData();
      document.getElementById('daySubjectInput').value = '';
      document.getElementById('startTime').value = '';
      document.getElementById('endTime').value = '';
      this.renderDayOrders();
      this.notify('Day-order created!');
    });
 
    // Day tabs
    document.querySelectorAll('.day-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active-tab'));
        tab.classList.add('active-tab');
        this.currentDay = tab.dataset.day;
        this.renderDayOrders();
      });
    });
 
    // Folder: Add File
    document.getElementById('addPendingFileBtn').addEventListener('click', () => {
      document.getElementById('addFileModal').classList.add('active');
    });
 
    // File Modal
    const fileModal = document.getElementById('addFileModal');
    document.getElementById('addFileOverlay').addEventListener('click', () => {
      fileModal.classList.remove('active');
    });
    document.getElementById('closeAddFile').addEventListener('click', () => {
      fileModal.classList.remove('active');
    });
    document.getElementById('uploadZone').addEventListener('click', () => {
      document.getElementById('fileInputHidden').click();
    });
    document.getElementById('fileInputHidden').addEventListener('change', (e) => {
      document.getElementById('pendingFileName').value = e.target.files[0]?.name || '';
    });
    document.getElementById('confirmAddFile').addEventListener('click', () => {
      const fileName = document.getElementById('pendingFileName').value.trim();
      if (!fileName) {
        this.notify('Enter file name!');
        return;
      }
      this.pendingFiles.push(fileName);
      this.renderPendingFiles();
      document.getElementById('pendingFileName').value = '';
      fileModal.classList.remove('active');
    });
    document.getElementById('cancelAddFile').addEventListener('click', () => {
      fileModal.classList.remove('active');
    });
 
    // Create Folder
    document.getElementById('createFolderBtn').addEventListener('click', () => {
      const folderName = document.getElementById('folderNameInput').value.trim();
      if (!folderName) {
        this.notify('Enter folder name!');
        return;
      }
      if (this.pendingFiles.length === 0) {
        this.notify('Add at least one file!');
        return;
      }
      this.folders.push({
        id: Date.now(),
        name: folderName,
        files: [...this.pendingFiles],
        date: new Date().toLocaleDateString()
      });
      this.saveData();
      this.pendingFiles = [];
      this.renderPendingFiles();
      document.getElementById('folderNameInput').value = '';
      this.notify('Folder created!');
    });
 
    // Study Plan Navigation
    document.getElementById('goStudyPlanBtn').addEventListener('click', () => {
      location.href = 'studyplan.html';
    });
  }
 
  search() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const container = document.getElementById('searchResults');
 
    if (!query) {
      container.innerHTML = '<p class="hint-text">type something to search…</p>';
      return;
    }
 
    const results = this.subjects.filter(s =>
      s.name.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query)
    );
 
    if (results.length === 0) {
      container.innerHTML = '<p class="hint-text">No results found</p>';
      return;
    }
 
    container.innerHTML = results.map(s => `
      <div class="search-result-item">
        <div class="search-result-name">📚 ${this.escapeHtml(s.name)}</div>
        <div class="search-result-desc">${this.escapeHtml(s.desc)}</div>
      </div>
    `).join('');
  }
 
  renderSubjects() {
    const container = document.getElementById('subjectsList');
    if (this.subjects.length === 0) {
      container.innerHTML = '<p class="hint-text">ex: for added subject can view stay!</p>';
      return;
    }
 
    container.innerHTML = this.subjects.map(s => `
      <div class="subject-item">
        <div class="subject-item-name">📚 ${this.escapeHtml(s.name)}</div>
        <div class="subject-item-desc">${this.escapeHtml(s.desc)}</div>
        <div class="subject-item-date">${s.date}</div>
        <button class="subject-delete-btn" onclick="homeApp.deleteSubject(${s.id})">Delete</button>
      </div>
    `).join('');
  }
 
  deleteSubject(id) {
    const subject = this.subjects.find(s => s.id === id);
    if (subject && confirm(`Are you sure you want to delete "${subject.name}"? This action cannot be undone.`)) {
      this.subjects = this.subjects.filter(s => s.id !== id);
      this.saveData();
      this.renderSubjects();
      this.notify('Subject deleted!');
    }
  }
 
  renderDayOrders() {
    const container = document.getElementById('dayorderList');
    const dayOrders = this.dayOrders.filter(d => d.day === this.currentDay);
 
    if (dayOrders.length === 0) {
      container.innerHTML = '<p class="hint-text">No entries for this day.</p>';
      return;
    }
 
    container.innerHTML = dayOrders.map(d => `
      <div class="dayorder-item">
        <div class="dayorder-subject">${this.escapeHtml(d.subject)}</div>
        <div class="dayorder-time">${d.start} → ${d.end}</div>
        <button class="dayorder-delete-btn" onclick="homeApp.deleteDayOrder(${d.id})">Delete</button>
      </div>
    `).join('');
  }
 
  deleteDayOrder(id) {
    const dayOrder = this.dayOrders.find(d => d.id === id);
    if (dayOrder && confirm(`Are you sure you want to delete this day order (${dayOrder.subject})? This action cannot be undone.`)) {
      this.dayOrders = this.dayOrders.filter(d => d.id !== id);
      this.saveData();
      this.renderDayOrders();
      this.notify('Day order deleted!');
    }
  }
 
  renderPendingFiles() {
    const container = document.getElementById('pendingFilesList');
    if (this.pendingFiles.length === 0) {
      container.innerHTML = '';
      return;
    }
 
    container.innerHTML = this.pendingFiles.map((f, idx) => `
      <div class="pending-file-item">
        <span>📄 ${this.escapeHtml(f)}</span>
        <span class="pending-file-remove" onclick="homeApp.removePendingFile(${idx})">✕</span>
      </div>
    `).join('');
  }
 
  removePendingFile(idx) {
    this.pendingFiles.splice(idx, 1);
    this.renderPendingFiles();
  }
 
  startClock() {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      document.getElementById('clockTime').textContent = `${h}:${m}`;
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
 
let homeApp = new HomeApp();
 