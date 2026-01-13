const data = require('./src/data/questions.json');

console.log('Searching for sorting/waste questions...\n');

data.sections.forEach((section, si) => {
  section.subsections.forEach((subsection, ssi) => {
    subsection.questions.forEach((q, qi) => {
      if (q.text.toLowerCase().includes('сортув') ||
          q.text.toLowerCase().includes('маркован') ||
          q.text.toLowerCase().includes('сміт')) {
        console.log(`Section ${si+1}, Subsection ${ssi+1}, Q${qi+1}:`);
        console.log('Text:', q.text.substring(0, 80));
        console.log('Options:', q.options);
        console.log('---\n');
      }
    });
  });
});
