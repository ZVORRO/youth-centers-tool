import TextQuestion from './TextQuestion'
import RadioQuestion from './RadioQuestion'
import CheckboxQuestion from './CheckboxQuestion'
import DropdownQuestion from './DropdownQuestion'
import MatrixQuestion from './MatrixQuestion'
import './QuestionTypes.css'

function QuestionRenderer({ question, value, onChange, showExplanation }) {
  // Parse explanation to extract only text (hide image path)
  const getExplanationText = (explanation) => {
    if (!explanation) return '';
    if (explanation.includes('||IMAGE:')) {
      return explanation.split('||IMAGE:')[0].trim();
    }
    return explanation;
  }

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'text':
        return <TextQuestion question={question} value={value} onChange={onChange} />
      case 'radio':
        return <RadioQuestion question={question} value={value} onChange={onChange} />
      case 'checkbox':
        return <CheckboxQuestion question={question} value={value} onChange={onChange} />
      case 'dropdown':
        return <DropdownQuestion question={question} value={value} onChange={onChange} />
      case 'matrix':
        return <MatrixQuestion question={question} value={value} onChange={onChange} />
      default:
        return <div>Unsupported question type: {question.type}</div>
    }
  }

  const explanationText = getExplanationText(question.explanation);

  return (
    <div className="question-renderer">
      <div className="question-text">
        <h2>{question.text}</h2>
        {question.required && <span className="required-indicator" aria-label="обов'язково">*</span>}
      </div>

      {renderQuestionInput()}

      {showExplanation && explanationText && (
        <div className="explanation-box">
          <div className="explanation-icon">💡</div>
          <div className="explanation-content">
            <strong>Чому це важливо?</strong>
            <p>{explanationText}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionRenderer
