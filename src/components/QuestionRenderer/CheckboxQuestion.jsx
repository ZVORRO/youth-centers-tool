import './QuestionTypes.css'

function CheckboxQuestion({ question, value, onChange }) {
  const options = question.options || []
  const selectedValues = Array.isArray(value) ? value : []

  const handleToggle = (option) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option]

    onChange(newValues)
  }

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
    </div>
  )
}

export default CheckboxQuestion
