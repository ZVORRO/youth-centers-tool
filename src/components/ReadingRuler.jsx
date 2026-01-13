import { useState, useEffect } from 'react'
import './ReadingRuler.css'

function ReadingRuler() {
  const [position, setPosition] = useState({ y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      className="reading-ruler"
      style={{ top: `${position.y}px` }}
      aria-hidden="true"
    />
  )
}

export default ReadingRuler
