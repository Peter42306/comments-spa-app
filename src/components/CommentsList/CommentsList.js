import './CommentsList.css';
import PropTypes from 'prop-types';

const CommentsList = ({items, onReply}) => {  
  
  const formatDate = (utcString) => {
    const date = new Date(utcString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }


  return(
    <div className='CommentsList'>
      <h4>Comments</h4>
      
      <div className="card p-3">  
        {items.length === 0 && (
          <p>No comments yet.</p>
        )}

        {items.map((c) => (
          <div key={c.id} className="mb-3 border-bottom">

            {/* top row */}
            <div className="d-flex align-items-center gap-2 mb-2 bg-light">
              <div
                className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-2"
                style={{ width: 32, height: 32, fontSize: 14 }}
              >
                {c.userName ? c.userName[0].toUpperCase() : "?"}
              </div>

              <div className="semibold">
                {c.userName}
              </div>
              
              <div className="text-muted">
                {formatDate(c.createdAtUtc)}
              </div>
            </div>
            
            {/* text */}
            <div className='mb-2'>
              {c.sanitizedText}
            </div>

            <button
              type='button'
              className='btn btn-link float-end'
              onClick={() => onReply && onReply(c)}
            >
              Reply
            </button>
        </div>
        ))}
      </div>


      

      
      <div>Commentsa</div>

    </div>
  );

};
  

CommentsList.propTypes = {
  items: PropTypes.array.isRequired,
  onReply: PropTypes.func,
};

CommentsList.defaultProps = {
  onReply:null,
};

export default CommentsList;
