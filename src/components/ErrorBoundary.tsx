import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, HeartHandshake } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#08080c] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-4xl mb-4 animate-bounce">
            🥰
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Mahii is reconnecting...</h2>
          <p className="text-sm text-neutral-400 max-w-sm mb-6">
            Thoda connection hiccup aa gaya babu. Tap below to reload Mahii and start fresh!
          </p>
          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-sm shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Reload Mahii AI</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
