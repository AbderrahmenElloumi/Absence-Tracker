const fs = require('fs');

class ChapterManager {
    constructor() {
        this.chapters = [];
        this.modules = [];
        this.selectedChapter = null;
    }

    loadData() {
        try {
            if (fs.existsSync('chapters.txt')) {
                const data = fs.readFileSync('chapters.txt', 'utf8');
                const lines = data.split('\n').filter(line => line.trim());

                this.chapters = [];
                this.modules = [];
                let currentModule = null;

                lines.forEach(line => {
                    if (line.startsWith('Module:')) {
                        currentModule = {
                            name: line.replace('Module:', '').trim(),
                            chapters: []
                        };
                        this.modules.push(currentModule);
                    } else {
                        const parts = line.split(',');
                        if (parts.length === 4) {
                            const chapter = {
                                number: parseInt(parts[0]),
                                name: parts[1].trim(),
                                attended: parseInt(parts[2]),
                                missed: parseInt(parts[3])
                            };
                            this.chapters.push(chapter);
                        } else if (parts.length === 1 && currentModule) {
                            const chapterNum = parseInt(parts[0]);
                            const chapter = this.chapters.find(ch => ch.number === chapterNum);
                            if (chapter) {
                                currentModule.chapters.push(chapter);
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Error loading data: ' + error.message);
        }
    }

    saveData() {
        try {
            let content = this.chapters.map(chapter => 
                `${chapter.number},${chapter.name},${chapter.attended},${chapter.missed}`
            ).join('\n');
    
            content += '\n' + this.modules.map(module => 
                `Module:${module.name}\n${module.chapters.map(ch => ch.number).join('\n')}`
            ).join('\n');
    
            fs.writeFileSync('chapters.txt', content);
            alert('Changes saved successfully!');
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error saving data: ' + error.message);
        }
    }

    calculateAbsenceRate(attended, missed) {
        const total = attended + missed;
        return total > 0 ? ((missed / total) * 100).toFixed(2) : '0.00';
    }

    displayData(mode) {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;
    
        tableBody.innerHTML = '';
    
        if (mode === 'chapters') {
            this.chapters.forEach(chapter => {
                const tr = document.createElement('tr');
                tr.className = 'chapter-row';
                tr.dataset.number = chapter.number;
                tr.innerHTML = `
                    <td>${chapter.number}</td>
                    <td>${chapter.name}</td>
                    <td>${chapter.attended}</td>
                    <td>${chapter.missed}</td>
                    <td>${this.calculateAbsenceRate(chapter.attended, chapter.missed)}%</td>
                `;
                if (this.selectedChapter && this.selectedChapter.number === chapter.number) {
                    tr.classList.add('selected');
                }
                tableBody.appendChild(tr);
            });
        } else {
            this.modules.forEach(module => {
                const moduleRow = document.createElement('tr');
                moduleRow.className = 'module-row';
                moduleRow.innerHTML = `
                    <td colspan="5">${module.name}</td>
                `;
                tableBody.appendChild(moduleRow);
    
                module.chapters.forEach(chapter => {
                    const chapterRow = document.createElement('tr');
                    chapterRow.className = 'chapter-row';
                    chapterRow.dataset.number = chapter.number;
                    chapterRow.innerHTML = `
                        <td>${chapter.number}</td>
                        <td>${chapter.name}</td>
                        <td>${chapter.attended}</td>
                        <td>${chapter.missed}</td>
                        <td>${this.calculateAbsenceRate(chapter.attended, chapter.missed)}%</td>
                    `;
                    if (this.selectedChapter && this.selectedChapter.number === chapter.number) {
                        chapterRow.classList.add('selected');
                    }
                    tableBody.appendChild(chapterRow);
                });
            });
        }
    }

    selectChapter(chapterNumber) {
        this.selectedChapter = this.chapters.find(ch => ch.number === chapterNumber);
        return this.selectedChapter;
    }

    attendLecture() {
        if (this.selectedChapter) {
            this.selectedChapter.attended++;
            return true;
        }
        return false;
    }

    missLecture() {
        if (this.selectedChapter) {
            this.selectedChapter.missed++;
            return true;
        }
        return false;
    }
}

module.exports = new ChapterManager();