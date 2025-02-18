const notesManager = require('./modules/notesManager');
const chapterManager = require('./modules/chapterManager');
const config = require('./modules/config');

let isDarkMode = localStorage.getItem('darkMode') === 'true';

function initializeApp() {
    try {
        chapterManager.loadData();
        notesManager.loadNotes();
        notesManager.initializeQuill();
        setupEventListeners();
        
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }

        // Show notes section by default
        const notesSection = document.getElementById('notesSection');
        if (notesSection) {
            notesSection.classList.add('visible');
        }

        // Display initial data
        const viewModeSelect = document.getElementById('viewMode');
        if (viewModeSelect) {
            chapterManager.displayData(viewModeSelect.value);
        } else {
            chapterManager.displayData('chapters');
        }
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Error initializing app: ' + error.message);
    }
}

function setupEventListeners() {
    const viewModeSelect = document.getElementById('viewMode');
    if (viewModeSelect) {
        viewModeSelect.addEventListener('change', (e) => {
            chapterManager.displayData(e.target.value);
        });
    }

    const toggleDarkBtn = document.getElementById('toggleDark');
    if (toggleDarkBtn) {
        toggleDarkBtn.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            document.body.classList.toggle('dark-mode', isDarkMode);
            localStorage.setItem('darkMode', isDarkMode);
        });
    }

    const tagInput = document.getElementById('tagInput');
    if (tagInput) {
        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const tag = e.target.value.trim();
                if (tag) {
                    notesManager.addTag(tag);
                    e.target.value = '';
                }
            }
        });
    }

    const noteSearch = document.getElementById('noteSearch');
    if (noteSearch) {
        noteSearch.addEventListener('input', () => {
            if (chapterManager.selectedChapter) {
                notesManager.displayNotes(chapterManager.selectedChapter.number);
            }
        });
    }

    const sortNotesSelect = document.getElementById('sortNotes');
    if (sortNotesSelect) {
        sortNotesSelect.addEventListener('change', () => {
            if (chapterManager.selectedChapter) {
                notesManager.displayNotes(chapterManager.selectedChapter.number);
            }
        });
    }

    const addNoteBtn = document.getElementById('addNote');
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', () => {
            if (chapterManager.selectedChapter) {
                const noteContent = notesManager.quill.root.innerHTML;
                if (noteContent.trim() !== '<p><br></p>' && noteContent.trim() !== '') {
                    notesManager.addOrUpdateNote(chapterManager.selectedChapter.number, noteContent, notesManager.currentTags);
                } else {
                    alert('Please enter some content for your note');
                }
            } else {
                alert('Please select a chapter first');
            }
        });
    }

    const saveChangesBtn = document.getElementById('saveChanges');
    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', () => chapterManager.saveData());
    }

    const attendLectureBtn = document.getElementById('attendLecture');
    if (attendLectureBtn) {
        attendLectureBtn.addEventListener('click', () => {
            if (chapterManager.attendLecture()) {
                chapterManager.displayData(viewModeSelect.value);
            } else {
                alert('Please select a chapter first');
            }
        });
    }

    const missLectureBtn = document.getElementById('missLecture');
    if (missLectureBtn) {
        missLectureBtn.addEventListener('click', () => {
            if (chapterManager.missLecture()) {
                chapterManager.displayData(viewModeSelect.value);
            } else {
                alert('Please select a chapter first');
            }
        });
    }

    // Add click event listeners to all chapter rows
    document.addEventListener('click', (e) => {
        if (e.target.closest('.chapter-row')) {
            const row = e.target.closest('.chapter-row');
            document.querySelectorAll('.chapter-row').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
            
            const chapterNumber = parseInt(row.dataset.number);
            const selectedChapter = chapterManager.selectChapter(chapterNumber);

            const notesSection = document.getElementById('notesSection');
            if (notesSection && selectedChapter) {
                notesSection.classList.add('visible');
                const chapterTitle = document.getElementById('chapterTitle');
                if (chapterTitle) {
                    chapterTitle.textContent = `Chapter ${selectedChapter.number}: ${selectedChapter.name}`;
                }
                notesManager.displayNotes(selectedChapter.number);
            }
        }
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Make functions available globally
window.deleteNote = (chapterId, noteId) => notesManager.deleteNote(chapterId, noteId);
window.editNote = (chapterId, noteId) => notesManager.editNote(chapterId, noteId);
window.updateNote = (chapterId, noteId) => notesManager.updateNote(chapterId, noteId);
window.removeTag = (tag) => notesManager.removeTag(tag);