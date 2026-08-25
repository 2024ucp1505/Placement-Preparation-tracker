'use strict';

const fs = require('fs');
const path = require('path');

const seedQuestions = [];

/**
 * Clean up markdown headers to be clean question titles.
 */
function cleanTitle(header) {
  return header
    .replace(/^##\s+/, '') 
    .replace(/[🔗🗄️⚠️🔭📊🗣️🏗️🔧🔐🏢👥📜📚🎯]/g, '') 
    .replace(/`\[.*?\]`/g, '') 
    .replace(/^(\d+\.)*\d*\s*(?:—|-)?\s*/, '') 
    .trim();
}

/**
 * Filter out generic headings that aren't actual topics
 */
function isTopic(title) {
  const lower = title.toLowerCase();
  if (lower.includes('table of contents')) return false;
  if (lower.includes('quick revision')) return false;
  if (lower.includes('exam questions')) return false;
  if (lower.includes('what will you learn')) return false;
  if (lower.includes('study material')) return false;
  if (lower.includes('cheat sheet')) return false;
  if (lower.includes('build project')) return false;
  if (lower.includes('quiz —')) return false;
  return true;
}

function processMarkdownFile(filePath, category, topicBase) {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  // Split by ## heading. Each chunk starts with the heading text.
  // We use a regex that matches ## followed by spaces at the start of a line.
  const chunks = content.split(/^##\s+/m);
  
  // The filename without extension will be our Chapter name
  const chapterName = path.basename(filePath, '.md').replace(/^\d+[\._\s]*/, '').replace(/_/g, ' ').trim();

  // chunks[0] is everything before the first ##, skip it usually
  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];
    // The first line of the chunk is the topic title
    const firstNewline = chunk.indexOf('\n');
    let titleLine = chunk;
    let contentBody = '';
    
    if (firstNewline !== -1) {
      titleLine = chunk.substring(0, firstNewline);
      contentBody = chunk.substring(firstNewline + 1).trim();
    }
    
    let title = cleanTitle(titleLine);
    
    if (isTopic(title)) {
      seedQuestions.push({
        company: 'N/A', // Unused for Core/Dev in UI now, but required by schema
        topic: topicBase, // Subject (e.g. DBMS, JavaScript)
        chapter: chapterName,
        title: title,
        content: contentBody,
        difficulty: 'Medium',
        status: 'Unsolved',
        category: category,
        link: `file://resources/${path.relative(path.join(__dirname, '..', '..', 'resources'), filePath).replace(/\\/g, '/')}`
      });
    }
  }
}

// DBMS
const dbmsDir = path.join(__dirname, '..', '..', 'resources', 'DBMS For Interviews');
if (fs.existsSync(dbmsDir)) {
  const files = fs.readdirSync(dbmsDir).filter(f => f.endsWith('.md'));
  files.forEach(f => {
    processMarkdownFile(path.join(dbmsDir, f), 'Core', 'DBMS');
  });
}

// OOPS
const oopsDir = path.join(__dirname, '..', '..', 'resources', 'OOPS For Intervies');
if (fs.existsSync(oopsDir)) {
  const files = fs.readdirSync(oopsDir).filter(f => f.endsWith('.md'));
  files.forEach(f => {
    processMarkdownFile(path.join(oopsDir, f), 'Core', 'OOPS');
  });
}

// Development
processMarkdownFile(
  path.join(__dirname, '..', '..', 'resources', 'Day1_JavaScript_Complete_Guide.md'), 
  'Development', 'JavaScript'
);
processMarkdownFile(
  path.join(__dirname, '..', '..', 'resources', 'Day2_NodeJS_Express_Guide.md'), 
  'Development', 'NodeJS'
);
processMarkdownFile(
  path.join(__dirname, '..', '..', 'resources', 'Day3_React_Guide.md'), 
  'Development', 'React'
);
processMarkdownFile(
  path.join(__dirname, '..', '..', 'resources', 'Day4_MongoDB_MySQL_Guide.md'), 
  'Development', 'MongoDB'
);

module.exports = seedQuestions;
