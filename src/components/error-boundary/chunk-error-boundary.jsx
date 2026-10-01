import PropTypes from 'prop-types';
import { Component } from 'react';


const CHUNK_ERROR_PATTERN = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i;

const RELOAD_GUARD_KEY = 'reloaded-after-chunk-error';

function isChunkLoadError(error) {
  return Boolean(error) && CHUNK_ERROR_PATTERN.test(error.message || '');
}

export class ChunkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, isChunkError: isChunkLoadError(error) };
  }

  componentDidCatch(error) {
    if (!isChunkLoadError(error)) return;

    if (!sessionStorage.getItem(RELOAD_GUARD_KEY)) {
      sessionStorage.setItem(RELOAD_GUARD_KEY, '1');
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError && !this.state.isChunkError) {
      throw this.state.error;
    }
    if (this.state.hasError) return null;

    return this.props.children;
  }
}

ChunkErrorBoundary.propTypes = {
  children: PropTypes.node,
};
