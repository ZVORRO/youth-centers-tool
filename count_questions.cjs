const fs = require('fs');

const data = JSON.parse(fs.readFileSync('new_json/questions_export.json', 'utf8'));

let count = 0;
let sections = [];
let currentSection = null;

data.content.forEach(item => {
  // Detect section headers
  if (item.type === 'paragraph' && item.text && item.text.match(/Розділ \d/)) {
    currentSection = {
      title: item.text,
      subsections: []
    };
    sections.push(currentSection);
  }

  // Detect subsection headers
  if (item.type === 'paragraph' && item.text && item.text.match(/Підрозділ \d\.\d/)) {
    if (currentSection) {
      currentSection.subsections.push({
        title: item.text,
        questionCount: 0
      });
    }
  }

  // Count questions in tables
  if (item.type === 'table' && item.rows) {
    const validQuestions = item.rows.filter(row =>
      row['Питання'] && row['Питання'].trim() !== ''
    );
    count += validQuestions.length;

    if (currentSection && currentSection.subsections.length > 0) {
      const lastSubsection = currentSection.subsections[currentSection.subsections.length - 1];
      lastSubsection.questionCount += validQuestions.length;
    }
  }
});

console.log('=== STATISTICS ===');
console.log('Total questions:', count);
console.log('\nBreakdown by sections:');
sections.forEach(section => {
  const sectionTotal = section.subsections.reduce((sum, sub) => sum + sub.questionCount, 0);
  console.log(`\n${section.title}: ${sectionTotal} питань`);
  section.subsections.forEach(sub => {
    console.log(`  ${sub.title}: ${sub.questionCount} питань`);
  });
});
