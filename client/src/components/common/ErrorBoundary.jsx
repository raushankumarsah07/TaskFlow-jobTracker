import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center"
             style={{ minHeight: '60vh', textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💥</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            className="btn btn-gradient px-4"
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
