"use client"

import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center gap-4 p-8">
            <p className="text-sm text-muted-foreground">Something went wrong</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </Button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
