import React, { useState, useEffect, useCallback } from 'react';
import { CgDebug, CgArrowsExpandDownRight, CgMaximize } from 'react-icons/cg';
import { RiImageEditFill } from 'react-icons/ri';

import AnnotatablePage from './AnnotatablePage';

const Range = maxValue => 
  Array.from(Array(maxValue).keys());

const EndlessViewer = props => {

  const [ debug, setDebug ] = useState(false);

  const [ annotationMode, setAnnotationMode ] = useState('ANNOTATION');

  const [ zoom, setZoom ] = useState(props.initialZoom || 1);

  const [ isFullscreen, setIsFullscreen ] = useState(false);

  const [ isLoading, setIsLoading ] = useState(false);

  const [ error, setError ] = useState(null);

  // Add keyboard shortcuts
  const handleKeyPress = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const onToggleRelationsMode = () => {
    if (annotationMode === 'RELATIONS')
      setAnnotationMode('ANNOTATION');
    else
      setAnnotationMode('RELATIONS'); 
  }

  const onToggleImageMode = () => {
    if (annotationMode === 'IMAGE')
      setAnnotationMode('ANNOTATION');
    else
      setAnnotationMode('IMAGE');
  }

  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, props.maxZoom || 3));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, props.minZoom || 0.5));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const fitToWidth = () => {
    const container = document.querySelector('.pdf-viewer-container');
    const viewerWidth = container.parentElement.clientWidth;
    const pageWidth = container.firstChild.clientWidth;
    const newZoom = viewerWidth / pageWidth;
    setZoom(Math.min(newZoom, props.maxZoom));
  };

  return (
    <div className="endless-viewer" style={props.containerStyle}>
      <header className="pdf-viewer-header" style={props.headerStyle}>
        <div className="toolbar-group left">
          <button 
            onClick={() => setDebug(!debug)}
            title="Toggle Debug Mode">
            <span className="inner">
              <CgDebug />
            </span>
          </button>

          <button 
            className={annotationMode === 'RELATIONS' ? 'active' : null} 
            onClick={onToggleRelationsMode}
            title="Toggle Relations Mode">
            <span className="inner">
              <CgArrowsExpandDownRight />
            </span>
          </button>

          <button
            className={annotationMode === 'IMAGE' ? 'active' : null} 
            onClick={onToggleImageMode}
            title="Toggle Image Mode">
            <span className="inner">
              <RiImageEditFill />
            </span>
          </button>

          <button 
            onClick={toggleFullscreen}
            title="Toggle Fullscreen">
            <span className="inner">
              <CgMaximize />
            </span>
          </button>

          <div className="zoom-controls">
            <button onClick={handleZoomOut} title="Zoom Out (Ctrl -)">-</button>
            <button onClick={fitToWidth} title="Fit to Width">Fit</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} title="Zoom In (Ctrl +)">+</button>
          </div>
        </div>
      </header>

      <main style={props.mainStyle}>
        {error && <div className="error-message">{error}</div>}
        {isLoading && <div className="loading-spinner">Loading...</div>}
        {!error && (
          <div 
            className="pdf-viewer-container"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          >
            {Range(props.pdf.numPages).map(idx =>
              <AnnotatablePage 
                {...props}
                key={idx}
                page={idx + 1} 
                debug={debug}
                annotationMode={annotationMode}
                zoom={zoom} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

EndlessViewer.defaultProps = {
  initialZoom: 1,
  minZoom: 0.5,
  maxZoom: 3,
  containerStyle: {},
  headerStyle: {},
  mainStyle: {}
};

export default EndlessViewer;