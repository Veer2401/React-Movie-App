import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const Card = ({title }) => {
  return(
    <div className='card'>
    <h2>{title}</h2>
    </div>
  )
}

const App = () => {
  return(
    <div className='card-container'>
      <Card title="Star Wars" />
      <Card title="The Godfather" />
      <Card title="Inception" />
      <Card title="The Dark Knight" />
      
    </div>
   
  )
}

export default App
