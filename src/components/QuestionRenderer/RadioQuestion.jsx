import './QuestionTypes.css'

// Emoji mapping for common answers
const emojiMap = {
  'Так': '👍',
  'Ні': '👎',
  'Так, всюди': '👍',
  'Так, частково': '🤔',
  'Так, регулярно': '✅',
  'Так, але нечасто і тільки заплановані': '📅',
  'Так, поруч - 5 хв пішки': '🚶',
  'Так, 10-20 хв пішки': '🚶‍♂️',
}

function RadioQuestion({ question, value, onChange }) {
  const options = question.options || []

  const getEmoji = (option) => {
    return emojiMap[option] || null
  }

  const handleConditionalChange = (conditionalValue) => {
    onChange({
      main: value?.main || '',
      conditional: conditionalValue
    })
  }

  const showConditionalField = question.conditionalField && value?.main === question.conditionalField.trigger

  return (
    <div className="question-input">
      <div className="radio-options">
        {options.map((option, index) => {
          const emoji = getEmoji(option)
          const isSelected = (typeof value === 'string' ? value : value?.main) === option

          return (
            <div
              key={index}
              className={`radio-option ${isSelected ? 'radio-option-selected' : ''}`}
              onClick={() => {
                if (question.conditionalField) {
                  onChange({ main: option, conditional: '' })
                } else {
                  onChange(option)
                }
              }}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (question.conditionalField) {
                    onChange({ main: option, conditional: '' })
                  } else {
                    onChange(option)
                  }
                }
              }}
            >
              {emoji && <span className="option-emoji" aria-hidden="true">{emoji}</span>}
              <span className="option-text">{option}</span>
              {isSelected && <span className="checkmark">✓</span>}
            </div>
          )
        })}
      </div>

      {showConditionalField && (
        <div className="conditional-field">
          <label htmlFor={`${question.id}_conditional`} className="conditional-label">
            {question.conditionalField.field.label}
          </label>
          <input
            type="text"
            id={`${question.id}_conditional`}
            value={value?.conditional || ''}
            onChange={(e) => handleConditionalChange(e.target.value)}
            className="text-input"
            placeholder="Введіть деталі..."
          />
        </div>
      )}
    </div>
  )
}

export default RadioQuestion
