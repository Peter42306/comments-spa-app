import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { createComment, fetchCaptcha, fetchComments } from './api';
import CommentsList from './components/CommentsList/CommentsList';

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

  // COMMENTS
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  


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
      const data = await fetchComments();
      setComments(data.items);
    } catch (error) {
      // TODO: ???
    }
  };

  useEffect(()=>{
    loadCaptcha();
    loadComments();
  }, []);  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!captcha) {
      setSubmitError("Captcha not loaded.");
      return;
    }

    try {
      await createComment({
        parentId: null,
        userName,
        email,
        homePage: homePage || null,
        rawText: text,
        captchaId: captcha.captchaId,
        captchaInput
      });

      setSubmitSuccess("Comment added.");

      setText("");
      setCaptchaInput("");

      await loadCaptcha();
      await loadComments();

    } catch (error) {
      setSubmitError(error.message);
      await loadCaptcha();
    }
  };

  return (
    <div className="CommentsList container my-4">
      <h2>Comments SPA - Frontend</h2>

      {/* CAPTCHA */}
      {/* <button className='btn btn-secondary mb-3' onClick={loadCaptcha}>
        Renew CAPTCHA
      </button>

      {captchaError && <div className='alert alert-danger'>{captchaError}</div>}

      {captcha && (
        <div className='mb-4'>
          <img
            src={captcha.imageBase64}
            style={{height: 60}}
            alt='captcha'
          />
          <p className='small text-muted my-2'>
            captchaId: <code>{captcha.captchaId}</code>
          </p>
        </div>
      )} */}

      {/* ADD COMMENT FORM */}
      <form className='mb-4' onSubmit={handleSubmit}>        
        <h4>Add comment</h4>        

        <div className='mb-3'>
          <label className='form-label'>User Name</label>
          <input
            className='form-control'
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            maxLength={50}
          />
        </div>

        <div className='mb-3'>
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

        <div className='mb-3'>
          <label className='form-label'>Home page (optional)</label>
          <input
            className='form-control'
            type='url'
            value={homePage}
            onChange={(e) => setHomePage(e.target.value)}            
            maxLength={200}
          />
        </div>

        <div className='mb-3'>
          <label className='form-label'>Text</label>
          <textarea
            className='form-control'            
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            maxLength={4000}
          />
        </div>

        <div className='mb-3'>
          <label className='form-label'>Captcha</label>
          <input
            className='form-control'            
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}                        
            required
          />
        </div>

        {/* CAPTCHA */}
        {captchaError && <div className='alert alert-danger'>{captchaError}</div>}

          {captcha && (
            <div className='mb-1'>
              <img
                src={captcha.imageBase64}
                style={{height: 50}}
                alt='captcha'
              />
              {/* <p className='small text-muted my-2'>
                captchaId: <code>{captcha.captchaId}</code>
              </p> */}
            </div>
          )}

        <div  className="d-flex align-items-center gap-2">          
          <button type='submit' className='btn btn-primary'>
          Submit comment
          </button>          
          <button type='button' className='btn btn-secondary' onClick={loadCaptcha}>
            Renew CAPTCHA
          </button>
        </div>
      </form>

      {submitError && <div className='alert alert-danger'>{submitError}</div>}
      {submitSuccess && (<div className='alert alert-success'>{submitSuccess}</div>)}

      {!captcha && !captchaError && <p>Loading...</p>}

      <CommentsList 
        items={comments}
        onReply={(comment) => setReplyTo(comment)}
      />

    </div>
  );
}

export default App;
