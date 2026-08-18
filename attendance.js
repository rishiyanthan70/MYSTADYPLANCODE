class AttendanceLogApp {
  constructor() {
    this.user = localStorage.getItem('currentUser') || 'guest';
    this.key = `studyAttendance_${this.user}`;
    this.attendanceVersion = 3;
    this.defaults = {
      // Each supplied value is Present / Total. AB = Total - Present.
      'Data Structures and Algorithms': { present: 20, absent: 0 },
      'Operating Systems': { present: 21, absent: 1 },
      'Advanced Programming Practice': { present: 13, absent: 3 },
      'Computer Organization and Architecture': { present: 13, absent: 3 },
      'Professional Ethics': { present: 3, absent: 1 },
      'Transforms and Boundary Value Problems': { present: 14, absent: 4 }
    };
    this.load();
    this.render();
    document.getElementById('resetAttendanceBtn').addEventListener('click', () => {
      if (confirm('Reset attendance to the given starting values?')) {
        this.data = JSON.parse(JSON.stringify(this.defaults));
        this.marks = {};
        this.save();
        this.render();
      }
    });
  }

  load() {
    try {
      const stored = JSON.parse(localStorage.getItem(this.key) || 'null');
      if (stored?.version === this.attendanceVersion) {
        this.data = stored.attendance || JSON.parse(JSON.stringify(this.defaults));
        this.marks = stored.marks || {};
      } else {
        this.data = JSON.parse(JSON.stringify(this.defaults));
        this.marks = {};
      }
      Object.entries(this.defaults).forEach(([subject, counts]) => {
        if (!this.data[subject]) this.data[subject] = { ...counts };
      });
    } catch {
      this.data = JSON.parse(JSON.stringify(this.defaults));
      this.marks = {};
    }
    this.save();
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify({ version: this.attendanceVersion, attendance: this.data, marks: this.marks }));
  }

  render() {
    document.getElementById('attendanceUser').textContent = `User ID: ${this.user}`;
    const body = document.getElementById('attendanceTableBody');
    let totalPresent = 0, totalAbsent = 0;

    body.innerHTML = Object.entries(this.data).map(([subject, counts]) => {
      const present = Number(counts.present) || 0;
      const absent = Number(counts.absent) || 0;
      const total = present + absent;
      const pct = total ? (present / total) * 100 : 0;
      totalPresent += present;
      totalAbsent += absent;
      const cls = pct >= 75 ? 'percentage-good' : 'percentage-low';
      return `<tr class="${cls}">
        <td>${this.escapeHtml(subject)}</td>
        <td>${present}</td>
        <td>${absent}</td>
        <td>${total}</td>
        <td class="${cls}">${pct.toFixed(2)}%</td>
      </tr>`;
    }).join('');

    const total = totalPresent + totalAbsent;
    const overall = total ? (totalPresent / total) * 100 : 0;
    document.getElementById('summaryPresent').textContent = totalPresent;
    document.getElementById('summaryAbsent').textContent = totalAbsent;
    document.getElementById('summaryTotal').textContent = total;
    const summaryPct = document.getElementById('summaryPercentage');
    summaryPct.textContent = `${overall.toFixed(2)}%`;
    summaryPct.className = overall >= 75 ? 'percentage-good' : 'percentage-low';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

new AttendanceLogApp();
