import './QuestionTypes.css'

function MatrixQuestion({ question, value, onChange }) {
  const rows = question.rows || []
  const columns = question.columns || []
  const matrixValue = value || {}

  const handleCellChange = (row, column) => {
    onChange({
      ...matrixValue,
      [row]: column
    })
  }

  return (
    <div className="question-input">
      <div className="matrix-table-container">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="matrix-header-empty"></th>
              {columns.map((col, index) => (
                <th key={index} className="matrix-header">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="matrix-row-header">{row}</td>
                {columns.map((col, colIndex) => {
                  const isSelected = matrixValue[row] === col
                  return (
                    <td key={colIndex} className="matrix-cell">
                      <label className="matrix-radio-label">
                        <input
                          type="radio"
                          name={`${question.id}_${row}`}
                          checked={isSelected}
                          onChange={() => handleCellChange(row, col)}
                          className="matrix-radio"
                        />
                        <span className="matrix-radio-custom"></span>
                      </label>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MatrixQuestion
