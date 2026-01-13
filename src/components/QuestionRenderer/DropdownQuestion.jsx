import './QuestionTypes.css'

const OBLAST_LIST = [
  'Вінницька',
  'Волинська',
  'Дніпропетровська',
  'Донецька',
  'Житомирська',
  'Закарпатська',
  'Запорізька',
  'Івано-Франківська',
  'Київська',
  'Кіровоградська',
  'Луганська',
  'Львівська',
  'Миколаївська',
  'Одеська',
  'Полтавська',
  'Рівненська',
  'Сумська',
  'Тернопільська',
  'Харківська',
  'Херсонська',
  'Хмельницька',
  'Черкаська',
  'Чернівецька',
  'Чернігівська',
  'м. Київ'
]

function DropdownQuestion({ question, value, onChange }) {
  let options = []

  if (question.options?.type === 'yearRange') {
    const { from, to } = question.options
    options = Array.from({ length: to - from + 1 }, (_, i) => to - i)
  } else if (question.options?.type === 'oblastList') {
    options = OBLAST_LIST
  } else if (Array.isArray(question.options)) {
    options = question.options
  }

  return (
    <div className="question-input">
      <select
        id={question.id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={question.required}
        className="dropdown-select"
      >
        <option value="">Оберіть варіант...</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export default DropdownQuestion
