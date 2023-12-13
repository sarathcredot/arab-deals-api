const copyfiles = require('copyfiles');

// Copy files from 'uploads/' to 'dist/'
copyfiles(['uploads/*', 'dist/uploads'], { up: 1 }, () => {
  console.log('Files copied from "uploads/" to "dist/".');
});

// Copy files from 'public/' to 'dist/'
copyfiles(['public/*', 'dist/public'], { up: 1 }, () => {
  console.log('Files copied from "public/" to "dist/".');
});