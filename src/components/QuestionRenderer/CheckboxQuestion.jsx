import './QuestionTypes.css'

function CheckboxQuestion({ question, value, onChange }) {
  const options = question.options || []

  // Handle both simple array and object with conditionalField
  const hasConditionalField = !!question.conditionalField
  const selectedValues = hasConditionalField
    ? (value?.options || [])
    : (Array.isArray(value) ? value : [])
  const otherText = hasConditionalField ? (value?.otherText || '') : ''

  const handleToggle = (option) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option]

    if (hasConditionalField) {
      // If unchecking the trigger option, clear the otherText
      const isTrigger = option === question.conditionalField.trigger
      const isRemoving = selectedValues.includes(option)

      onChange({
        options: newValues,
        otherText: (isTrigger && isRemoving) ? '' : otherText
      })
    } else {
      onChange(newValues)
    }
  }

  const handleOtherTextChange = (text) => {
    onChange({
      options: selectedValues,
      otherText: text
    })
  }

  const showConditionalField = hasConditionalField &&
    selectedValues.includes(question.conditionalField.trigger)

  return (
    <div className="question-input">
      <div className="checkbox-options">
        {options.map((option, index) => {
          const isChecked = selectedValues.includes(option)

          return (
            <label key={index} className="checkbox-option">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(option)}
                className="checkbox-input"
              />
              <span className="checkbox-label-text">{option}</span>
            </label>
          )
        })}
      </div>

      {showConditionalField && (
        <div className="conditional-field">
          <label htmlFor={`${question.id}_other`} className="conditional-label">
            {question.conditionalField.field.label}
          </label>
          <input
            type="text"
            id={`${question.id}_other`}
            value={otherText}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            className="text-input"
            placeholder="Введіть деталі..."
          />
        </div>
      )}
    </div>
  )
}

export default CheckboxQuestion
