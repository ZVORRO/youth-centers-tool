const data = require('./src/data/questions.json');

const section3 = data.sections.find(s => s.id === 'section3');
const sub39 = section3.subsections[7];

console.log('Subsection 3.9:', sub39.title);
console.log('\nSearching for sorting question...\n');

sub39.questions.forEach((q, i) => {
  if (q.text.includes('сортування') || q.text.includes('марковані')) {
    console.log(`Q${i+1}:`, q.text);
    console.log('Options:', q.options);
    console.log('---');
  }
});
