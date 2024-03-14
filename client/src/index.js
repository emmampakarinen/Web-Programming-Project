import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from 'react-router-dom'


// I had to wrap app inside browseRouter because I was getting an error related to useNavigate in App.js. Wrapping App inside the BrowseRouter in this file prevents the error since the useNavigate hook is now inside Router context. Reference: https://bobbyhadz.com/blog/react-usenavigate-may-be-used-only-in-context-of-router 
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </BrowserRouter>
  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
