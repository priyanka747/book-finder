import React from 'react'

export const Search = ({ term, searchKeyword }) => {
    function handleSearch(e) {
        searchKeyword(e.target.value);
    }
    return (
        <div>
            <input value={term} className="searchInput" type="text" placeholder="ENTER A BOOK NAME" onChange={handleSearch}></input>
        </div>
    )
}
