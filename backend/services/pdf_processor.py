# # import fitz
# # from fastapi import FastAPI, UploadFile, File
# #
# # app = FastAPI()
# #
# # DOCUMENT_STORE = {}
# #
# #
# # class PDFProcessor:
# #
# #     @staticmethod
# #     def extract_blocks_from_bytes(pdf_bytes: bytes, document_id=None):
# #
# #         doc = fitz.open(stream=pdf_bytes, filetype="pdf")
# #
# #         blocks_data = []
# #         counter = 1
# #
# #         for page_num, page in enumerate(doc):
# #
# #             blocks = page.get_text("blocks")
# #
# #             for block in blocks:
# #
# #                 x0, y0, x1, y1, text, _, _ = block
# #
# #                 if not text.strip():
# #                     continue
# #
# #                 blocks_data.append({
# #                     "block_id": f"b{counter}",
# #                     "page": page_num + 1,
# #                     "text": text.strip(),
# #                     "bbox": {
# #                         "x0": x0,
# #                         "y0": y0,
# #                         "x1": x1,
# #                         "y1": y1
# #                     }
# #                 })
# #
# #                 counter += 1
# #         DOCUMENT_STORE[document_id] = blocks_data
# #         doc.close()
# #         return blocks_data
#
#
# import fitz
#
# DOCUMENT_STORE = {}
#
#
# class PDFProcessor:
#
#     @staticmethod
#     def extract_blocks_from_bytes(pdf_bytes: bytes, document_id: str):
#
#         doc = fitz.open(stream=pdf_bytes, filetype="pdf")
#
#         blocks_data = []
#         counter = 1
#
#         for page_num, page in enumerate(doc):
#             for block in page.get_text("blocks"):
#
#                 x0, y0, x1, y1, text, _, _ = block
#
#                 if not text.strip():
#                     continue
#
#                 blocks_data.append({
#                     "block_id": f"b{counter}",
#                     "page": page_num + 1,
#                     "text": text.strip(),
#                     "bbox": {
#                         "x0": x0,
#                         "y0": y0,
#                         "x1": x1,
#                         "y1": y1
#                     }
#                 })
#
#                 counter += 1
#
#         doc.close()
#
#         DOCUMENT_STORE[document_id] = blocks_data
#
#         return blocks_data

import fitz
import pytesseract
from PIL import Image
import io

DOCUMENT_STORE = {}


class PDFProcessor:

    @staticmethod
    def extract_blocks_from_bytes(
        file_bytes: bytes,
        document_id: str,
        content_type: str | None = None,
        filename: str | None = None,
    ):
        if PDFProcessor.is_image_upload(content_type, filename):
            blocks = PDFProcessor.extract_image_with_ocr(file_bytes)
            extraction_type = "image_ocr"
            text = PDFProcessor.blocks_to_text(blocks)

            DOCUMENT_STORE[document_id] = {
                "extraction_type": extraction_type,
                "text": text,
                "blocks": blocks
            }

            return DOCUMENT_STORE[document_id]

        doc = fitz.open(stream=file_bytes, filetype="pdf")

        if PDFProcessor.is_digital_pdf(doc):
            blocks = PDFProcessor.extract_with_pymupdf(doc)
            extraction_type = "digital"
        else:
            blocks = PDFProcessor.extract_with_ocr(doc)
            extraction_type = "scanned"

        text = PDFProcessor.blocks_to_text(blocks)

        DOCUMENT_STORE[document_id] = {
            "extraction_type": extraction_type,
            "text": text,
            "blocks": blocks
        }

        doc.close()
        return DOCUMENT_STORE[document_id]

    @staticmethod
    def is_image_upload(content_type: str | None, filename: str | None):
        if content_type and content_type.startswith("image/"):
            return True

        if not filename:
            return False

        return filename.lower().endswith((
            ".png",
            ".jpg",
            ".jpeg",
            ".tif",
            ".tiff",
            ".bmp",
            ".webp",
        ))

    @staticmethod
    def blocks_to_text(blocks: list[dict]):
        return "\n".join(
            block["text"]
            for block in sorted(
                blocks,
                key=lambda item: (
                    item.get("page", 0),
                    item.get("bbox", {}).get("y0", 0),
                    item.get("bbox", {}).get("x0", 0),
                ),
            )
            if block.get("text")
        )

    @staticmethod
    def is_digital_pdf(doc):
        total_text = ""

        for page in doc:
            total_text += page.get_text().strip()

        return len(total_text) > 50

    @staticmethod
    def extract_with_pymupdf(doc):
        blocks_data = []
        counter = 1

        for page_num, page in enumerate(doc):
            blocks = page.get_text("blocks")

            for block in blocks:
                x0, y0, x1, y1, text, _, _ = block

                if not text.strip():
                    continue

                blocks_data.append({
                    "block_id": f"b{counter}",
                    "page": page_num + 1,
                    "text": text.strip(),
                    "bbox": {
                        "x0": x0,
                        "y0": y0,
                        "x1": x1,
                        "y1": y1
                    },
                    "source": "pymupdf"
                })

                counter += 1

        return blocks_data

    @staticmethod
    def extract_with_ocr(doc):
        blocks_data = []
        counter = 1

        for page_num, page in enumerate(doc):
            pix = page.get_pixmap(dpi=200)
            img = Image.open(io.BytesIO(pix.tobytes("png")))

            ocr_data = pytesseract.image_to_data(
                img,
                output_type=pytesseract.Output.DICT
            )

            page_width = page.rect.width
            page_height = page.rect.height

            img_width, img_height = img.size

            scale_x = page_width / img_width
            scale_y = page_height / img_height

            for i, text in enumerate(ocr_data["text"]):
                text = text.strip()

                if not text:
                    continue

                x = ocr_data["left"][i]
                y = ocr_data["top"][i]
                w = ocr_data["width"][i]
                h = ocr_data["height"][i]

                blocks_data.append({
                    "block_id": f"b{counter}",
                    "page": page_num + 1,
                    "text": text,
                    "bbox": {
                        "x0": x * scale_x,
                        "y0": y * scale_y,
                        "x1": (x + w) * scale_x,
                        "y1": (y + h) * scale_y
                    },
                    "source": "ocr"
                })

                counter += 1

        return blocks_data

    @staticmethod
    def extract_image_with_ocr(image_bytes: bytes):
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        ocr_data = pytesseract.image_to_data(
            image,
            output_type=pytesseract.Output.DICT
        )

        blocks_data = []
        counter = 1

        for i, text in enumerate(ocr_data["text"]):
            text = text.strip()

            if not text:
                continue

            x = ocr_data["left"][i]
            y = ocr_data["top"][i]
            w = ocr_data["width"][i]
            h = ocr_data["height"][i]

            blocks_data.append({
                "block_id": f"b{counter}",
                "page": 1,
                "text": text,
                "bbox": {
                    "x0": x,
                    "y0": y,
                    "x1": x + w,
                    "y1": y + h
                },
                "source": "ocr"
            })

            counter += 1

        return blocks_data
