import { useEffect, useMemo, useRef } from "react";

const isPlainObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

const formatJsonValue = (value) => {
    if (value === null) return "null";
    if (value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);

    return JSON.stringify(value);
};

function JsonFormRows({ data, path = "result", level = 0 }) {
    if (Array.isArray(data)) {
        if (data.length === 0) {
            return (
                <div className="json-field-row" style={{ "--json-level": level }}>
                    <span className="json-field-name">{path}</span>
                    <span className="json-field-value">[]</span>
                </div>
            );
        }

        return data.map((item, index) => {
            const itemPath = `${path}[${index}]`;

            if (isPlainObject(item) || Array.isArray(item)) {
                return (
                    <div className="json-field-group" key={itemPath}>
                        <div className="json-field-group-title" style={{ "--json-level": level }}>
                            {itemPath}
                        </div>
                        <JsonFormRows data={item} path={itemPath} level={level + 1} />
                    </div>
                );
            }

            return (
                <div className="json-field-row" key={itemPath} style={{ "--json-level": level }}>
                    <span className="json-field-name">{itemPath}</span>
                    <span className="json-field-value">{formatJsonValue(item)}</span>
                </div>
            );
        });
    }

    if (isPlainObject(data)) {
        const entries = Object.entries(data);

        if (entries.length === 0) {
            return (
                <div className="json-field-row" style={{ "--json-level": level }}>
                    <span className="json-field-name">{path}</span>
                    <span className="json-field-value">{"{}"}</span>
                </div>
            );
        }

        return entries.map(([key, value]) => {
            const fieldPath = path === "result" ? key : `${path}.${key}`;

            if (isPlainObject(value) || Array.isArray(value)) {
                return (
                    <div className="json-field-group" key={fieldPath}>
                        <div className="json-field-group-title" style={{ "--json-level": level }}>
                            {fieldPath}
                        </div>
                        <JsonFormRows data={value} path={fieldPath} level={level + 1} />
                    </div>
                );
            }

            return (
                <div className="json-field-row" key={fieldPath} style={{ "--json-level": level }}>
                    <span className="json-field-name">{fieldPath}</span>
                    <span className="json-field-value">{formatJsonValue(value)}</span>
                </div>
            );
        });
    }

    return (
        <div className="json-field-row" style={{ "--json-level": level }}>
            <span className="json-field-name">{path}</span>
            <span className="json-field-value">{formatJsonValue(data)}</span>
        </div>
    );
}

function BlockList({
    blocks = [],
    extractedJson,
    extractionInfo,
    selectedBlock,
    onSelectBlock,
}) {
    const rowRefs = useRef({});
    const blockRows = Array.isArray(blocks) ? blocks : [];
    const currentBlock = selectedBlock || blockRows[0];
    const sourceLabel = extractionInfo?.source || currentBlock?.source || "-";
    const typeLabel = extractionInfo?.extractionType || "-";
    const parsedExtractedJson = useMemo(() => {
        if (typeof extractedJson !== "string") return extractedJson;

        try {
            return JSON.parse(extractedJson);
        } catch {
            return extractedJson;
        }
    }, [extractedJson]);

    useEffect(() => {
        if (!selectedBlock?.block_id) return;

        rowRefs.current[selectedBlock.block_id]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }, [selectedBlock]);

    return (
        <div className="data-stack">
            <div className="panel-heading">
                <div>
                    <p className="panel-kicker">Extracted Data</p>
                    <h2>Table View</h2>
                </div>
                <div className="table-meta">
                    <span className="source-pill">Source: {sourceLabel}</span>
                    <span className="source-pill">Type: {typeLabel}</span>
                    <span className="count-pill">{blockRows.length}</span>
                </div>
            </div>

            <div className="table-frame">
                <table className="blocks-table">
                    <thead>
                        <tr>
                            <th>Block</th>
                            <th>Page</th>
                            <th>Text</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blockRows.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="empty-cell">
                                    No extracted data yet.
                                </td>
                            </tr>
                        ) : (
                            blockRows.map((block) => {
                                const isSelected = selectedBlock?.block_id === block.block_id;

                                return (
                                    <tr
                                        key={block.block_id}
                                        className={isSelected ? "is-selected" : ""}
                                        onClick={() => onSelectBlock(block)}
                                        ref={(el) => {
                                            rowRefs.current[block.block_id] = el;
                                        }}
                                    >
                                        <td>{block.block_id}</td>
                                        <td>{block.page}</td>
                                        <td>{block.text}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="form-view">
                <div className="panel-heading compact">
                    <div>
                        <p className="panel-kicker">Form View</p>
                        <h2>Selected Block</h2>
                    </div>
                </div>

                <label>
                    Block ID
                    <input value={currentBlock?.block_id || ""} readOnly />
                </label>
                <label>
                    Page
                    <input value={currentBlock?.page || ""} readOnly />
                </label>
                <label>
                    Text
                    <textarea value={currentBlock?.text || ""} readOnly rows="7" />
                </label>
            </div>

            <div className="form-view json-view">
                <div className="panel-heading compact">
                    <div>
                        <p className="panel-kicker">LLM Extraction</p>
                        <h2>Structured JSON</h2>
                    </div>
                </div>

                {extractionInfo?.llmError ? (
                    <p className="status-error">{extractionInfo.llmError}</p>
                ) : parsedExtractedJson ? (
                    <div className="json-form-fields">
                        <JsonFormRows data={parsedExtractedJson} />
                    </div>
                ) : (
                    <p className="json-empty-state">No LLM extraction yet.</p>
                )}
            </div>
        </div>
    );
}

export default BlockList;
