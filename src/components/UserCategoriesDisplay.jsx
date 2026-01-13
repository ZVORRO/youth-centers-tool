import { useAssessment } from '../context/AssessmentContext'
import './UserCategoriesDisplay.css'

function UserCategoriesDisplay({ categories }) {
  const { questionsData } = useAssessment()

  // Don't show if no categories
  if (!categories || categories.length === 0) {
    return null
  }

  const userCategories = questionsData?.userCategories || {}

  return (
    <div className="user-categories-display">
      <h3 className="categories-title">Для цих груп це питання важливе</h3>
      <div className="categories-icons">
        {categories.map((categoryId) => {
          const category = userCategories[categoryId]
          if (!category) return null

          return (
            <div key={categoryId} className="category-icon-wrapper">
              <img
                src={`/icons/${categoryId}.png`}
                alt={category.name}
                className="category-icon"
                title={category.name}
              />
              <span className="category-tooltip">{category.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UserCategoriesDisplay
