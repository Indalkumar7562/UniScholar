import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UniScholar UI Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-slate-100">UniScholar Interface Notice</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              A temporary interface state occurred while rendering this view. Please click below to refresh and load the latest profile data.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 font-bold text-xs text-white transition-colors shadow-lg"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.href = '/dashboard';
                }}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-300 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
