const fs = require('fs');
const { formatDate } = require('./utils');
const config = require('./config');

class NotesManager {
    constructor() {
        this.notes = {};
        this.currentTags = [];
        this.quill = null;
        this.currentUser = 'AbderrahmenElloumi';
        this.currentDateTime = '2025-02-15 19:24:21';
    }

    initializeQuill() {
        this.quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['clean']
                ]
            },
            placeholder: 'Write your note here...'
        });
    }

    loadNotes() {
        try {
            if (fs.existsSync('notes.json')) {
                const notesData = fs.readFileSync('notes.json', 'utf8');
                this.notes = JSON.parse(notesData);
            }
        } catch (error) {
            console.error('Error loading notes:', error);
            this.notes = {};
        }
    }

    saveNotes() {
        try {
            fs.writeFileSync('notes.json', JSON.stringify(this.notes, null, 2));
        } catch (error) {
            console.error('Error saving notes:', error);
            alert('Error saving notes: ' + error.message);
        }
    }

    createNote(content, tags = []) {
        return {
            id: Date.now(),
            content: content,
            tags: tags,
            timestamp: this.currentDateTime,
            lastEdited: this.currentDateTime,
            author: this.currentUser,
            isEditing: false
        };
    }

    addOrUpdateNote(chapterId, noteContent, tags = []) {
        if (!this.notes[chapterId]) {
            this.notes[chapterId] = [];
        }

        const note = this.createNote(noteContent, tags);
        this.notes[chapterId].push(note);
        this.saveNotes();
        this.displayNotes(chapterId);
        this.quill.setContents([{ insert: '\n' }]);
        this.currentTags = [];
        this.updateTagsDisplay();
    }

    editNote(chapterId, noteId) {
        const note = this.notes[chapterId].find(n => n.id === noteId);
        if (note) {
            this.quill.root.innerHTML = note.content;
            this.currentTags = [...note.tags];
            this.updateTagsDisplay();
            note.isEditing = true;
            this.displayNotes(chapterId);
        }
    }

    updateNote(chapterId, noteId) {
        const noteIndex = this.notes[chapterId].findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
            this.notes[chapterId][noteIndex].content = this.quill.root.innerHTML;
            this.notes[chapterId][noteIndex].tags = this.currentTags;
            this.notes[chapterId][noteIndex].lastEdited = this.currentDateTime;
            this.notes[chapterId][noteIndex].isEditing = false;
            this.saveNotes();
            this.displayNotes(chapterId);
            this.quill.setContents([{ insert: '\n' }]);
            this.currentTags = [];
            this.updateTagsDisplay();
        }
    }

    deleteNote(chapterId, noteId) {
        if (this.notes[chapterId]) {
            this.notes[chapterId] = this.notes[chapterId].filter(note => note.id !== noteId);
            this.saveNotes();
            this.displayNotes(chapterId);
        }
    }

    addTag(tag) {
        if (!this.currentTags.includes(tag)) {
            this.currentTags.push(tag);
            this.updateTagsDisplay();
        }
    }

    removeTag(tag) {
        this.currentTags = this.currentTags.filter(t => t !== tag);
        this.updateTagsDisplay();
    }

    updateTagsDisplay() {
        const tagsList = document.getElementById('tagsList');
        if (tagsList) {
            tagsList.innerHTML = this.currentTags.map(tag => `
                <span class="note-tag">
                    ${tag}
                    <span onclick="removeTag('${tag}')" style="cursor:pointer;margin-left:5px;">×</span>
                </span>
            `).join('');
        }
    }

    displayNotes(chapterId) {
        const notesList = document.getElementById('notesList');
        const searchText = document.getElementById('noteSearch')?.value || '';
        const sortBy = document.getElementById('sortNotes')?.value || 'newest';
        
        if (!notesList) return;
        
        let filteredNotes = this.filterNotes(chapterId, searchText);
        filteredNotes = this.sortNotes(filteredNotes, sortBy);
        
        notesList.innerHTML = '';
        
        if (filteredNotes.length === 0) {
            notesList.innerHTML = '<div class="no-notes">No notes found</div>';
            return;
        }
        
        filteredNotes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            
            if (note.isEditing) {
                noteCard.innerHTML = `
                    <div class="note-header">
                        <div class="note-metadata">
                            <div>Created: ${note.timestamp}</div>
                            <div>Last Edited: ${note.lastEdited}</div>
                            <div>Author: ${note.author}</div>
                        </div>
                        <div class="note-actions">
                            <button onclick="updateNote('${chapterId}', ${note.id})">Save</button>
                            <button onclick="displayNotes('${chapterId}')">Cancel</button>
                        </div>
                    </div>
                    <div class="note-content editing">
                        ${note.content}
                    </div>
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}
                    </div>
                `;
            } else {
                noteCard.innerHTML = `
                    <div class="note-header">
                        <div class="note-metadata">
                            <div>Created: ${note.timestamp}</div>
                            <div>Last Edited: ${note.lastEdited}</div>
                            <div>Author: ${note.author}</div>
                        </div>
                        <div class="note-actions">
                            <button onclick="editNote('${chapterId}', ${note.id})">Edit</button>
                            <button onclick="deleteNote('${chapterId}', ${note.id})">Delete</button>
                        </div>
                    </div>
                    <div class="note-content">
                        ${note.content}
                    </div>
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}
                    </div>
                `;
            }
            
            notesList.appendChild(noteCard);
        });
    }

    filterNotes(chapterId, searchText) {
        if (!this.notes[chapterId]) return [];
        
        return this.notes[chapterId].filter(note => {
            const contentMatch = note.content.toLowerCase().includes(searchText.toLowerCase());
            const tagMatch = note.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()));
            return contentMatch || tagMatch;
        });
    }

    sortNotes(notes, sortBy) {
        return [...notes].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.timestamp) - new Date(a.timestamp);
                case 'oldest':
                    return new Date(a.timestamp) - new Date(b.timestamp);
                case 'edited':
                    return new Date(b.lastEdited) - new Date(a.lastEdited);
                default:
                    return 0;
            }
        });
    }
}

module.exports = new NotesManager();