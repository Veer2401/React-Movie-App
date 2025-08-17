import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const Card = ({title }) => {
  return(
    <h2>{title}</h2>
  )
}

const App = () => {
  return(
    <div>
      <h2>Movie App</h2>
      <Card title="Star Wars" />
      <Card title="The Godfather" />
      <Card title="Inception" />
    </div>
   
  )
}

export default App
