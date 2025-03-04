import React, { useEffect, useState } from 'react';
import { CgDebug, CgChevronLeft, CgChevronRight, CgArrowsExpandDownRight, CgMaximize } from 'react-icons/cg';
import { RiImageEditFill } from 'react-icons/ri';

import AnnotatablePage from './AnnotatablePage';
import { extendTarget } from '../PDFAnnotation';

const PaginatedViewer = props => {

  const [ page, setPage ] = useState();

  const [ debug, setDebug ] = useState(false);

  const [ annotationMode, setAnnotationMode ] = useState('ANNOTATION');

  const [ zoom, setZoom ] = useState(props.initialZoom || 1);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Render first page on mount
  useEffect(() => {
    setIsLoading(true);
    props.pdf.getPage(1)
      .then(setPage)
      .catch(err => setError('Failed to load PDF page'))
      .finally(() => setIsLoading(false));
  }, []);

  const onPreviousPage = () => {
    const { pageNumber } = page;
    const prevNum = Math.max(0, pageNumber - 1);
    if (prevNum !== pageNumber)
      props.pdf.getPage(prevNum).then(page => setPage(page));
  }

  const onNextPage = () => {
    const { numPages } = props.pdf;
    const { pageNumber } = page;
    const nextNum = Math.min(pageNumber + 1, numPages);
    if (nextNum !== pageNumber)
      props.pdf.getPage(nextNum).then(page => setPage(page));
  }

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

  const onCreateAnnotation = a => {
    const extended = extendTarget(a, props.url, page.pageNumber);
    props.onCreateAnnotation && props.onCreateAnnotation(extended);
  }

  const onUpdateAnnotation = (a, p) => {
    const updated = extendTarget(a, props.url, page.pageNumber);
    const previous = extendTarget(p, props.url, page.pageNumber);
    props.onUpdateAnnotation && props.onUpdateAnnotation(updated, previous);
  }
    
  const onDeleteAnnotation = a => {
    const extended = extendTarget(a, props.url, page.pageNumber);
    props.onDeleteAnnotation && props.onDeleteAnnotation(extended);
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

  return (
    <div className="paginated-viewer" style={props.containerStyle}>
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
            onClick={onPreviousPage}
            title="Previous Page (←)">
            <span className="inner">
              <CgChevronLeft />
            </span>
          </button>

          <label>{page?.pageNumber} / {props.pdf.numPages}</label>
          
          <button onClick={onNextPage}>
            <span className="inner">
              <CgChevronRight />
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

          <button 
            onClick={toggleFullscreen}
            title="Toggle Fullscreen">
            <span className="inner">
              <CgMaximize />
            </span>
          </button>

          <div className="zoom-controls">
            <button onClick={handleZoomOut}>-</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn}>+</button>
          </div>
        </div>
      </header>

      <main style={props.mainStyle}>
        {error && <div className="error-message">{error}</div>}
        {isLoading && <div className="loading-spinner">Loading...</div>}
        {!error && !isLoading && (
          <div className="pdf-viewer-container"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
            <AnnotatablePage 
              page={page} 
              annotations={page ? props.store.getAnnotations(page.pageNumber) : []}
              config={props.config}
              debug={debug} 
              annotationMode={annotationMode}
              zoom={zoom}
              onCreateAnnotation={onCreateAnnotation}
              onUpdateAnnotation={onUpdateAnnotation}
              onDeleteAnnotation={onDeleteAnnotation} 
              onCancelSelected={props.onCancelSelected} />
          </div>
        )}
      </main>
    </div>
  )
}

PaginatedViewer.defaultProps = {
  initialZoom: 1,
  minZoom: 0.5,
  maxZoom: 3,
  containerStyle: {},
  headerStyle: {},
  mainStyle: {}
};

export default PaginatedViewer;