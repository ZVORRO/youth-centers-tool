const data = require('./src/data/questions.json');

const section3 = data.sections.find(s => s.id === 'section3');
const sub32 = section3.subsections[1];

console.log('=== Questions with 5 options in Subsection 3.2 ===\n');

sub32.questions.forEach((q, i) => {
  if (q.options && q.options.length === 5) {
    console.log(`Q${i+1}: ${q.text}`);
    console.log('Options:');
    q.options.forEach((opt, idx) => console.log(`  ${idx+1}. ${opt}`));
    console.log('---\n');
  }
});

console.log('\n=== Question 14 (index 13) in Subsection 3.2 ===\n');
const q14 = sub32.questions[13];
if (q14) {
  console.log('Text:', q14.text);
  console.log('Explanation:', q14.explanation);
}

console.log('\n=== Looking for question 90 ===\n');
let globalIndex = 0;
data.sections.forEach((section, si) => {
  section.subsections.forEach((subsection, ssi) => {
    subsection.questions.forEach((q, qi) => {
      globalIndex++;
      if (globalIndex === 90) {
        console.log(`Found Q90 at Section ${si+1}, Subsection ${ssi+1}, Question ${qi+1}`);
        console.log('Text:', q.text);
        console.log('Options:', q.options);
      }
    });
  });
});
