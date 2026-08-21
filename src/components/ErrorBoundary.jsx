import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('Kleenest UI error', error, info);
  }

  handleRetry = () => this.setState({ error: null });

  handleReload = () => {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    window.location.assign(`${window.location.origin}${base}/`);
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="page">
        <div className="empty-state">
          <h1>Something went wrong</h1>
          <p>That part of Kleenest could not load correctly. Your session and data are safe.</p>
          <div className="hero-actions">
            <button className="primary" type="button" onClick={this.handleRetry}>Try again</button>
            <button className="secondary" type="button" onClick={this.handleReload}>Reload Kleenest</button>
          </div>
        </div>
      </main>
    );
  }
}
