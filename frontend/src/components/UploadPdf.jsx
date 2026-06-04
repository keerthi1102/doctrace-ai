import { useState } from "react";
import api from "../services/api";

function formatFileSize(size) {
    if (!size) return "0 KB";
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function getBlocksFromResponse(data) {
    if (Array.isArray(data?.blocks)) return data.blocks;
    if (Array.isArray(data?.blocks?.blocks)) return data.blocks.blocks;
    return [];
}

function getExtractionInfoFromResponse(data) {
    const blocks = getBlocksFromResponse(data);
    const sources = [...new Set(blocks.map((block) => block.source).filter(Boolean))];

    return {
        extractionType: data?.extraction_type || data?.blocks?.extraction_type || "unknown",
        source: sources.length > 0 ? sources.join(", ") : "unknown",
        llmError: data?.llm_error || "",
    };
}

function UploadPdf({
    blocks = [],
    documentId,
    pdfFile,
    setBlocks,
    setDocumentId,
    setExtractedJson,
    setExtractionInfo,
    setPdfFile,
    setSelectedBlock,
}) {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleUpload = async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        setErrorMessage("");
        setPdfFile(file);
        setDocumentId(null);
        setExtractedJson(null);
        setExtractionInfo(null);
        setBlocks([]);
        setSelectedBlock(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);

            const response = await api.post(
                "/uploadfile/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setDocumentId(response.data.document_id);
            setExtractedJson(response.data.extracted_json);
            setExtractionInfo(getExtractionInfoFromResponse(response.data));
            setBlocks(getBlocksFromResponse(response.data));

        } catch (error) {
            console.error(error);
            setErrorMessage("Upload failed. Check the backend and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-stack">
            <div>
                <p className="panel-kicker">Source PDF</p>
                <h2>Choose File</h2>
            </div>

            <label className={`upload-dropzone ${loading ? "is-loading" : ""}`}>
                <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleUpload}
                    disabled={loading}
                />
                <span className="upload-icon">OCR</span>
                <strong>{pdfFile ? "Replace File" : "Select File"}</strong>
                <small>Upload a PDF or image to extract blocks and preview evidence.</small>
            </label>

            {loading && (
                <div className="upload-progress">
                    <span />
                    <p>Uploading and parsing...</p>
                </div>
            )}

            {errorMessage && <p className="status-error">{errorMessage}</p>}

            <div className="details-card">
                <h3>File Details</h3>
                <dl>
                    <div>
                        <dt>Name</dt>
                        <dd>{pdfFile?.name || "No file selected"}</dd>
                    </div>
                    <div>
                        <dt>Size</dt>
                        <dd>{pdfFile ? formatFileSize(pdfFile.size) : "-"}</dd>
                    </div>
                    <div>
                        <dt>Type</dt>
                        <dd>{pdfFile?.type || "application/pdf"}</dd>
                    </div>
                    <div>
                        <dt>Document ID</dt>
                        <dd>{documentId || "-"}</dd>
                    </div>
                    <div>
                        <dt>Blocks</dt>
                        <dd>{blocks.length}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}

export default UploadPdf;
