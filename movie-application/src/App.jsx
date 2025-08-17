import React, { useState } from 'react'
import Search from './components/Search'

const App = () => {
  
  const [searchTerm,setSearchTerm] = useState('')

  return (
    <main>

      <div className="pattern" />
      <div className='wrapper'>
          <header>
            <img src="./hero-img.png" alt="Hero-Banner" />
            <h1>Find your <span className="text-gradient">favourite </span>movies !</h1>
          </header>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <br>
          </br>
          <h1 className='search-term'> <span className='text-gradient'>{searchTerm}</span></h1>
      </div>
    </main>
  )
}

export default App
