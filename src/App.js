import './App.css';
import React, { useState, useEffect } from 'react'
import Header from './components/Header';
import { Search } from './components/Search';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';

// Cover image URL for a book: prefer the Open Library cover id,
// fall back to the first ISBN, null when the book has neither.
const coverUrl = (book, size) => {
  if (!book) return null;
  if (book.cover_i) {
    return "https://covers.openlibrary.org/b/id/" + book.cover_i + "-" + size + ".jpg";
  }
  if (book.isbn && book.isbn.length > 0) {
    return "https://covers.openlibrary.org/b/isbn/" + book.isbn[0] + "-" + size + ".jpg";
  }
  return null;
};

// Cover image that shows "No cover" text when the book has no
// cover, or the cover image fails to load.
const CoverImage = ({ book, size, className }) => {
  const [failed, setFailed] = useState(false);
  const src = coverUrl(book, size);
  if (!src || failed) {
    return <span className="no-cover">No cover</span>;
  }
  return <img src={src} alt={"Cover for " + book.title} className={className} onError={() => setFailed(true)} />;
};

// Detail view shown when a book row is clicked.
const BookDetail = ({ book, onClose }) => {
  // Close with the Escape key.
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const openLibraryUrl = "https://openlibrary.org" + book.key;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <div className="modal-body">
          <CoverImage book={book} size="L" className="modal-cover" />
          <div className="modal-details">
            <h2>{book.title}</h2>
            {book.author_name && <p><strong>Author(s):</strong> {book.author_name.join(", ")}</p>}
            {book.first_publish_year && <p><strong>First published:</strong> {book.first_publish_year}</p>}
            {book.publisher && <p><strong>Publisher(s):</strong> {book.publisher.slice(0, 3).join(", ")}</p>}
            {book.publish_date && <p><strong>Publish date(s):</strong> {book.publish_date.slice(0, 3).join(", ")}</p>}
            {book.isbn && <p><strong>ISBN:</strong> {book.isbn.slice(0, 3).join(", ")}</p>}
            {book.edition_count && <p><strong>Editions:</strong> {book.edition_count}</p>}
            {book.language && <p><strong>Languages:</strong> {book.language.slice(0, 8).join(", ")}</p>}
            {book.subject && <p><strong>Subjects:</strong> {book.subject.slice(0, 6).join(", ")}</p>}
            <p><a href={openLibraryUrl} target="_blank" rel="noopener noreferrer">View on Open Library →</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {

  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("https://openlibrary.org/search.json?author=tolkien")//http://openlibrary.org/search.json?q=
      .then((res) => res.json())
      .then((data) => setData(data))
      .then(() => setLoading())
      .catch((e) => { setError(e); setLoading(false); });
  }, []);

  if (loading) {
    return <h1 style={{ textAlign: "center" }}>Loading...</h1>;
  }
  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }
  if (!data) {
    return null;
  }
  let books = data.docs;

  const searchHandler = (search) => {
    setSearch(search);
    if (search !== "") {
      const newBookList = books.filter((i) => {
        return Object.values(i)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      });
      setSearchResults(newBookList);
      // setLoading(true);
      // fetch("http://openlibrary.org/search.json?q="+search)
      //   .then((res) => res.json())
      //   .then((data) => setData(data))
      //   .then(() => setLoading())
      //   .catch(setError);
    } else {
      setSearchResults(books);
    }
  }
  const coverFormatter = (cell, row) => {
    return <CoverImage book={row} size="M" className="cover-img" />;
  };

  const authorFormatter = (cell) => {
    return cell ? cell.join(", ") : "";
  };

  const columns = [
    { dataField: "title", text: "Title", sort: true,
    sortCaret: (order, column) => {
      if (!order) return (<span>&nbsp;&nbsp;Desc/Asc</span>);
      else if (order === 'asc') return (<span>&nbsp;&nbsp;Desc/<font color="red">Asc</font></span>);
      else if (order === 'desc') return (<span>&nbsp;&nbsp;<font color="red">Desc</font>/Asc</span>);
      return null;
    },    },
    { dataField: "cover_i", text: "Cover", formatter: coverFormatter },
    { dataField: "author_name", text: "Authors", formatter: authorFormatter },
    { dataField: "first_publish_year", text: "First Published", sort: true },
  ];
  const defaultSorted = [{
    dataField: 'title',
    order: 'asc'
  }];

  // Click a row to open that book's detail view.
  const rowEvents = {
    onClick: (e, row) => { setSelectedBook(row); }
  };

  const paginationOptions = {
    sizePerPage: 10,
    sizePerPageList: [10, 25, 50, 100],
    showTotal: true,
    paginationSize: 5,
    firstPageText: 'First',
    prePageText: 'Prev',
    nextPageText: 'Next',
    lastPageText: 'Last',
  };

  return (
    <div className="App">
      <div className='container'>
        <Header></Header>
        <Search term={search} searchKeyword={searchHandler}></Search>
        <BootstrapTable
          data={search.length < 1 ? books : searchResults}
          keyField='key'
          columns={columns}
          striped
          hover
          condensed
          pagination={paginationFactory(paginationOptions)}
          defaultSorted={defaultSorted}
          rowEvents={rowEvents}
        />
        {selectedBook && <BookDetail book={selectedBook} onClose={() => setSelectedBook(null)} />}
      </div>
    </div>
  );

}

export default App;
