import React from 'react'


const Search = ({searchTerm, setSearchTerm}) => {
  return (
    <div className="search">
        <div>
            <img src="search.svg" alt="Search" />

            <input 
                type='text'
                placeholder='Search'
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="cursor-pointer"
            />
        </div>
    </div>
  )
}

export default Search
