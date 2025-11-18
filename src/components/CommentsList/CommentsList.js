import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './CommentsList.css';
import { fetchComments } from '../../api';

const CommentsList = () => {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const loadPage = async (pageToLoad) => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchComments(pageToLoad, 25, "createdAt", "desc");
      setData(result);
      setPage(result.page);
    } catch (e) {
      console.error(e);
      console("Failed to load comments.")
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(1);
  },[]);

  const handlePrev = () => {
    if (page > 1) {
      loadPage(page - 1);
    }
  };

  const handleNext = () => {
    if(data && page * data.pageSize < data.totalCount){
      loadPage(page + 1);
    }
  };

  return(
  <div className="CommentsList">
    <div className='mt-4'>
      <h4>Comments</h4>

      {loading && <p>Loading comments...</p>}
      {error && <div className='alert alert-danger'>{error}</div>}      

      {data && data.items.length === 0 && !loading && (
        <p>No comments yet</p>
      )}

      {data && data.items.length > 0 && (
        <>
        <table className='table'>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>              
              <th>Url</th>
              <th>Created</th>
              <th>Text</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((c) => (
              <tr key={c.id}>
                <td>{c.userName}</td>
                <td>{c.email}</td>
                <td>{c.homePage}</td>
                <td>{new Date(c.createdAtUtc).toLocaleString()}</td>
                <td>{c.sanitizedText}</td>
              </tr>
            ))}
          </tbody>
        </table>

        
        </>
      )}
    </div>    
  </div>
  );

}
  

CommentsList.propTypes = {};

CommentsList.defaultProps = {};

export default CommentsList;
