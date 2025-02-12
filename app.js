class NotesApp {
    constructor() {
        this.folders = JSON.parse(localStorage.getItem('folders')) || [];
        this.selectedFolderId = null;

        this.newFolderBtn = document.getElementById('newFolderBtn');
        this.foldersList = document.getElementById('foldersList');
        this.newNoteBtn = document.getElementById('newNoteBtn');
        this.notesGrid = document.getElementById('notesGrid');
        this.currentFolderTitle = document.getElementById('currentFolder');
        this.sidebar = document.getElementById('sidebar');
        this.menuToggle = document.getElementById('menuToggle');
        this.mainContent = document.getElementById('mainContent');

        this.addEventListeners();
        this.initialize();
    }

    addEventListeners() {
        this.newFolderBtn.addEventListener('click', () => this.createFolder());
        this.newNoteBtn.addEventListener('click', () => this.createNote());
        this.foldersList.addEventListener('click', (e) => this.handleFolderClick(e));
        this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        window.addEventListener('resize', () => this.handleWindowResize());
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('visible');
    }

    handleWindowResize() {
        if (window.innerWidth > 768) {
            this.sidebar.classList.remove('visible');
        }
    }

    initialize() {
        if (this.folders.length === 0) {
            const defaultFolder = { id: Date.now(), name: 'My Notes', notes: [] };
            this.folders.push(defaultFolder);
            this.selectedFolderId = defaultFolder.id;
            this.saveAndRender();
        } else {
            this.selectedFolderId = this.folders[0].id;
            this.render();
        }
    }

    saveAndRender() {
        this.saveToLocalStorage();
        this.render();
    }

    saveToLocalStorage() {
        localStorage.setItem('folders', JSON.stringify(this.folders));
    }

    createFolder() {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            const newFolder = { id: Date.now(), name: folderName, notes: [] };
            this.folders.push(newFolder);
            this.selectedFolderId = newFolder.id;
            this.saveAndRender();
        }
    }

    createNote() {
        const newNote = { id: Date.now(), title: 'New Note', content: 'Start writing...' };
        const currentFolder = this.getCurrentFolder();
        currentFolder.notes.unshift(newNote);
        this.saveAndRender();
    }

    handleFolderClick(e) {
        const folderEl = e.target.closest('.folder');
        const deleteBtn = e.target.closest('.delete-folder-btn');

        if (deleteBtn) {
            const folderId = Number(deleteBtn.dataset.folderId);
            this.deleteFolder(folderId);
        } else if (folderEl) {
            this.selectedFolderId = Number(folderEl.dataset.folderId);
            this.saveAndRender();
            if (window.innerWidth <= 768) {
                this.sidebar.classList.remove('visible');
            }
        }
    }

    deleteFolder(folderId) {
        if (this.folders.length === 1) {
            alert('You must have at least one folder.');
            return;
        }
        this.folders = this.folders.filter(f => f.id !== folderId);
        if (this.selectedFolderId === folderId) {
            this.selectedFolderId = this.folders[0].id;
        }
        this.saveAndRender();
    }

    getCurrentFolder() {
        return this.folders.find(f => f.id === this.selectedFolderId);
    }

    render() {
        this.renderFolders();
        this.renderNotes();
    }

    renderFolders() {
        this.foldersList.innerHTML = '';
        this.folders.forEach(folder => {
            const folderEl = document.createElement('div');
            folderEl.className = `folder ${folder.id === this.selectedFolderId ? 'active' : ''}`;
            folderEl.dataset.folderId = folder.id;
            folderEl.innerHTML = `
                <span>${folder.name}</span>
                ${this.folders.length > 1 ? `<button class="delete-folder-btn" data-folder-id="${folder.id}">×</button>` : ''}
            `;
            this.foldersList.appendChild(folderEl);
        });
        this.currentFolderTitle.textContent = this.getCurrentFolder().name;
    }

    renderNotes() {
        this.notesGrid.innerHTML = '';
        const currentFolder = this.getCurrentFolder();
        currentFolder.notes.forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.className = 'note';
            noteEl.innerHTML = `
                <div class="note-title" contenteditable="true">${note.title}</div>
                <div class="note-content" contenteditable="true">${note.content}</div>
                <button class="delete-note-btn" data-note-id="${note.id}">×</button>
            `;

            const titleEl = noteEl.querySelector('.note-title');
            const contentEl = noteEl.querySelector('.note-content');
            const deleteNoteBtn = noteEl.querySelector('.delete-note-btn');

            titleEl.addEventListener('input', () => {
                note.title = titleEl.textContent.trim() || 'Untitled';
                this.saveToLocalStorage();
            });

            contentEl.addEventListener('input', () => {
                note.content = contentEl.textContent;
                this.saveToLocalStorage();
            });

            deleteNoteBtn.addEventListener('click', () => {
                this.deleteNote(note.id);
            });

            this.notesGrid.appendChild(noteEl);
        });
    }

    deleteNote(noteId) {
        const currentFolder = this.getCurrentFolder();
        currentFolder.notes = currentFolder.notes.filter(n => n.id !== noteId);
        this.saveAndRender();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NotesApp();
});
