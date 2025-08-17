import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const Card = () => {
  return(
    <h2>Card Component</h2>
  )
}

const App = () => {
  return(
    <div>
      <h2>Movie App</h2>
      <Card />
    </div>
   
  )
}

export default App
