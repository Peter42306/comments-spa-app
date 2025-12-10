import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import { createComment, fetchAttachments, fetchCaptcha, fetchCommentsTree, uploadAttachment } from './api';
import CommentsList from './components/CommentsList/CommentsList';

const PAGE_SIZE = 5;

function buildCommentsTreeWithAttachments(flat, attachmentById){
  const map = new Map();

  flat.forEach(c => {
    map.set(c.id, {...c, children: [], attachments: attachmentById.get(c.id) || []});
  });

  const roots = [];

  map.forEach(comment => {
    if (comment.parentId == null) {
      roots.push(comment);
    } else {
      const parent = map.get(comment.parentId);
      if (parent) {
        parent.children.push(comment);
      }
    }
  });

  return roots;
}


function App() {
  
  // CAPTCHA
  const [captcha, setCaptcha] = useState(null);
  const [captchaError, setCaptchaError] = useState(null);

  // FORM
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [homePage, setHomePage] = useState("");
  const [text, setText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // COMMENTS
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  // FILE
  const [file, setFile] = useState(null);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  // SORTING
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");  

  // SCROLLING TO FORM WHEN REPLY TO
  const formRef = useRef(null);
  const textRef = useRef(null);
  

  // INSERT TAG IN TEXTAREA
  const inserTag = (startTag, endTag) => {
    const textarea = document.getElementById("commentText");
    
    if(!textarea){
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const before = text.slice(0,start);
    const selected = text.slice(start, end);
    const after = text.slice(end);

    setText(before + startTag + selected + endTag + after);
  };

  // INSERT LINK IN TEXTAREA
  const insertLink = () => {
    const url = prompt("Enter URL:");
    if(!url){
      return;
    }

    const textarea = document.getElementById("commentText");
    if(!textarea){
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selected = text.slice(start, end) || "link";
    const linkTag = `<a href="${url}" title="">${selected}</a>`;

    const before = text.slice(0, start);
    const after = text.slice(end);

    setText(before + linkTag + after);
  };


  useEffect(()=>{
    loadCaptcha();    
  }, []);    
  
  useEffect(() => {
    loadComments();
  }, [sortBy, sortDirection]);

  useEffect(() => {
    if(!captcha?.expiresAtUtc){
      return;
    };

    const expires = new Date(captcha.expiresAtUtc);
    const now = new Date();
    const remaining = expires - now;

    if(remaining <= 0){
      loadCaptcha();
      return;
    };

    const timer = setTimeout(() => {
      loadCaptcha();
    }, remaining);

    return () => clearTimeout(timer);

  }, [captcha?.expiresAtUtc]);

  const loadCaptcha = async () => {
    try{
      setCaptchaError(null);
      const data = await fetchCaptcha();      

      setCaptcha(data);
      setCaptchaInput("");
    } catch (e) {      
      setCaptchaError("CAPTCHA download error.");
    }
  };

  const loadComments = async () => {
    try {
      const flat = await fetchCommentsTree();      

      // SORTING
      flat.sort((a, b) => {
        if(sortBy === "createdAt"){
          return sortDirection === "desc"
          ? new Date(b.createdAtUtc) - new Date(a.createdAtUtc)
          : new Date(a.createdAtUtc) - new Date(b.createdAtUtc);
        }

        if(sortBy === "userName"){
          return sortDirection === "desc"
          ? b.userName.localeCompare(a.userName)
          : a.userName.localeCompare(b.userName);
        }

        if(sortBy === "email"){
          return sortDirection === "desc"
          ? b.email.localeCompare(a.email)
          : a.email.localeCompare(b.email);
        }

        return 0;
      });

      // ATTACHMENTS
      const attachmentById = new Map();

      await Promise.all(
        flat.map(async (comment) => {
          try {
           const attachments = await fetchAttachments(comment.id);
           attachmentById.set(comment.id, attachments); 
          } catch (e) {
            //TODO:
            attachmentById.set(comment.id, []);
          }
        })
      );

      // for (const comment of flat) {
      //   const attachments = await fetchAttachments(comment.id);
      //   attachmentById.set(comment.id, attachments);
      // }

      // TREE OF COMMENTS
      const tree = buildCommentsTreeWithAttachments(flat, attachmentById);            
      setComments(tree);
      setCurrentPage(1);

    } catch (error) {      
      // TODO: ???
    } finally {
      setIsLoadingComments(false);
    }

  };

  const handleReply = (comment) => {
    setReplyTo(comment);

    if(formRef.current){
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }

    setTimeout(() => {
      if(textRef.current){
        textRef.current.focus();
      }
    }, 200);
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(isSubmitting){
      return;
    }
    setIsSubmitting(true);

    setCaptchaError(null)
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!captcha) {
      setSubmitError("Captcha not loaded.");
      isSubmitting(false);
      return;
    }

    const captchaId = captcha.captchaId;
    const captchCode = captchaInput.trim();    

    try {
      const result = await createComment({
        parentId: replyTo ? replyTo.id : null,
        userName,
        email,
        homePage: homePage || null,
        rawText: text,
        captchaId,
        captchaInput: captchCode,
      });

      const newCommentId = result.id;

      if(file){
        try {
          await uploadAttachment(newCommentId, file);
        } catch (e) {          
          //TODO:
        }
      };
      

      setSubmitSuccess("Comment added.");

      setText("");
      setCaptchaInput("");
      setReplyTo(null);
      setFile(null);
      
            
      await loadComments();
      await loadCaptcha();

    } catch (error) {
      setSubmitError(error.message);      
      await loadCaptcha();

    } finally {
      setIsSubmitting(false);

    }
  };

  const totalPages = Math.max(1, Math.ceil(comments.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const visibleComments = comments.slice(startIndex, endIndex);

  return (
    <div className="CommentsList container my-4">
      <h1>Comments SPA</h1>      

      <div className='card p-3 mb-3'>
      
      {/* ADD COMMENT FORM */}
      <form onSubmit={handleSubmit} ref={formRef}>        
        <h4>Add comment</h4>        

        
          {replyTo && (            
            <>
            <hr/>
              <div className='row align-items-center'>                
                <div className='col-12 col-md-9'>                  
                  <h4>Reply</h4>
                  <div>
                    Comment from <strong>{replyTo.userName}</strong> : {" "}
                    <em>{replyTo.sanitizedText.slice(0,200)}...</em>
                  </div>
                </div>
                
                <div className='col-12 col-md-3 d-flex justify-content-end'>
                  <button
                    type='button'
                    className='btn btn-secondary w-100'
                    onClick={() => setReplyTo(null)}
                  >
                  Cancel
                  </button>
                </div>
              </div>               
            </>
          )}
        
        

        <hr/>

        <div className='row'>
          <div className='col-12 col-md-4 mb-3'>
            <label className='form-label'>User Name</label>
            <input
              className='form-control'
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              maxLength={50}
            />
          </div>

        <div className='col-12 col-md-4 mb-3'>
          <label className='form-label'>Email</label>
          <input
            className='form-control'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={100}
          />
        </div>

        <div className='col-12 col-md-4 mb-3'>
          <label className='form-label'>Home page (optional)</label>
          <input
            className='form-control'
            type='url'
            value={homePage}
            onChange={(e) => setHomePage(e.target.value)}            
            maxLength={200}
          />
        </div>
        </div>
        

        
        <div className='mb-2 d-flex align-items-center justify-content-between gap-2'>
          <span>Text</span>   
          <div className='d-flex gap-2'>
            <button 
              type='button' 
              className='btn btn-sm btn-outline-secondary'
              onClick={() => inserTag("<strong>","</strong>")}
            >
              Bold
            </button>
            <button 
              type='button'
              className='btn btn-sm btn-outline-secondary'
              onClick={() => inserTag("<i>","</i>")}
            >
              Italic
            </button>
            <button 
              type='button' 
              className='btn btn-sm btn-outline-secondary'
              onClick={() => inserTag("<code>","</code>")}
            >
              Code
            </button>
            <button 
              type='button' 
              className='btn btn-sm btn-outline-secondary'
              onClick={insertLink}
            >
              Link
            </button>
          </div>          
        </div>

        <div className='mb-3'>          
          <textarea
            ref={textRef}
            id='commentText'
            className='form-control'            
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            maxLength={4000}
          />
        </div>

        <div className='mb-3'>
          <label className='form-label'>
            Attachment (image or text file)
          </label>
          <input
            type='file'
            className='form-control'
            accept='.jpg,.jpeg,.png,.gif,.txt'
            onChange={(e) => {
              const selected = e.target.files && e.target.files[0];
              setFile(selected || null);
            }}
          />
          <div className='form-text'>
            Please attach JPG / PNG / GIF images or TXT files up to 100 KB.
          </div>
        </div>

        

        {/* CAPTCHA */}
        <div className="row align-items-center">

          
          
          <div className='col-12 col-md-9'>
            <div className='d-flex align-items-center justify-content-start'>

              <div className='mb-3'>
            <label className='form-label'>Captcha</label>
            <input
              className='form-control'            
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}                        
              required
            />
          </div>


              <div>
                {captchaError && <div className='alert alert-danger'>{captchaError}</div>}

                {captcha && (
                  <div className='mt-3'>
                    <img
                      src={captcha.imageBase64}
                      style={{height: 50}}
                      alt='captcha'
                    />                
                  </div>
                )}
              </div>
              <div>
                <button type='button' className='btn btn-secondary' onClick={loadCaptcha}>
                  Refresh
                </button>
              </div>          
            </div>
          </div>           
          
          
          <div className='col-12 col-md-3 d-flex justify-content-end'>
            <button 
              type='submit' 
              className='btn btn-primary w-100'
              disabled={!captcha || !captchaInput.trim() || isSubmitting}
            >              
              {isSubmitting 
                ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm me-2'
                      role='status'
                      aria-hidden='true'
                    ></span>
                    Submit
                  </>
                ) : (
                  "Submit"
                )}
            </button>
          </div>     

        </div>
        
      </form>

      </div>

      

      
      

      {submitError && <div className='alert alert-danger'>{submitError}</div>}
      {submitSuccess && (<div className='alert alert-success'>{submitSuccess}</div>)}

      {!captcha && !captchaError && <p>Loading...</p>}

      {/* SORTING */}
      <div className="card p-3 mb-3">       
        <h4>Comments</h4>
        <hr/>

        <div className="row g-3">
          <div className="col-6">
            <label className="form-label">Sort by</label>
            <select
              className='form-select'
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                //loadComments();
                setCurrentPage(1);
              }}
            >
              <option value="createdAt">Date</option>
              <option value="userName">Name</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div className="col-6">
            <label className="form-label">Direction</label>
            <select
              className='form-select'
              value={sortDirection}
              onChange={(e) => {
                setSortDirection(e.target.value);
                //loadComments();
                setCurrentPage(1);
              }}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>              
            </select>
          </div>
        </div>
      </div>

      {isLoadingComments && (
        <div className='card p-3'>
          <div className='spinner-border text-primary' role='status'></div>
          <p>Loading comments...</p>
        </div>          

      )}
      {!isLoadingComments && comments.length === 0 && (
        <div className='card p-3'>          
          <p>No commentss yet</p>
        </div>                  
      )}
      {!isLoadingComments && comments.length > 0 && (
        <CommentsList 
          items={visibleComments}
          onReply={handleReply}
        />
      )}

      

      {/* PAGINATION */}
      {comments.length > 0 && (
        <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
          <button
            type='button'
            className='btn btn-outline-secondary'
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>


          <button
            type='button'
            className='btn btn-outline-secondary'
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
}

export default App;
