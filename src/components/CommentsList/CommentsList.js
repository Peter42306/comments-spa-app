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

  const renderComment = (c, level = 0) => {
    const marginLeft = level * 10;
    const isRoot = level === 0;

    return(
      <div 
        key={c.id}
        style={{marginLeft}}
        className={`mb-3 ${isRoot ? 'border-bottom' : ''}`}
      >
        {/* parent comment, top row */}
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

          <button
          type='button'
          className='btn btn-link float-end'
          onClick={() => onReply(c)}
          >
          Reply
          </button>

        </div>
            
        {/* text */}
        <div className='mb-2'>
          {c.sanitizedText}
        </div>

        {/* attachment */}
        {c.attachments && c.attachments.length > 0 && (
          <div>
            {c.attachments.map(a => (
              <div>

                {/* image file */}
                {a.type === 1 && (
                  <img
                    src={a.url}
                    style={{ maxWidth: "200", borderRadius: 4 }}
                    alt={a.originalFileName}
                  />
                )}

                {/* text file */}
                {a.type === 2 && (
                  <a href={a.url} target='_blank' rel='noreferrer'>
                    Download text file ({a.originalFileName})
                  </a>
                )}
              </div>
            ))}
          </div>
        )}


        {/* children */}
        {c.children && c.children.length > 0 && (
          <div className='mt-2'>
            {c.children.map(child => renderComment(child, level + 1))}
          </div>
        )}

      </div>
    );
  };


  return(
    <div className='CommentsList'>
      <h4>Comments</h4>
      
      <div className="card p-3">  
        {items.length === 0 && (
          <p>No comments yet.</p>
        )}

        {items.map((c) => renderComment(c, 0))}
      </div>     

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
