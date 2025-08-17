import React, { use, useEffect, useState } from 'react'
import Search from './components/Search'



const App = () => {
  
  const [searchTerm,setSearchTerm] = useState('')

  useEffect(() => {

  }, []);

  return (
    <main>

      <div className="pattern" />
      <div className='wrapper'>
          <header>
            <img src="./hero.png" alt="Hero-Banner" class="w-[800px] h-auto" />
            <br></br>
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
