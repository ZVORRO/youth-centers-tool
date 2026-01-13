import './QuestionTypes.css'

function TextQuestion({ question, value, onChange }) {
  const isTextarea = !question.inputType || question.inputType === 'text'
  const isNumber = question.inputType === 'number'

  const handleChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <div className="question-input">
      {isTextarea ? (
        <textarea
          id={question.id}
          value={value || ''}
          onChange={handleChange}
          placeholder={question.placeholder || 'Введіть вашу відповідь...'}
          required={question.required}
          className="text-input textarea-input"
          rows={6}
        />
      ) : (
        <input
          type={isNumber ? 'number' : 'text'}
          id={question.id}
          value={value || ''}
          onChange={handleChange}
          placeholder={question.placeholder || 'Введіть вашу відповідь...'}
          required={question.required}
          className="text-input"
        />
      )}

      {question.validationRule && question.validationRule.warningBelow && value && parseFloat(value) < question.validationRule.min && (
        <div className="validation-warning">
          ⚠️ {question.validationRule.warningBelow}
        </div>
      )}
    </div>
  )
}

export default TextQuestion
