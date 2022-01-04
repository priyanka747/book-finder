import './App.css';
import React, { useState, useEffect } from 'react'
import Header from './components/Header';
import { Search } from './components/Search';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import dateFormat from 'dateformat';
function App() {

  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetch("http://openlibrary.org/search.json?author=tolkien")//http://openlibrary.org/search.json?q=
      .then((res) => res.json())
      .then((data) => setData(data))
      .then(() => setLoading())
      .catch(setError);
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
  const coverFormatter = (data, i) => {
    if (data) {
      let src = "http://covers.openlibrary.org/b/isbn/" + data[0] + "-M.jpg";
      if (src !== "") {
        return <img src={src} alt={"cover for book with isbn" + data[0]} />
      }
      return <p>image not found</p>;
    }
  };
  function dateSorter(a, b, order, dataField) {
    if (order === 'asc') {
      return new Date(a).getTime() - new Date(b).getTime();
    }
    return new Date(b).getTime() - new Date(a).getTime(); // desc
  }

  const dateFormatter = (data, i) => {
    if (data) {
      return dateFormat(new Date(data), "yyyy mmmm dd");
    }
  };
  const columns = [
    { dataField: "title", text: "Title", sort: true,
    sortCaret: (order, column) => {
      if (!order) return (<span>&nbsp;&nbsp;Desc/Asc</span>);
      else if (order === 'asc') return (<span>&nbsp;&nbsp;Desc/<font color="red">Asc</font></span>);
      else if (order === 'desc') return (<span>&nbsp;&nbsp;<font color="red">Desc</font>/Asc</span>);
      return null;
    },    },
    { dataField: "isbn", text: "Cover", formatter: coverFormatter },
    { dataField: "author_name", text: "Authors" },
    {
      dataField: "publish_date[0]",
      text: "Publish Date",
      sort: true,
      sortFunc: (a, b, order, dataField) => {
        console.log(order);
        if (order === 'asc') {
          return new Date(a).getTime() - new Date(b).getTime();
        }
        return new Date(b).getTime() - new Date(a).getTime(); // desc
      },
      sortCaret: (order, column) => {
        if (!order) return (<span>&nbsp;&nbsp;Desc/Asc</span>);
        else if (order === 'asc') return (<span>&nbsp;&nbsp;Desc/<font color="red">Asc</font></span>);
        else if (order === 'desc') return (<span>&nbsp;&nbsp;<font color="red">Desc</font>/Asc</span>);
        return null;
      },    
      formatter: dateFormatter
    },
  ];
  const defaultSorted = [{
    dataField: 'title',
    order: 'asc'
  }];
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
          pagination={paginationFactory()}
          defaultSorted={defaultSorted}
        />
      </div>
    </div>
  );

}

export default App;
