import { useState } from "react";

import UploadPdf from "./components/UploadPdf";
import PdfViewer from "./components/PdfViewer";
import BlockList from "./components/BlockList";
import "./App.css";

function App() {
    const [blocks, setBlocks] = useState([]);
    const [documentId, setDocumentId] = useState(null);
    const [extractedJson, setExtractedJson] = useState(null);
    const [extractionInfo, setExtractionInfo] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [selectedBlock, setSelectedBlock] = useState(null);

    return (
        <div className="app-shell">
            <header className="app-header">
                <div>
                    <h1>DOCTrace AI</h1>
                    <p>Trace document evidence from PDF pages to extracted data.</p>
                </div>
                <div className="header-summary">
                    <span>{blocks.length} blocks</span>
                    <strong>{documentId ? "Processed" : "Ready"}</strong>
                </div>
            </header>

            <main className="workspace-grid">
                <aside className="panel upload-panel">
                    <UploadPdf
                        blocks={blocks}
                        documentId={documentId}
                        pdfFile={pdfFile}
                        setBlocks={setBlocks}
                        setDocumentId={setDocumentId}
                        setExtractedJson={setExtractedJson}
                        setExtractionInfo={setExtractionInfo}
                        setPdfFile={setPdfFile}
                        setSelectedBlock={setSelectedBlock}
                    />
                </aside>

                <section className="panel viewer-panel">
                    <PdfViewer
                        blocks={blocks}
                        pdfFile={pdfFile}
                        selectedBlock={selectedBlock}
                        onSelectBlock={setSelectedBlock}
                    />
                </section>

                <aside className="panel data-panel">
                    <BlockList
                        blocks={blocks}
                        extractedJson={extractedJson}
                        extractionInfo={extractionInfo}
                        selectedBlock={selectedBlock}
                        onSelectBlock={setSelectedBlock}
                    />
                </aside>
            </main>
        </div>
    );
}

export default App;
