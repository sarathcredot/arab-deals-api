const copyfiles = require('copyfiles');

// Copy files from 'uploads/' to 'dist/'
copyfiles(['uploads/*', 'dist/uploads'], { up: 1 }, () => {
  console.log('Files copied from "uploads/" to "dist/uploads".');
});

// Copy files from 'public/' to 'dist/'
copyfiles(['public/*', 'dist/public'], { up: 1 }, () => {
  console.log('Files copied from "public/" to "dist/public".');
});

// Copy files from 'src/files' to 'dist/'
copyfiles(['exports/*', 'dist/exports'], { up: 1 }, () => {
  console.log('Files copied from "exports/" to "dist/exports".');
});