const fs = require('fs');

// Read the export file
const exportData = JSON.parse(fs.readFileSync('new_json/questions_export.json', 'utf8'));

// User category mappings from image descriptions to category IDs
const categoryMapping = {
  'Людина на інвалідному кріслі': 'wheelchair',
  'Людина без ноги та на милицях': 'crutches',
  'Людина на милицях': 'crutches',
  'Протез ноги': 'legProsthesis',
  'протез руки': 'armProsthesis',
  'рука та іконка сенсорики, слабка рука': 'weakHand',
  'Людина з дитячим візочком': 'stroller',
  'мати з дитиною': 'parentWithChild',
  'порушення зору': 'visualImpairment',
  'порушення слуху': 'hearingImpairment',
  'складнощі з орієнтацію в просторі': 'orientationDifficulty',
  'акцент на зріст людини': 'heightVariation',
  'акцент на можливі різні мови людей': 'foreignLanguage',
  'ароматичні, кольорові, звукові, світлові тригери': 'sensoryTriggers',
  'легені': 'respiratory',
  'людина з собакою на поводку': 'guideDog',
  'Важкість пересування': 'mobilityGeneral'
};

// User categories definition
const userCategories = {
  "wheelchair": { "id": "wheelchair", "name": "Люди на інвалідному кріслі", "icon": "wheelchair" },
  "crutches": { "id": "crutches", "name": "Люди на милицях", "icon": "crutches" },
  "legProsthesis": { "id": "legProsthesis", "name": "Люди з протезом ноги", "icon": "legProsthesis" },
  "armProsthesis": { "id": "armProsthesis", "name": "Люди з протезом руки", "icon": "armProsthesis" },
  "weakHand": { "id": "weakHand", "name": "Люди зі слабкою моторикою рук", "icon": "weakHand" },
  "stroller": { "id": "stroller", "name": "Батьки з дитячим візочком", "icon": "stroller" },
  "parentWithChild": { "id": "parentWithChild", "name": "Батьки з маленькими дітьми", "icon": "parentWithChild" },
  "visualImpairment": { "id": "visualImpairment", "name": "Люди з порушенням зору", "icon": "visualImpairment" },
  "hearingImpairment": { "id": "hearingImpairment", "name": "Люди з порушенням слуху", "icon": "hearingImpairment" },
  "orientationDifficulty": { "id": "orientationDifficulty", "name": "Люди зі складнощами орієнтації в просторі", "icon": "orientationDifficulty" },
  "heightVariation": { "id": "heightVariation", "name": "Люди різного зросту", "icon": "heightVariation" },
  "foreignLanguage": { "id": "foreignLanguage", "name": "Іноземці / люди з іншою мовою", "icon": "foreignLanguage" },
  "sensoryTriggers": { "id": "sensoryTriggers", "name": "Люди з чутливістю до сенсорних подразників", "icon": "sensoryTriggers" },
  "respiratory": { "id": "respiratory", "name": "Люди з респіраторними проблемами", "icon": "respiratory" },
  "guideDog": { "id": "guideDog", "name": "Люди з собакою-поводирем", "icon": "guideDog" },
  "mobilityGeneral": { "id": "mobilityGeneral", "name": "Люди з обмеженою мобільністю (загально)", "icon": "mobilityGeneral" },
  "allPeople": { "id": "allPeople", "name": "Всі люди", "icon": "allPeople" }
};

// Helper function to extract categories from image descriptions or text
function extractCategories(categoryData) {
  if (!categoryData) return [];

  if (categoryData === 'всі люди') return ['allPeople'];

  const categories = [];

  if (typeof categoryData === 'object') {
    // Check text field
    if (categoryData.text === 'всі люди') {
      return ['allPeople'];
    }

    // Check images array
    if (Array.isArray(categoryData.images)) {
      categoryData.images.forEach(imageDesc => {
        // Try to find category mapping
        for (const [key, catId] of Object.entries(categoryMapping)) {
          if (imageDesc.includes(key)) {
            if (!categories.includes(catId)) {
              categories.push(catId);
            }
          }
        }
      });
    }
  }

  return categories;
}

// Helper function to determine recommendation triggers (negative answers)
function determineRecommendationTrigger(answerOptions, questionType) {
  if (!answerOptions) return [];

  const text = answerOptions.toLowerCase();
  const triggers = [];

  // For matrix type - matrix doesn't need triggers, handled differently
  if (questionType === 'matrix') {
    return ['Ні, але працюємо в цьому напрямку', 'Поки ні', 'Так, Частково'];
  }

  // Common negative patterns
  if (text.includes('так') && text.includes('ні')) {
    // "Так, всюди / Частково / ні" pattern
    if (text.includes('так, всюди') || text.includes('частково')) {
      triggers.push('Частково');
      triggers.push('Ні');
    }
    // "Так, частково / Ні" pattern
    else if (text.includes('так, частково')) {
      triggers.push('Так, Частково');
      triggers.push('Ні');
    }
    // Simple "Так / Ні" pattern - only "Ні" is negative
    else if (!text.includes('частково')) {
      triggers.push('Ні');
    }
  }

  // "Так, регулярно / Так, але нечасто / Ні" pattern
  if (text.includes('нечасто') || text.includes('рідко')) {
    triggers.push('Так, але нечасто і тільки заплановані');
    triggers.push('Ні');
  }

  // "Відповідає вимогам / Не відповідає вимогам" pattern
  if (text.includes('не відповідає')) {
    triggers.push('Не відповідає вимогам');
    triggers.push('не відповідає');
  }

  // If no specific triggers found but has "ні", add it
  if (triggers.length === 0 && text.includes('ні')) {
    triggers.push('Ні');
  }

  return triggers;
}

// Helper function to determine question type and parse options
function parseQuestionFormat(formatText, answerOptions, questionText = '') {
  if (!formatText && !answerOptions) return { type: 'text', options: null };

  const text = (formatText || answerOptions || '').toLowerCase();
  const originalText = formatText || answerOptions || '';

  // Check for matrix type (multiple rows selection)
  if (text.includes('вибір по категоріям') || text.includes('фізична,')) {
    return {
      type: 'matrix',
      rows: ['Фізична', 'Інформаційна', 'Цифрова', 'Освітня', 'Економічна', 'Суспільна'],
      columns: ['Так, повністю', 'Так, частково', 'Ні, але працюємо в цьому напрямку', 'Поки ні'],
      isSpecialAccessibilityMatrix: true // Flag this as the special overall accessibility question
    };
  }

  // Check for year range dropdown
  if (text.includes('1991') || (text.includes('drop down') && text.includes('рік'))) {
    return { type: 'dropdown', options: { type: 'yearRange', from: 1991, to: 2026 } };
  }

  // Check for oblast dropdown
  if ((text.includes('область') && text.includes('drop down')) || questionText.toLowerCase().includes('юридична адреса (область)')) {
    return { type: 'dropdown', options: { type: 'oblastList' } };
  }

  // Check for checkboxes (multiple selection)
  if (text.includes('обрати всі') || text.includes('обрати декілька')) {
    // Extract options from text
    const options = originalText.split('\n').filter(opt =>
      opt.trim() &&
      !opt.toLowerCase().includes('обрати') &&
      !opt.toLowerCase().includes('текст') &&
      !opt.match(/^\d+\)$/)
    ).map(o => {
      // Clean up options
      let cleaned = o.trim();
      // Remove leading numbers and closing parentheses
      cleaned = cleaned.replace(/^\d+\)\s*/, '');
      return cleaned;
    }).filter(o => o.length > 2 && o.length < 200);

    if (options.length >= 2) {
      return { type: 'checkbox', options };
    }
  }

  // Check for radio buttons (single selection)
  if (text.includes('обрати одне') || text.includes('вибір одного') || text.includes('вибір одної')) {
    let options = originalText.split('\n').filter(opt =>
      opt.trim() &&
      !opt.toLowerCase().includes('обрати') &&
      !opt.toLowerCase().includes('вибір') &&
      !opt.toLowerCase().includes('якщо так')
    ).map(o => {
      // Clean up options
      let cleaned = o.trim();
      // Remove leading numbers and dots/parentheses
      cleaned = cleaned.replace(/^\d+\)\s*/, '');
      return cleaned;
    }).filter(o => o.length > 0 && o.length < 200);

    // If we got only one option, it might be comma-separated
    if (options.length === 1 && options[0].includes(',')) {
      options = options[0].split(',').map(o => o.trim()).filter(o => o.length > 0);
    }

    if (options.length >= 2 && options.length <= 15) {
      return { type: 'radio', options };
    }
  }

  // Check for simple yes/no radio
  if ((text.includes('так') && text.includes('ні')) &&
      (text.includes('\\') || text.includes('/')) &&
      !text.includes('текст')) {
    const options = originalText.split(/[\\/\n]/).map(o => o.trim()).filter(o =>
      o.length > 0 &&
      !o.toLowerCase().includes('обрати') &&
      !o.toLowerCase().includes('якщо')
    );

    if (options.length >= 2 && options.length <= 6) {
      return { type: 'radio', options };
    }
  }

  // Check for textarea
  if (text.includes('текст') && (text.includes('макс') || text.includes('500 слів'))) {
    return { type: 'textarea' };
  }

  // Check if it's asking for multiple pieces of info (dropdown + text)
  if (text.includes('drop down') || text.includes('dropdown')) {
    // If it has dropdown and other text fields, treat first as dropdown
    return { type: 'dropdown', options: { type: 'oblastList' } };
  }

  // Default to text
  return { type: 'text' };
}

// Parse questions from tables
const sections = [];
let currentSection = null;
let currentSubsection = null;
let questionCounter = 1;

exportData.content.forEach((item, index) => {
  // Detect section headers
  if (item.type === 'paragraph' && item.text && item.text.match(/Розділ \d/)) {
    const sectionMatch = item.text.match(/Розділ (\d)/);
    const sectionNum = sectionMatch ? parseInt(sectionMatch[1]) : sections.length + 1;

    currentSection = {
      id: `section${sectionNum}`,
      title: item.text.replace(/^Розділ \d+\.\s*/, ''),
      description: '',
      subsections: []
    };
    sections.push(currentSection);
    currentSubsection = null;
  }

  // Detect subsection headers
  if (item.type === 'paragraph' && item.text && item.text.match(/Підрозділ \d\.\d/)) {
    if (currentSection) {
      const cleanTitle = item.text.trim();
      currentSubsection = {
        id: `section${sections.length}_sub${currentSection.subsections.length + 1}`,
        title: cleanTitle,
        questions: []
      };
      currentSection.subsections.push(currentSubsection);
    }
  }

  // Process table rows as questions
  if (item.type === 'table' && item.rows && item.rows.length > 0) {
    if (!currentSection) {
      // Create a default section if none exists
      currentSection = {
        id: `section${sections.length + 1}`,
        title: 'Загальна інформація',
        description: '',
        subsections: []
      };
      sections.push(currentSection);
    }

    if (!currentSubsection) {
      // Create a default subsection
      currentSubsection = {
        id: `section${sections.length}_sub${currentSection.subsections.length + 1}`,
        title: 'Основні питання',
        questions: []
      };
      currentSection.subsections.push(currentSubsection);
    }

    // Determine table type and extract questions
    const headers = item.headers || [];

    // Type 1: Accessibility questions (Section 3)
    if (headers.includes('Питання') && headers.includes('Варіанти відповідей')) {
      item.rows.forEach(row => {
        const questionText = row['Питання'];
        if (!questionText || questionText.trim() === '') return;

        // Skip incomplete questions (only "Чи наявне..." without details)
        if (questionText.trim() === 'Чи наявне...') return;

        const answerOptions = row['Варіанти відповідей'] || '';
        let explanation = row['Вспливаюче віконце'] || '';
        const categoryData = row['Оцінка для яких груп важливе питання'];

        // Handle image references in explanations
        if (explanation && explanation.includes('картинку')) {
          explanation = explanation.replace('поставити картинку?', 'дивіться приклад в "Розкажи детальніше"');
          // Add image path for low curb question
          if (questionText.includes('бордюри на переходах понижені')) {
            explanation = explanation + '||IMAGE:illustrations/low_curb';
          }
        }

        const categories = extractCategories(categoryData);
        const questionFormat = parseQuestionFormat('', answerOptions, questionText);

        const question = {
          id: `q${sections.length}_${currentSection.subsections.length}_${currentSubsection.questions.length + 1}`,
          text: questionText.trim(),
          type: questionFormat.type,
          required: true,
          categories: categories,
          isAccessibilityQuestion: categories.length > 0 || questionFormat.isSpecialAccessibilityMatrix,
          explanation: explanation && explanation.trim() !== '' ? explanation.trim() : undefined
        };

        // Add type-specific properties
        if (questionFormat.options) {
          // Clean up options: remove "простору", capitalize "ні" -> "Ні" and "частково" -> "Частково"
          question.options = questionFormat.options
            .filter(opt => opt.toLowerCase() !== 'простору')
            .map(opt => {
              // Special case: fix sorting station question with merged options
              if (opt.includes('Не маємо сортувальної станції') && opt.includes('Так')) {
                // This option is merged, should be split - just return the first part
                return 'Не маємо сортувальної станції';
              }
              // Capitalize "ні" at the beginning or standalone
              if (opt.toLowerCase() === 'ні' || opt.toLowerCase().trim() === 'ні') {
                return 'Ні';
              }
              // Capitalize "частково"
              if (opt.toLowerCase() === 'частково') {
                return 'Частково';
              }
              // Replace "ні" in compound answers
              if (opt.toLowerCase().includes('ні,')) {
                return opt.replace(/ні,/gi, 'Ні,');
              }
              return opt;
            });

          // Special handling for sorting station question - add missing options if needed
          if (questionText.includes('сортування') && questionText.includes('марковані')) {
            // If first option is about sorting station but we don't have 4 options, rebuild
            if (question.options[0] && question.options[0].includes('сортувальної станції')) {
              question.options = ['Не маємо сортувальної станції', 'Так', 'Частково', 'Ні'];
            }
          }
        }
        if (questionFormat.rows) {
          question.rows = questionFormat.rows;
          // Capitalize in columns too
          question.columns = questionFormat.columns.map(col => {
            if (col.toLowerCase().includes('ні')) {
              return col.replace(/ні/gi, 'Ні');
            }
            if (col.toLowerCase().includes('частково')) {
              return col.replace(/частково/gi, 'Частково');
            }
            return col;
          });
        }

        // Add recommendation triggers for accessibility questions
        if (question.isAccessibilityQuestion) {
          question.recommendationTrigger = determineRecommendationTrigger(answerOptions, questionFormat.type);
        }

        // Handle conditional answers for "Так"
        if (answerOptions.toLowerCase().includes('якщо так')) {
          question.conditionalFollow = 'Якщо так, будь ласка, уточніть';
        }

        currentSubsection.questions.push(question);
      });
    }

    // Type 2: General information questions (Section 1)
    else if (headers.includes('Загальна інформація') && headers.includes('Формат відповіді')) {
      item.rows.forEach(row => {
        const questionText = row['Загальна інформація'];
        if (!questionText || questionText.trim() === '') return;

        const formatText = row['Формат відповіді'] || '';
        const comment = row['Коментарі'] || '';

        const questionFormat = parseQuestionFormat(formatText, '', questionText);

        // First question is special - it's the center name
        const isFirstQuestion = sections.length === 1 && currentSection.subsections.length === 1 && currentSubsection.questions.length === 0;

        const question = {
          id: isFirstQuestion ? 'q1_1' : `q${sections.length}_${currentSection.subsections.length}_${currentSubsection.questions.length + 1}`,
          text: questionText.trim(),
          type: questionFormat.type,
          required: true, // Make all questions required
          categories: [],
          isAccessibilityQuestion: false,
          explanation: comment && comment.trim() !== '' ? comment.trim() : undefined
        };

        if (questionFormat.options) {
          question.options = questionFormat.options;
        }
        if (questionFormat.rows) {
          question.rows = questionFormat.rows;
          question.columns = questionFormat.columns;
        }

        currentSubsection.questions.push(question);
      });
    }

    // Type 3: Program activity questions (Section 2)
    else if (item.rows.length > 0) {
      // Try to extract questions from any table format
      item.rows.forEach(row => {
        // Get the first non-empty value as question text
        const questionText = Object.values(row).find(val => val && val.trim() !== '');
        if (!questionText || typeof questionText !== 'string') return;

        // Get the second value as format/options
        const values = Object.values(row).filter(v => v && v.trim() !== '');
        const formatText = values[1] || '';

        const questionFormat = parseQuestionFormat(formatText, '', questionText);

        const question = {
          id: `q${sections.length}_${currentSection.subsections.length}_${currentSubsection.questions.length + 1}`,
          text: questionText.trim(),
          type: questionFormat.type,
          required: true, // Make all questions required
          categories: [],
          isAccessibilityQuestion: false
        };

        if (questionFormat.options) {
          question.options = questionFormat.options;
        }
        if (questionFormat.rows) {
          question.rows = questionFormat.rows;
          question.columns = questionFormat.columns;
        }

        currentSubsection.questions.push(question);
      });
    }
  }
});

// Build final JSON structure
const outputData = {
  meta: {
    version: "2.0",
    language: "uk",
    totalSections: sections.length,
    generatedAt: new Date().toISOString().split('T')[0]
  },
  userCategories: userCategories,
  sections: sections
};

// Write to file
fs.writeFileSync('src/data/questions.json', JSON.stringify(outputData, null, 2), 'utf8');

// Print statistics
console.log('=== CONVERSION COMPLETE ===');
console.log(`Total sections: ${sections.length}`);
sections.forEach(section => {
  const totalQuestions = section.subsections.reduce((sum, sub) => sum + sub.questions.length, 0);
  console.log(`\n${section.title}: ${totalQuestions} питань`);
  section.subsections.forEach(sub => {
    console.log(`  ${sub.title}: ${sub.questions.length} питань`);
  });
});

const allQuestions = sections.reduce((sum, section) =>
  sum + section.subsections.reduce((subSum, sub) => subSum + sub.questions.length, 0), 0
);
console.log(`\nTotal questions: ${allQuestions}`);
