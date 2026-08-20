import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './AppRuntime.jsx';
import FeatureIntegration from './components/FeatureIntegration';
import { AuthProvider } from './context/AuthContext';
import { assertRuntimeConfig } from './lib/runtime';
import ErrorBoundary from './components/ErrorBoundary';
import './styles.css';
import 'leaflet/dist/leaflet.css';

const githubPagesBasename = '/Kleenest_App';

function Startup(){
  try{
    assertRuntimeConfig();
    return <><App/><FeatureIntegration/></>;
  }catch(error){
    return <main className="page"><div className="empty-state" role="alert"><h1>Kleenest is not configured</h1><p>{error.message}</p><p>Add the required production environment variables and reload the application.</p></div></main>;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={githubPagesBasename}>
        <AuthProvider>
          <Startup/>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
