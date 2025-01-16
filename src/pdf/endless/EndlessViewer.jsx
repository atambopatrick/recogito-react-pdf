import React, { useState } from 'react';
import { CgDebug, CgArrowsExpandDownRight } from 'react-icons/cg';
import { RiImageEditFill } from 'react-icons/ri';

import AnnotatablePage from './AnnotatablePage';

const Range = maxValue => 
  Array.from(Array(maxValue).keys());

const EndlessViewer = props => {

  const [ debug, setDebug ] = useState(false);

  const [ annotationMode, setAnnotationMode ] = useState('ANNOTATION');

  const [ zoom, setZoom ] = useState(props.initialZoom || 1);

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

  return (
    <div className="endless-viewer" style={props.containerStyle}>
      <header className="pdf-viewer-header" style={props.headerStyle}>
        <div className="toolbar-group left">
          <button onClick={() => setDebug(!debug)}>
            <span className="inner">
              <CgDebug />
            </span>
          </button>

          <button 
            className={annotationMode === 'RELATIONS' ? 'active' : null} 
            onClick={onToggleRelationsMode}>
            <span className="inner">
              <CgArrowsExpandDownRight />
            </span>
          </button>

          <button
            className={annotationMode === 'IMAGE' ? 'active' : null} 
            onClick={onToggleImageMode}>
            <span className="inner">
              <RiImageEditFill />
            </span>
          </button>
        </div>

        <div className="toolbar-group right">
          <div className="zoom-controls">
            <button onClick={handleZoomOut}>-</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn}>+</button>
          </div>
        </div>
      </header>

      <main style={props.mainStyle}>
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