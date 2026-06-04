from uuid import uuid4
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.llm_extractor import LLMExtractor

from services.pdf_processor import (
    PDFProcessor,
    DOCUMENT_STORE
)

router = APIRouter()


def _flatten_extracted_fields(extracted_json: dict, block_lookup: dict):
    fields = []

    if isinstance(extracted_json, dict) and isinstance(
        extracted_json.get("extracted_fields"),
        list,
    ):
        for index, field in enumerate(extracted_json["extracted_fields"]):
            if not isinstance(field, dict):
                continue

            source_block_ids = field.get("source_block_ids")
            if source_block_ids is None:
                source_block_ids = [field.get("source_block_id")]

            if not isinstance(source_block_ids, list):
                source_block_ids = [source_block_ids]

            first_block_id = next((block_id for block_id in source_block_ids if block_id), None)
            source_block = block_lookup.get(first_block_id)

            fields.append({
                "field_name": field.get("field_name") or field.get("name") or f"field_{index + 1}",
                "value": field.get("value"),
                "source_block_id": first_block_id,
                "source_block_ids": source_block_ids,
                "confidence": field.get("confidence"),
                "page": source_block["page"] if source_block else None,
                "bbox": source_block["bbox"] if source_block else None,
            })

        return fields

    def walk(value, path):
        if isinstance(value, dict) and {"value", "source_block_id"}.issubset(value.keys()):
            source_block_id = value.get("source_block_id")
            source_block = block_lookup.get(source_block_id)

            fields.append({
                "field_name": path,
                "value": value.get("value"),
                "source_block_id": source_block_id,
                "confidence": value.get("confidence"),
                "page": source_block["page"] if source_block else None,
                "bbox": source_block["bbox"] if source_block else None,
            })
            return

        if isinstance(value, dict):
            for key, child in value.items():
                child_path = f"{path}.{key}" if path else key
                walk(child, child_path)

    walk(extracted_json or {}, "")
    return fields


# @router.post("/uploadfile/")
# async def upload_file(file: UploadFile = File(...)):
#     pdf_bytes = await file.read()
#
#     document_id = str(uuid4())
#
#     PDFProcessor.extract_blocks_from_bytes(
#         pdf_bytes,
#         document_id,
#     )
#
#     document = DOCUMENT_STORE.get(document_id)
#
#     return {
#         "document_id": document_id,
#         "blocks": document
#     }

@router.post("/uploadfile/")
async def upload_file(file: UploadFile = File(...)):
    pdf_bytes = await file.read()

    document_id = str(uuid4())

    document = PDFProcessor.extract_blocks_from_bytes(
        pdf_bytes,
        document_id,
        content_type=file.content_type,
        filename=file.filename,
    )

    ocr_text = document["text"]
    blocks = document["blocks"]

    block_lookup = {
        block["block_id"]: block
        for block in blocks
    }

    llm_error = None
    extracted_json = None
    grounded_fields = []

    try:
        extracted_json = LLMExtractor.extract_fields(
            ocr_text,
            blocks,
            file_bytes=pdf_bytes,
            mime_type=file.content_type,
            filename=file.filename,
            metadata={
                "document_id": document_id,
                "filename": file.filename,
                "content_type": file.content_type,
                "extraction_type": document["extraction_type"],
            },
        )
        grounded_fields = _flatten_extracted_fields(extracted_json, block_lookup)
    except Exception as exc:
        llm_error = str(exc)

    return {
        "document_id": document_id,
        "extraction_type": document["extraction_type"],
        "ocr_text": ocr_text,
        "blocks": blocks,
        "extracted_json": extracted_json,
        "extracted_fields": grounded_fields,
        "llm_error": llm_error,
    }

@router.get("/documents/{document_id}")
async def get_document(document_id: str):

    document = DOCUMENT_STORE.get(document_id)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return {
        "document_id": document_id,
        "extraction_type": document["extraction_type"],
        "ocr_text": document.get("text", ""),
        "blocks": document["blocks"],
    }
