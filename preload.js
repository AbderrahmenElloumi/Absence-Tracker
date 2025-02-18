const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('fileSystem', {
  readChaptersFile: () => {
    try {
      const filePath = path.join(__dirname, 'chapters.txt');
      const data = fs.readFileSync(filePath, 'utf8');
      return data;
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  }
});