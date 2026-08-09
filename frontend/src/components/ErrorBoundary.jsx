import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('应用错误:', error, errorInfo)
  }

  handleReset = () => {
    // 清除可能损坏的数据
    try { localStorage.removeItem('lingjing_data') } catch (e) {}
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f0f7ff' }}>
          <div className="card max-w-sm w-full text-center py-10">
            <div className="text-6xl mb-4">🔧</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">出了点小问题</h2>
            <p className="text-sm text-gray-500 mb-6">
              可能是本地数据格式异常导致的，点击下方按钮清除数据后重新加载。
            </p>
            <button onClick={this.handleReset} className="btn-primary">
              清除数据并刷新
            </button>
            <p className="text-xs text-gray-300 mt-4">
              此操作会清除所有本地灵感数据
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
