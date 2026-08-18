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
    this.attendance = {};
    this.attendanceMarks = {};
    this.attendanceVersion = 3;
    this.currentUser = localStorage.getItem('currentUser') || 'guest';
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
    } else {
      // First run on this browser: seed the Day-Order schedule from the timetable
      this.dayOrders = this.getDefaultTimetable();
      this.saveData();
    }

    const attendanceKey = `studyAttendance_${this.currentUser}`;
    const storedAttendance = localStorage.getItem(attendanceKey);
    if (storedAttendance) {
      try {
        const parsed = JSON.parse(storedAttendance);
        if (parsed.version === this.attendanceVersion) {
          this.attendance = parsed.attendance || {};
          this.attendanceMarks = parsed.marks || {};
        } else {
          // Attendance format was corrected: the supplied value is Present/Total.
          this.attendance = {};
          this.attendanceMarks = {};
        }
      } catch (e) {
        console.error('Attendance load error:', e);
      }
    }

    this.ensureAttendanceSubjects();
  }

  ensureAttendanceSubjects() {
    const defaults = this.getDefaultAttendance();
    Object.entries(defaults).forEach(([subject, counts]) => {
      if (!this.attendance[subject]) {
        this.attendance[subject] = { ...counts };
      } else {
        this.attendance[subject].present = Number(this.attendance[subject].present) || 0;
        this.attendance[subject].absent = Number(this.attendance[subject].absent) || 0;
      }
    });
    this.saveAttendance();
  }

  getDefaultAttendance() {
    return {
      // Attendance is stored as Present / Total.
      // AB is calculated automatically as Total - Present.
      'Data Structures and Algorithms': { present: 20, absent: 0 },
      'Operating Systems': { present: 21, absent: 1 },
      'Advanced Programming Practice': { present: 13, absent: 3 },
      'Computer Organization and Architecture': { present: 13, absent: 3 },
      'Professional Ethics': { present: 3, absent: 1 },
      'Transforms and Boundary Value Problems': { present: 14, absent: 4 }
    };
  }

  saveAttendance() {
    const attendanceKey = `studyAttendance_${this.currentUser}`;
    localStorage.setItem(attendanceKey, JSON.stringify({
      version: this.attendanceVersion,
      attendance: this.attendance,
      marks: this.attendanceMarks
    }));
  }

  getLocalDateKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  markAttendance(dayOrderId, subject, status) {
    const today = this.getLocalDateKey();
    const markKey = `${today}_${dayOrderId}`;
    const existing = this.attendanceMarks[markKey];

    if (existing) {
      this.notify(`Already marked ${existing === 'present' ? 'Present' : 'AB'} for this class today.`);
      return;
    }

    if (!this.attendance[subject]) {
      this.attendance[subject] = { present: 0, absent: 0 };
    }

    this.attendance[subject][status] += 1;
    this.attendanceMarks[markKey] = status;
    this.saveAttendance();
    this.renderDayOrders();
    this.notify(`${subject}: ${status === 'present' ? 'Present' : 'AB'} marked.`);
  }

  getAttendanceMark(dayOrderId) {
    const today = this.getLocalDateKey();
    return this.attendanceMarks[`${today}_${dayOrderId}`] || null;
  }

  // Default Day-Order schedule, pulled from the uploaded timetable image
  getDefaultTimetable() {
    const base = Date.now();
    return [
      { id: base + 1,  day: '1', subject: 'Professional Ethics',                     start: '10:40', end: '11:35' },
      { id: base + 2,  day: '1', subject: 'Transforms and Boundary Value Problems',   start: '12:30', end: '14:20' },
      { id: base + 3,  day: '1', subject: 'Operating Systems',                        start: '14:20', end: '16:50' },

      { id: base + 4,  day: '2', subject: 'Data Structures and Algorithms',           start: '08:00', end: '09:45' },
      { id: base + 5,  day: '2', subject: 'Transforms and Boundary Value Problems',   start: '11:35', end: '12:30' },

      { id: base + 6,  day: '3', subject: 'Operating Systems',                        start: '08:00', end: '09:45' },
      { id: base + 7,  day: '3', subject: 'Computer Organization and Architecture',   start: '12:30', end: '14:20' },
      { id: base + 8,  day: '3', subject: 'Transforms and Boundary Value Problems',   start: '14:20', end: '15:10' },
      { id: base + 9,  day: '3', subject: 'Advanced Programming Practice',            start: '15:10', end: '16:00' },
      { id: base + 10, day: '3', subject: 'Data Structures and Algorithms',           start: '16:00', end: '16:50' },

      { id: base + 11, day: '4', subject: 'Advanced Programming Practice',            start: '08:00', end: '09:45' },
      { id: base + 12, day: '4', subject: 'Data Structures and Algorithms',           start: '09:45', end: '10:40' },
      { id: base + 13, day: '4', subject: 'Computer Organization and Architecture',   start: '11:35', end: '12:30' },

      { id: base + 14, day: '5', subject: 'Computer Organization and Architecture',   start: '14:20', end: '15:10' },
      { id: base + 15, day: '5', subject: 'Operating Systems',                        start: '15:10', end: '16:00' },
      { id: base + 16, day: '5', subject: 'Advanced Programming Practice',            start: '16:00', end: '16:50' },
    ];
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
 
    container.innerHTML = dayOrders.map(d => {
      const mark = this.getAttendanceMark(d.id);
      const markText = mark === 'present' ? '✓ Present' : mark === 'absent' ? '✕ AB' : 'Not Marked';
      return `
        <div class="dayorder-item">
          <div class="dayorder-main">
            <div class="dayorder-subject">${this.escapeHtml(d.subject)}</div>
            <div class="dayorder-time">${d.start} → ${d.end}</div>
          </div>
          <div class="attendance-controls">
            <span class="attendance-status ${mark ? 'marked' : ''}">${markText}</span>
            <button class="attendance-btn present-btn" ${mark ? 'disabled' : ''} onclick="homeApp.markAttendance(${d.id}, '${this.escapeJs(d.subject)}', 'present')">Present</button>
            <button class="attendance-btn absent-btn" ${mark ? 'disabled' : ''} onclick="homeApp.markAttendance(${d.id}, '${this.escapeJs(d.subject)}', 'absent')">AB</button>
            <button class="dayorder-delete-btn" onclick="homeApp.deleteDayOrder(${d.id})">Delete</button>
          </div>
        </div>
      `;
    }).join('');
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
 
  escapeJs(text) {
    return String(text).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
 
let homeApp = new HomeApp();
 