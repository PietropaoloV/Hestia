import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../constants';
import _ from 'lodash'; // Import lodash

type Ticker = {
  ticker: string;
  company: string;
};

const Companies: React.FC = () => {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const response = await axios.get(API_URL + '/api/tickers/');
        setTickers(response.data); // Assuming data is an array of Ticker objects
        setCurrentPage(1); // Move back to the first page when new search happens
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchTickers();
  }, [searchTerm]); // Listen to changes in searchTerm

  const totalPages = Math.ceil(tickers.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleTickers = tickers
    .filter((ticker) =>
      // Filter by similarity to search term using lodash
      _.includes(_.toLower(ticker.ticker), _.toLower(searchTerm)) ||
      _.includes(_.toLower(ticker.company), _.toLower(searchTerm))
    )
    .slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    for (let i = currentPage - 1; i <= currentPage + 1 && i <= totalPages; i++) {
      if (i > 0) {
        pageNumbers.push(
          <li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
            <a className="page-link" href="#" onClick={() => setCurrentPage(i)}>
              {i}
            </a>
          </li>
        );
      }
    }
    return pageNumbers;
  };

  return (
    <div className="row justify-content-center">
      <div className="col-xl-10 col-xxl-9">
        <div className="card shadow">
          <div className="card-header d-flex flex-wrap justify-content-center align-items-center justify-content-sm-between gap-3">
            <h5 className="display-6 text-nowrap text-capitalize mb-0">Companies</h5>
            <div className="input-group input-group-sm w-auto">
              <input
                className="form-control form-control-sm"
                type="text"
                placeholder="Search by ticker or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Company Name</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTickers.map((ticker) => (
                    <tr key={ticker.ticker}>
                      <td>{ticker.ticker}</td>
                      <td>{ticker.company}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-footer">
            <nav>
              <ul className="pagination pagination-sm mb-0 justify-content-center">
                <li className="page-item">
                  <a className="page-link" aria-label="Previous" href="#" onClick={handlePrevPage}>
                    <span aria-hidden="true">«</span>
                  </a>
                </li>
                {getPageNumbers()}
                <li className="page-item">
                  <a className="page-link" aria-label="Next" href="#" onClick={handleNextPage}>
                    <span aria-hidden="true">»</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Companies;
