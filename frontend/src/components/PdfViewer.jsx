import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const PDF_WIDTH = 700;

function PdfViewer({ blocks = [], pdfFile, selectedBlock, onSelectBlock }) {
    const pageRefs = useRef({});
    const [numPages, setNumPages] = useState(null);
    const [pageSizes, setPageSizes] = useState({});
    const [zoom, setZoom] = useState(1);
    const blockRows = Array.isArray(blocks) ? blocks : [];
    const isImage = pdfFile?.type?.startsWith("image/");

    const fileUrl = useMemo(() => {
        if (!pdfFile) return null;
        return URL.createObjectURL(pdfFile);
    }, [pdfFile]);

    const renderWidth = Math.round(PDF_WIDTH * zoom);

    useEffect(() => {
        return () => {
            if (fileUrl) URL.revokeObjectURL(fileUrl);
        };
    }, [fileUrl]);

    useEffect(() => {
        if (!selectedBlock?.page) return;

        pageRefs.current[selectedBlock.page]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }, [selectedBlock]);

    if (!fileUrl) {
        return (
            <div className="pdf-empty-state">
                <span>OCR</span>
                <strong>No file selected</strong>
                <p>Choose a file from the left panel to preview it here.</p>
            </div>
        );
    }

    const renderHighlight = (pageNumber) => {
        if (!selectedBlock || selectedBlock.page !== pageNumber) return null;

        const pageSize = pageSizes[pageNumber];
        if (!pageSize) return null;

        const scale = renderWidth / pageSize.width;
        const bbox = selectedBlock.bbox;

        return (
            <div
                className="pdf-highlight"
                style={{
                    left: bbox.x0 * scale,
                    top: bbox.y0 * scale,
                    width: (bbox.x1 - bbox.x0) * scale,
                    height: (bbox.y1 - bbox.y0) * scale,
                }}
            />
        );
    };

    const handlePageClick = (event, pageNumber) => {
        const pageSize = pageSizes[pageNumber];
        if (!pageSize || !onSelectBlock) return;

        const pageElement = pageRefs.current[pageNumber];
        if (!pageElement) return;

        const rect = pageElement.getBoundingClientRect();
        const scale = renderWidth / pageSize.width;
        const clickX = (event.clientX - rect.left) / scale;
        const clickY = (event.clientY - rect.top) / scale;

        const matchingBlocks = blockRows.filter((block) => {
            if (block.page !== pageNumber || !block.bbox) return false;

            const { x0, y0, x1, y1 } = block.bbox;
            return clickX >= x0 && clickX <= x1 && clickY >= y0 && clickY <= y1;
        });

        if (matchingBlocks.length === 0) return;

        const smallestMatchingBlock = matchingBlocks.reduce((smallest, block) => {
            const smallestArea =
                (smallest.bbox.x1 - smallest.bbox.x0) * (smallest.bbox.y1 - smallest.bbox.y0);
            const blockArea = (block.bbox.x1 - block.bbox.x0) * (block.bbox.y1 - block.bbox.y0);

            return blockArea < smallestArea ? block : smallest;
        });

        onSelectBlock(smallestMatchingBlock);
    };

    return (
        <div className="pdf-viewer">
            <div className="pdf-toolbar">
                <div>
                    <p className="panel-kicker">{isImage ? "Image Viewer" : "PDF Viewer"}</p>
                    <h2>{pdfFile.name}</h2>
                </div>
                <div className="zoom-controls" aria-label="Preview resize controls">
                    <button
                        type="button"
                        onClick={() => setZoom((value) => Math.max(0.7, value - 0.1))}
                    >
                        -
                    </button>
                    <input
                        type="range"
                        min="0.7"
                        max="1.4"
                        step="0.05"
                        value={zoom}
                        onChange={(event) => setZoom(Number(event.target.value))}
                        aria-label="Resize preview"
                    />
                    <button
                        type="button"
                        onClick={() => setZoom((value) => Math.min(1.4, value + 0.1))}
                    >
                        +
                    </button>
                    <button type="button" onClick={() => setZoom(1)}>
                        {Math.round(zoom * 100)}%
                    </button>
                </div>
            </div>

            <div className="pdf-scroll-area" onWheel={(event) => event.stopPropagation()}>
                {isImage ? (
                    <div
                        className="pdf-page-wrap image-page-wrap"
                        onClick={(event) => handlePageClick(event, 1)}
                        ref={(el) => {
                            pageRefs.current[1] = el;
                        }}
                        style={{ width: renderWidth }}
                    >
                        <img
                            src={fileUrl}
                            alt={pdfFile.name}
                            width={renderWidth}
                            onLoad={(event) => {
                                setNumPages(1);
                                setPageSizes({
                                    1: {
                                        width: event.currentTarget.naturalWidth,
                                        height: event.currentTarget.naturalHeight,
                                    },
                                });
                            }}
                        />
                        <span className="page-badge">Page 1</span>
                        {renderHighlight(1)}
                    </div>
                ) : (
                    <Document
                        file={fileUrl}
                        onLoadSuccess={({ numPages }) => {
                            setNumPages(numPages);
                            setPageSizes({});
                        }}
                        loading={<div className="pdf-message">Loading PDF...</div>}
                        error={<div className="pdf-message">Unable to load PDF.</div>}
                    >
                        {Array.from(new Array(numPages || 1), (_, index) => {
                            const pageNumber = index + 1;

                            return (
                                <div
                                    key={pageNumber}
                                    className="pdf-page-wrap"
                                    onClick={(event) => handlePageClick(event, pageNumber)}
                                    ref={(el) => {
                                        pageRefs.current[pageNumber] = el;
                                    }}
                                    style={{ width: renderWidth }}
                                >
                                    <Page
                                        pageNumber={pageNumber}
                                        width={renderWidth}
                                        onLoadSuccess={(page) => {
                                            setPageSizes((prev) => ({
                                                ...prev,
                                                [pageNumber]: {
                                                    width: page.originalWidth,
                                                    height: page.originalHeight,
                                                },
                                            }));
                                        }}
                                    />

                                    <span className="page-badge">Page {pageNumber}</span>
                                    {renderHighlight(pageNumber)}
                                </div>
                            );
                        })}
                    </Document>
                )}
            </div>
        </div>
    );
}

export default PdfViewer;
