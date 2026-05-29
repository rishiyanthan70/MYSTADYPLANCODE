// ================================================
// FOLDER PAGE FUNCTIONALITY (folder.html)
// ================================================
 
class FolderApp {
  constructor() {
    this.folders = [];
    this.currentFolder = null;
    this.init();
  }
 
  init() {
    this.loadData();
    this.attachListeners();
    this.renderFolders();
  }
 
  loadData() {
    const stored = localStorage.getItem('studyAppData');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.folders = data.folders || [];
      } catch (e) {
        console.error('Load error:', e);
      }
    }
  }
 
  saveData() {
    let data = { folders: this.folders, subjects: [], dayOrders: [], tasks: [] };
    const stored = localStorage.getItem('studyAppData');
    if (stored) {
      try {
        const existing = JSON.parse(stored);
        data.subjects = existing.subjects || [];
        data.dayOrders = existing.dayOrders || [];
        data.tasks = existing.tasks || [];
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
    // Create Folder
    document.getElementById('createNewFolderBtn').addEventListener('click', () => {
      document.getElementById('createFolderModal').classList.add('active');
    });
 
    const folderModal = document.getElementById('createFolderModal');
    document.getElementById('createFolderOverlay').addEventListener('click', () => {
      folderModal.classList.remove('active');
    });
    document.getElementById('closeFolderModal').addEventListener('click', () => {
      folderModal.classList.remove('active');
    });
    document.getElementById('cancelFolderModal').addEventListener('click', () => {
      folderModal.classList.remove('active');
    });
 
    document.getElementById('confirmFolderModal').addEventListener('click', () => {
      const name = document.getElementById('newFolderName').value.trim();
      if (!name) {
        this.notify('Enter folder name!');
        return;
      }
      this.folders.push({
        id: Date.now(),
        name: name,
        files: [],
        date: new Date().toLocaleDateString()
      });
      this.saveData();
      document.getElementById('newFolderName').value = '';
      folderModal.classList.remove('active');
      this.renderFolders();
      this.notify('📁 Folder created!');
    });
 
    // Search
    document.getElementById('searchFoldersBtn').addEventListener('click', () => {
      this.searchFolders();
    });
    document.getElementById('folderSearch').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.searchFolders();
    });
 
    // Add File Modal
    const fileModal = document.getElementById('addFileModal');
    document.getElementById('addFileOverlay').addEventListener('click', () => {
      fileModal.classList.remove('active');
    });
    document.getElementById('closeAddFileModal').addEventListener('click', () => {
      fileModal.classList.remove('active');
    });
    document.getElementById('cancelAddFileModal').addEventListener('click', () => {
      fileModal.classList.remove('active');
    });
 
    // File input from system
    document.getElementById('fileInputFromSystem').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        document.getElementById('fileNameInput').value = file.name;
      }
    });
 
    document.getElementById('confirmAddFileModal').addEventListener('click', () => {
      if (!this.currentFolder) {
        this.notify('No folder selected!');
        return;
      }
      const fileName = document.getElementById('fileNameInput').value.trim();
      if (!fileName) {
        this.notify('Enter file name!');
        return;
      }
      this.currentFolder.files.push(fileName);
      this.saveData();
      document.getElementById('fileNameInput').value = '';
      document.getElementById('fileInputFromSystem').value = '';
      fileModal.classList.remove('active');
      this.openFolder(this.currentFolder.id);
      this.notify('📄 File added!');
    });
  }
 
  renderFolders() {
    const container = document.getElementById('foldersList');
    if (this.folders.length === 0) {
      container.innerHTML = '<p class="hint-text">No folders</p>';
      return;
    }
 
    container.innerHTML = this.folders.map(f => `
      <div class="folder-item" ondblclick="folderApp.openFolder(${f.id})">
        <div class="folder-item-info">
          <div class="folder-item-name">📁 ${this.escapeHtml(f.name)}</div>
          <div class="folder-item-date">${f.date}</div>
        </div>
        <button class="folder-delete-btn" onclick="folderApp.deleteFolder(${f.id}); event.stopPropagation();">🗑️</button>
      </div>
    `).join('');
  }
 
  deleteFolder(id) {
    if (confirm('Delete this folder?')) {
      this.folders = this.folders.filter(f => f.id !== id);
      this.saveData();
      this.renderFolders();
      this.currentFolder = null;
      document.getElementById('folderTitle').textContent = '📁 Folder Contents';
      document.getElementById('folderContents').innerHTML = '<p class="hint-text">Double-click a folder to open</p>';
      this.notify('📁 Folder deleted!');
    }
  }
 
  openFolder(id) {
    this.currentFolder = this.folders.find(f => f.id === id);
    if (!this.currentFolder) return;
 
    document.getElementById('folderTitle').textContent = `📁 ${this.currentFolder.name}`;
    const container = document.getElementById('folderContents');
 
    if (this.currentFolder.files.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <p class="hint-text">Folder is empty</p>
          <button class="btn btn-yellow" onclick="document.getElementById('addFileModal').classList.add('active')" style="margin-top: 20px;">+ Add File</button>
        </div>
      `;
      return;
    }
 
    container.innerHTML = this.currentFolder.files.map((f, idx) => `
      <div class="file-item">
        <div class="file-info">
          <div class="file-icon">📄</div>
          <div class="file-name">${this.escapeHtml(f)}</div>
        </div>
        <div class="file-buttons">
          <button class="file-btn file-download-btn" onclick="folderApp.downloadFile('${this.escapeHtml(f)}')">⬇️ Download</button>
          <button class="file-btn file-delete-btn" onclick="folderApp.deleteFile(${idx}); event.stopPropagation();">🗑️ Delete</button>
        </div>
      </div>
    `).join('');
 
    // Add file button at end
    const addBtn = document.createElement('div');
    addBtn.innerHTML = `<button class="btn btn-yellow btn-full" onclick="document.getElementById('addFileModal').classList.add('active')" style="margin-top: 10px;">+ Add File</button>`;
    container.appendChild(addBtn.firstChild);
  }
 
  downloadFile(fileName) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(`File: ${fileName}\nFolder: ${this.currentFolder.name}\n\nDownloaded from Study Hub`));
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    this.notify(`📥 Downloaded: ${fileName}`);
  }
 
  deleteFile(idx) {
    if (confirm('Delete this file?')) {
      this.currentFolder.files.splice(idx, 1);
      this.saveData();
      this.openFolder(this.currentFolder.id);
      this.notify('📄 File deleted!');
    }
  }
 
  searchFolders() {
    const query = document.getElementById('folderSearch').value.trim().toLowerCase();
    const container = document.getElementById('foldersList');
 
    if (!query) {
      this.renderFolders();
      return;
    }
 
    const results = this.folders.filter(f =>
      f.name.toLowerCase().includes(query)
    );
 
    if (results.length === 0) {
      container.innerHTML = '<p class="hint-text">Not found</p>';
      return;
    }
 
    container.innerHTML = results.map(f => `
      <div class="folder-item" ondblclick="folderApp.openFolder(${f.id})">
        <div class="folder-item-info">
          <div class="folder-item-name">📁 ${this.escapeHtml(f.name)}</div>
          <div class="folder-item-date">${f.date}</div>
        </div>
        <button class="folder-delete-btn" onclick="folderApp.deleteFolder(${f.id}); event.stopPropagation();">🗑️</button>
      </div>
    `).join('');
  }
 
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
 
let folderApp = new FolderApp();
 