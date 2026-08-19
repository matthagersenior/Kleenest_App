import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { assertRuntimeConfig } from './lib/runtime';
import ErrorBoundary from './components/ErrorBoundary';
import './styles.css';
import 'leaflet/dist/leaflet.css';
function Startup(){try{assertRuntimeConfig();return <App/>}catch(error){return <main className="page"><div className="empty-state"><h1>Kleenest is not configured</h1><p>{error.message}</p><p>Add the required production environment variables and reload the application.</p></div></main>}}
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><AuthProvider><ErrorBoundary><Startup/></ErrorBoundary></AuthProvider></BrowserRouter></React.StrictMode>);
