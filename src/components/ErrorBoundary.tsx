import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary component to catch React errors and display fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
    // In production, you could send to an error tracking service like Sentry
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4 text-center">
          <div className="max-w-md space-y-6">
            <h1 className="bg-gradient-to-r from-red-400 to-pink-600 bg-clip-text font-extrabold text-6xl text-transparent">
              Oops!
            </h1>
            <h2 className="font-bold text-2xl text-white">
              Something went wrong
            </h2>
            <p className="text-gray-400">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 rounded-lg bg-red-500/10 p-4 text-left">
                <summary className="cursor-pointer font-semibold text-red-400">
                  Error Details
                </summary>
                <pre className="mt-2 overflow-auto text-red-300 text-xs">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 font-semibold text-white transition-transform hover:scale-105"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
