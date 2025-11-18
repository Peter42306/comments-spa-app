import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { fetchCaptcha } from './api';
import CommentsList from './components/CommentsList/CommentsList';

function App() {
  const [captcha, setCaptcha] = useState(null);
  const [error, setError] = useState(null);

  const loadCaptcha = async () => {
    try{
      setError(null);
      const data = await fetchCaptcha();
      setCaptcha(data);
    } catch (e) {
      setError("CAPTCHA download error.");
    }
  }

  useEffect(()=>{
    loadCaptcha();
  }, []);  

  return (
    <div className="container my-4">
      <h2>Comments SPA - Frontend</h2>

      <button className='btn btn-secondary mb-3' onClick={loadCaptcha}>
        Renew CAPTCHA
      </button>

      {error && <div className='alert alert-danger'>{error}</div>}

      {captcha && (
        <div>
          <img
            src={captcha.imageBase64}
            style={{height: 60}}
            alt='captcha'
          />
          <p className='small text-muted my-2'>
            captchaId: <code>{captcha.captchaId}</code>
          </p>
        </div>
      )}

      {!captcha && !error && <p>Loading...</p>}

      <CommentsList/>

    </div>
  );
}

export default App;
