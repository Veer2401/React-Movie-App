import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const Card = ({title }) => {
  const [count, setCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    console.log(`Card with title "${title}" has been ${hasLiked ? 'liked' : 'unliked'}.`);
  }, [hasLiked]);

  useEffect(() => {
   console.log('Card Rendered') 
  },[]);

  return(
    <div className='card' onClick={() => setCount((prevState) => prevState + 1)}>
    <h2>{title} - {count ? count : null}</h2>

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
