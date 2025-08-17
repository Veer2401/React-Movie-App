import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const Card = ({title }) => {
  const [hasLiked, setHasLiked] = useState(false);
  return(
    <div className='card'>
    <h2>{title}</h2>

    <button onClick={() => setHasLiked(!hasLiked)}>
      {hasLiked ? '♥️' : '🤍'}
    </button>
    </div>
  )
}

const App = () => {

  return(
    <div className='card-container'>
      <h2>Movie Application</h2>
      <Card title="Star Wars" />
      <Card title="The Godfather" />
      <Card title="Inception" />
      <Card title="The Dark Knight" />
      <Card title="Pulp Fiction" />
      
    </div>
   
  )
}

export default App
