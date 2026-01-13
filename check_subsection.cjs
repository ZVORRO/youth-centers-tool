const data = require('./src/data/questions.json');

const section3 = data.sections.find(s => s.id === 'section3');
const sub32 = section3.subsections[1];

console.log('Subsection 3.2 title:', sub32.title);
console.log('Total questions:', sub32.questions.length);
console.log('\nQuestions:');

sub32.questions.forEach((q, i) => {
  console.log(`Q${i+1}: ${q.text}`);
});
