const formatText = 'ВИБІР ОДНОГО.\nмісцевий, міський, селищний, сільський';
const originalText = formatText;
const text = formatText.toLowerCase();

console.log('Original text:', formatText);
console.log('Lowercase:', text);
console.log('Includes "вибір одного":', text.includes('вибір одного'));
console.log('Includes "вибір одної":', text.includes('вибір одної'));

const options = originalText.split('\n').filter(opt =>
  opt.trim() &&
  !opt.toLowerCase().includes('вибір')
).map(o => {
  let cleaned = o.trim();
  cleaned = cleaned.replace(/^\d+\)\s*/, '');
  return cleaned;
}).filter(o => o.length > 0 && o.length < 200);

console.log('Extracted options:', options);
console.log('Options length:', options.length);

// Try splitting by comma
const optionsFromComma = originalText.split('\n')[1]?.split(',').map(o => o.trim()) || [];
console.log('Options from comma split:', optionsFromComma);
