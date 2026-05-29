// ================================================
// MOBILE HOME PAGE FUNCTIONALITY
// ================================================
 
let selectedDay = 1;
 
function selectDay(day) {
  selectedDay = day;
  
  // Update active button
  document.querySelectorAll('.day-col').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.day-col')[day - 1].classList.add('active');
 
  // Show day order for selected day
  renderDayOrderContent();
}
 
function renderDayOrderContent() {
  if (!homeApp) return;
 
  const dayOrders = homeApp.dayOrders.filter(d => d.day === String(selectedDay));
  const container = document.getElementById('dayOrderContent');
 
  if (dayOrders.length === 0) {
    container.innerHTML = '<p class="hint-text">No subjects scheduled for Day ' + selectedDay + '</p>';
    return;
  }
 
  container.innerHTML = dayOrders.map(d => `
    <div class="day-order-item">
      <div class="day-subject">📚 ${homeApp.escapeHtml(d.subject)}</div>
      <div class="day-time">⏰ ${d.start} → ${d.end}</div>
    </div>
  `).join('');
}
 
// Menu functionality
function setupMenuListeners() {
  const menuModal = document.getElementById('menuModal');
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const closeMenuModal = document.getElementById('closeMenuModal');
  const menuOverlay = document.getElementById('menuOverlay');
 
  menuToggleBtn.addEventListener('click', () => {
    menuModal.classList.add('active');
    updateMenuSubjectSelect();
  });
 
  closeMenuBtn.addEventListener('click', () => {
    menuModal.classList.remove('active');
  });
 
  closeMenuModal.addEventListener('click', () => {
    menuModal.classList.remove('active');
  });
 
  menuOverlay.addEventListener('click', () => {
    menuModal.classList.remove('active');
  });
 
  // Create from menu
  document.getElementById('menuCreateBtn').addEventListener('click', () => {
    const day = document.getElementById('menuDaySelect').value;
    const subject = document.getElementById('menuSubjectSelect').value;
    const start = document.getElementById('menuStartTime').value;
    const end = document.getElementById('menuEndTime').value;
 
    if (!subject || !start || !end) {
      if (homeApp) homeApp.notify('Fill all fields!');
      return;
    }
 
    if (!homeApp) return;
 
    homeApp.dayOrders.push({
      id: Date.now(),
      day,
      subject,
      start,
      end
    });
 
    homeApp.saveData();
    selectedDay = parseInt(day);
    selectDay(selectedDay);
    menuModal.classList.remove('active');
    if (homeApp) homeApp.notify('✅ Day order created!');
  });
 
  // View subject
  document.getElementById('viewSubjectBtn').addEventListener('click', () => {
    if (!homeApp || homeApp.subjects.length === 0) {
      if (homeApp) homeApp.notify('No subjects yet!');
      return;
    }
    menuModal.classList.remove('active');
    alert('Open Subjects page from home to view details');
  });
}
 
function updateMenuSubjectSelect() {
  const select = document.getElementById('menuSubjectSelect');
  select.innerHTML = '<option value="">-- Select Subject --</option>';
  
  if (homeApp && homeApp.subjects) {
    homeApp.subjects.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.name;
      opt.textContent = s.name;
      select.appendChild(opt);
    });
  }
}
 
// Initialize mobile functionality
document.addEventListener('DOMContentLoaded', () => {
  selectDay(1);
  setupMenuListeners();
});
 
// Update when homeApp loads
setTimeout(() => {
  if (homeApp) {
    renderDayOrderContent();
    setupMenuListeners();
  }
}, 100);
 