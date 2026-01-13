# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Youth Centers Accessibility Assessment Tool** - a UNDP-backed web application designed to evaluate the accessibility of youth centers/spaces in Ukraine. The tool conducts comprehensive assessments across multiple dimensions of accessibility (physical, digital, informational, educational, economic, and social) to help youth centers improve their services for people with disabilities and diverse needs.

## Core Data Structure

### Questions Data Model (questions.json)

The assessment system is entirely driven by `questions.json`, which contains:

- **Meta information**: version, language (Ukrainian), total sections, generation date
- **User categories**: 17 distinct user groups (wheelchair users, visual impairment, hearing impairment, parents with strollers, etc.)
- **Assessment sections**: 4 main sections, each with multiple subsections
- **Question types**:
  - `text` - free text input (with optional `inputType: "number"`)
  - `dropdown` - dropdown selections (with special types: `yearRange`, `oblastList`)
  - `radio` - single choice
  - `checkbox` - multiple choice
  - `matrix` - grid of options (rows × columns)

### Question Structure

Each question includes:
- `id`: unique identifier (e.g., "q1_1", "q3_2_5")
- `text`: question text in Ukrainian
- `type`: question input type
- `required`: boolean for validation
- `categories`: array of user category IDs this question affects
- `isAccessibilityQuestion`: boolean flag
- `recommendationTrigger`: array of answers that trigger recommendations (e.g., ["Так, частково", "Ні"])
- `explanation`: optional explanatory text
- `conditionalField`: field that appears based on specific answer
- `validationRule`: for numeric inputs (e.g., minimum width requirements)

### Section Organization

1. **Section 1 - General Information** (section1)
   - General info, detailed info, team composition
   - Non-accessibility questions (baseline data about the center)

2. **Section 2 - Program Activities** (section2)
   - Services, target groups, visitor statistics
   - Non-accessibility questions (activity data)

3. **Section 3 - Accessibility Assessment** (section3)
   - Overall assessment, surrounding territory, entrance group
   - Most questions are accessibility-focused with `isAccessibilityQuestion: true`
   - Questions linked to specific user categories for scoring

4. **Section 4** (not fully shown in data, but referenced in meta)

## Assessment Logic

### Scoring System

The tool generates accessibility scores by:
1. Analyzing answers to questions with `isAccessibilityQuestion: true`
2. Mapping answers to affected `categories` (user groups)
3. Calculating scores per section and per user category
4. Triggering recommendations when `recommendationTrigger` conditions are met

Example: Question q3_3_3 about ramps affects categories: ["wheelchair", "crutches", "stroller"] - if answer is "Так, частково" or "Ні", it triggers a recommendation.

### Results Dashboard

The results page displays:
- **Overall accessibility score** with rating (High, Medium, Low)
- **Section scores** (Physical Access, Digital Interfaces, Communication & Signage, Policy & Training)
- **User group breakdown** - scores for each disability/user category with specific recommendations
- Color-coded indicators (green = strong support, yellow = needs improvement, red = critical)

## UI/UX Design Patterns

Based on design mockups:

- **Home page**: Dashboard with assessment cards showing status (Finished/Stopped)
- **Assessment sections page**: List of sections with descriptions and numbered order
- **Question flow**: Sequential questions with Previous/Next navigation
- **Results dashboard**: Comprehensive scoring with drill-down by section and user group
- **Progress tracking**: "Your last assessment is X% complete" indicator

## Technical Considerations

### Multi-language Support
- Currently Ukrainian language (`"language": "uk"`)
- Infrastructure for English translations exists (e.g., English signage questions)
- Consider i18n implementation when building the frontend

### Validation & Conditional Logic
- Required field validation
- Conditional fields that appear based on previous answers
- Numeric validation rules (e.g., doorway width must be ≥90cm for wheelchair access)

### Data Processing Requirements
- Parse question types correctly (especially dropdowns with `yearRange` and `oblastList`)
- Handle matrix questions with row/column combinations
- Process `recommendationTrigger` arrays to generate actionable recommendations
- Map user categories to accessibility scores

### Accessibility Requirements
The tool itself must be accessible since it evaluates accessibility:
- Support screen readers
- Keyboard navigation
- WCAG 2.1 AA compliance minimum
- High contrast mode support
- Semantic HTML structure

## Tech Stack

- **Framework**: React 18+ with Vite
- **Routing**: React Router v6
- **State Management**: React Context API or Zustand (for assessment progress, answers, user mode)
- **PDF Generation**: html2pdf.js for generating recommendations report
- **Styling**: CSS Modules or Tailwind CSS
- **Deployment**: Vercel (zero-config deployment)
- **Language**: Ukrainian (primary), with potential English support

## Application Flow

The user journey follows this mandatory sequence:

1. **Landing Page** (`/`)
   - UNDP/partner logos
   - Tool title and brief description
   - "Start Assessment" CTA button
   - List of 4 assessment sections overview

2. **Instructions Page** (`/instructions`) - **MANDATORY, cannot skip**
   - Explanation of assessment methodology
   - What to expect: ~100 questions across 4 sections
   - How scoring works
   - Expected time to complete
   - Must click "I understand" to proceed

3. **Mode Selection** (`/mode-selection`)
   - Two modes: "З поясненнями" (with explanations) vs "Без пояснень" (without)
   - "With explanations" shows `explanation` field for each question
   - Mode choice affects UI complexity and assessment duration
   - Store mode in state/localStorage for entire session

4. **Assessment Sections** (`/assessment/:sectionId`)
   - Multi-page form (~100 questions total across 4 sections)
   - Progress indicator (% complete)
   - Previous/Next navigation
   - Auto-save to localStorage (prevent data loss)
   - Validation on Next (required fields)
   - Can pause and resume later

5. **Results & PDF Generation** (`/results`)
   - Overall accessibility score
   - Section-by-section breakdown
   - User category analysis
   - Recommendations based on `recommendationTrigger`
   - "Download PDF Report" button (uses html2pdf.js)

## Project Commands

```bash
# Development
npm run dev              # Start Vite dev server (http://localhost:5173)

# Build
npm run build            # Production build
npm run preview          # Preview production build locally

# Deployment
git push                 # Vercel auto-deploys from main branch

# Linting (if configured)
npm run lint             # ESLint
```

## Architecture Overview

### State Management

Key state to manage:
- **Assessment Progress**: current section, current question index, completion %
- **User Answers**: Map of `questionId -> answer` (persist to localStorage)
- **User Mode**: "with-explanations" | "without-explanations"
- **Session Metadata**: start time, last updated, assessment ID

### Component Structure

```
src/
├── components/
│   ├── QuestionRenderer/    # Dynamically renders based on question type
│   │   ├── TextQuestion.jsx
│   │   ├── RadioQuestion.jsx
│   │   ├── CheckboxQuestion.jsx
│   │   ├── DropdownQuestion.jsx
│   │   └── MatrixQuestion.jsx
│   ├── ProgressBar.jsx
│   ├── Navigation.jsx        # Previous/Next buttons with validation
│   └── PDFReport.jsx         # Template for PDF generation
├── pages/
│   ├── Landing.jsx
│   ├── Instructions.jsx
│   ├── ModeSelection.jsx
│   ├── Assessment.jsx        # Main assessment flow
│   └── Results.jsx
├── utils/
│   ├── scoring.js            # Calculate scores from answers
│   ├── recommendations.js    # Generate recommendations based on triggers
│   └── pdfGenerator.js       # html2pdf.js wrapper
├── data/
│   └── questions.json        # Imported directly
└── App.jsx
```

### Question Rendering Logic

The `QuestionRenderer` component must:
1. Parse `question.type` and render appropriate input component
2. Show `explanation` only if user selected "with-explanations" mode
3. Handle `conditionalField` - render additional field if trigger answer matches
4. Validate based on `required` and `validationRule`
5. Pass `categories` metadata for scoring (invisible to user)

### Scoring Algorithm

Implement in `utils/scoring.js`:

```javascript
// Pseudocode
function calculateScores(answers, questions) {
  // 1. Filter questions with isAccessibilityQuestion: true
  // 2. For each answer, check if it matches recommendationTrigger
  // 3. Map to affected categories (user groups)
  // 4. Calculate score per category: (good answers / total questions for category) * 100
  // 5. Calculate overall score: average of all category scores
  // 6. Return { overall, bySection, byCategory, recommendations }
}
```

### PDF Generation

Use html2pdf.js with custom template:
- Include UNDP branding
- Overall score with visual indicator
- Section scores table
- User category breakdown
- Specific recommendations (from `recommendationTrigger` matches)
- Assessment metadata (date, center name from q1_1)

Configuration:
```javascript
html2pdf()
  .set({
    margin: 10,
    filename: 'youth-center-accessibility-report.pdf',
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  })
  .from(element)
  .save();
```

## Development Workflow

### Initial Setup
```bash
npm create vite@latest . -- --template react
npm install react-router-dom html2pdf.js
```

### Data Loading
Import questions.json directly in components:
```javascript
import questionsData from './data/questions.json';
```

### localStorage Strategy
```javascript
// Save on every answer change
localStorage.setItem('assessment_answers', JSON.stringify(answers));
localStorage.setItem('assessment_progress', JSON.stringify({ sectionId, questionIndex }));

// Load on app mount
const savedAnswers = JSON.parse(localStorage.getItem('assessment_answers') || '{}');
```

### Vercel Deployment
1. Connect GitHub repo to Vercel
2. Auto-deployment on push to main
3. Build command: `npm run build`
4. Output directory: `dist`

## Testing Strategy

- Validate questions.json schema
- Test all question types render correctly
- Verify conditional logic works
- Test scoring calculations for all user categories
- Verify PDF generation includes all required sections
- Test localStorage persistence (refresh page mid-assessment)
- Accessibility testing (NVDA, JAWS, keyboard-only navigation)
- Test on mobile devices (responsive design)
- Cross-browser compatibility (Chrome, Firefox, Safari)

## Important Notes

- All content is in **Ukrainian language**
- Tool is specifically designed for **Ukrainian youth centers** (mentions oblasts, UNDP)
- Heavy focus on **physical accessibility** (ramps, doorways, signage) reflecting post-war reconstruction needs
- Questions reference Ukrainian building codes and standards
- Consider offline capability for field assessments
