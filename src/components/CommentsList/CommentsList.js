import { useState } from 'react';
import './CommentsList.css';
import PropTypes from 'prop-types';

const CommentsList = ({items, onReply}) => {  

  const [previewImage, setPreviewImage] = useState(null);
  
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
        <div className="d-flex justify-content-between align-items-center gap-2 mb-2 bg-light">
          
          <div className='d-flex align-items-center gap-2'>
            <div
            className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-2"
            style={{ width: 32, height: 32, fontSize: 18 }}
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
          

          <button
          type='button'
          className='btn btn-link float-end'
          onClick={() => onReply(c)}
          title='Reply'
          >
          <i className='bi bi-arrow-90deg-left'></i>
          </button>

        </div>
            
        {/* text */}
        <div 
          className='mb-2 comment-text' 
          dangerouslySetInnerHTML={{__html: c.sanitizedText}}
        >                  
        </div>

        {/* attachment */}
        {c.attachments && c.attachments.length > 0 && (
          <div className='mb-2'>
            {c.attachments.map(a => (
              <div key={a.id}>

                {/* image file */}
                {a.type === 1 && (
                  <img
                    src={a.url}
                    style={{ maxWidth: 200, borderRadius: 14, cursor: "pointer" }}
                    alt={a.originalFileName}
                    onClick={() => setPreviewImage(a.url)}
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
      
      <div className="card p-3">          
        {/* {items.length === 0 && (
          <p>No comments yet.</p>
        )} */}

        {items.map((c) => renderComment(c, 0))}
      </div>     

      {/* Bootstrap Modal for Image preview */}
      {previewImage && (
        <div 
          className="modal-backdrop"
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
             backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",             
            cursor: "zoom-out"
          }}
        >
          <img 
            src={previewImage}
            alt="Preview"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: 8,               
              transition: "transform 0.3s ease",
              transform: "scale(2)"
            }}
          />
        </div>
      )}

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
