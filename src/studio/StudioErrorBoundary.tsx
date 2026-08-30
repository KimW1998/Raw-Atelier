import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class StudioErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Studio crash", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-8 font-body text-sm text-red-800">
          <p className="font-heading text-2xl">Studio kon niet openen</p>
          <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-red-50 p-4">
            {this.state.error.message}
            {"\n"}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
