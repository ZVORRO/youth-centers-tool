import { useNavigate } from 'react-router-dom'
import '../styles/Landing.css'

function Landing() {
  const navigate = useNavigate()

  const handleStartAssessment = () => {
    navigate('/instructions')
  }

  return (
    <div className="landing-page" id="main-content" tabIndex="-1">
      {/* Header with logos */}
      <header className="landing-header">
        <div className="container">
          <div className="logos">
            <img
              src="/UNDP-Logo-Blue-Large.png"
              alt="UNDP Logo"
              className="undp-logo"
            />
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="landing-main">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Інструмент самооцінки доступності молодіжних центрів
            </h1>
            <p className="hero-description">
              Комплексна оцінка фізичної, цифрової, інформаційної, освітньої,
              економічної та суспільної доступності молодіжних просторів в Україні
            </p>
            <button
              className="btn btn-primary btn-large"
              onClick={handleStartAssessment}
            >
              Почати оцінювання
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Assessment sections overview */}
          <section className="sections-overview">
            <h2 className="sections-title">Розділи оцінювання</h2>
            <div className="sections-grid">
              <div className="section-card">
                <div className="section-number">1</div>
                <h3>Загальна інформація</h3>
                <p>Базові дані про молодіжний простір, команду та організаційний статус</p>
              </div>

              <div className="section-card">
                <div className="section-number">2</div>
                <h3>Програмна діяльність</h3>
                <p>Інформація про послуги, цільові групи та напрямки діяльності</p>
              </div>

              <div className="section-card">
                <div className="section-number">3</div>
                <h3>Доступність простору</h3>
                <p>Оцінка фізичної, інформаційної та цифрової доступності</p>
              </div>

              <div className="section-card">
                <div className="section-number">4</div>
                <h3>Політики та процедури</h3>
                <p>Організаційні процедури та політики щодо інклюзивності</p>
              </div>
            </div>
          </section>

          {/* Useful materials */}
          <section className="useful-materials">
            <h2 className="materials-title">Корисні матеріали</h2>
            <div className="materials-list">
              <a
                href="https://bf.in.ua/"
                target="_blank"
                rel="noopener noreferrer"
                className="material-link"
              >
                <span className="material-icon">📖</span>
                <div className="material-content">
                  <h3>Довідник безбар'єрності</h3>
                  <p>Комплексний посібник з питань безбар'єрності</p>
                </div>
                <span className="material-arrow">→</span>
              </a>

              <a
                href="https://youthcenters.net.ua/bez-bar-eriv-prezentuosibnika-fizichna-bezbar-ernist-molodignih-tsentriv"
                target="_blank"
                rel="noopener noreferrer"
                className="material-link"
              >
                <span className="material-icon">🏢</span>
                <div className="material-content">
                  <h3>Посібник «Фізична безбар'єрність молодіжних центрів»</h3>
                  <p>Від Асоціації молодіжних центрів України (АМЦУ)</p>
                </div>
                <span className="material-arrow">→</span>
              </a>

              <a
                href="https://bbu.org.ua/pershii-rozdil-albomu-bezbar-iernih-rishen-2/"
                target="_blank"
                rel="noopener noreferrer"
                className="material-link"
              >
                <span className="material-icon">✏️</span>
                <div className="material-content">
                  <h3>Рекомендації з впровадження Універсального Дизайну</h3>
                  <p>Альбом безбар'єрних рішень та практичні поради</p>
                </div>
                <span className="material-arrow">→</span>
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p>© 2026 UNDP Ukraine. Інструмент розроблено для підтримки молодіжних центрів</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
