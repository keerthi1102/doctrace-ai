<div align="center">

<img src="https://img.shields.io/badge/DocTrace-AI-0f172a?style=for-the-badge&logo=files&logoColor=38bdf8" height="40"/>

# 🔍 DocTrace AI

### *Every answer. Traced back to its source.*

**Intelligent PDF processing platform with AI-powered extraction and real-time source attribution.**

<br/>

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![PyMuPDF](https://img.shields.io/badge/PyMuPDF-Extraction-E94D2F?style=flat-square)](https://pymupdf.readthedocs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

<br/>

> **DocTrace AI** doesn't just extract data from documents —  
> it tells you *exactly where* that data came from, with pixel-perfect evidence.

<br/>

---

</div>

<br/>

## 🧩 The Problem It Solves

Traditional AI document extraction tools give you **answers without proof**.

```
📄 Document  →  🤖 AI Model  →  📊 Extracted Value
                                       ❌ No source
                                       ❌ Can't verify
                                       ❌ Hallucination risk
```

**DocTrace AI changes that entirely:**

```
📄 Document  →  🔍 Layout Extraction  →  🧱 Text Blocks + Coordinates
                                                      ↓
                                          🤖 Gemini Grounded Extraction
                                                      ↓
                                          📌 Value  +  Source Block ID
                                                      ↓
                                          🖥️ Interactive PDF Highlight
                                          ✅ Verified. Transparent. Trusted.
```

> Every field is linked to a **page**, a **block**, and a **bounding box** inside the original document.

<br/>

---

## 🌟 Key Features at a Glance

| Feature | Description |
|--------|-------------|
| 📄 **Smart PDF Detection** | Automatically detects Digital vs Scanned PDFs |
| 🔍 **OCR + Text Extraction** | PyMuPDF for digital, Tesseract for scanned |
| 🤖 **Grounded AI Extraction** | Gemini-powered, hallucination-resistant extraction |
| 📌 **Click-to-Highlight** | Click any extracted field → highlights the source in PDF |
| 🎯 **Bounding Box Mapping** | Exact pixel coordinates for every extracted value |
| 📜 **Source Attribution** | Page number, block ID, and coordinates for every field |
| 🔄 **Auto Scroll Sync** | PDF viewer auto-scrolls to the evidence location |
| 💡 **Explainable AI** | Full transparency into *why* a value was extracted |

<br/>

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER UPLOADS PDF                      │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │       PDF Type Detector        │
              └──────────────┬────────────────┘
                             │
              ┌──────────────┴─────────────────┐
              ▼                                 ▼
 ┌────────────────────┐           ┌──────────────────────┐
 │   Digital PDF      │           │     Scanned PDF       │
 │   Processing       │           │     OCR Processing    │
 │  (PyMuPDF)         │           │  (Tesseract / OCR)   │
 └────────┬───────────┘           └──────────┬───────────┘
          │                                   │
          └──────────────┬────────────────────┘
                         ▼
         ┌───────────────────────────────────────┐
         │     Text Blocks  +  Bounding Boxes     │
         │         Page Metadata & Layout         │
         └───────────────────┬───────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │        Gemini Extraction Engine        │
         │    (Grounded · Structured · Cited)     │
         └───────────────────┬───────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │      Structured JSON + Block Refs      │
         │   { value, page, block_id, bbox }      │
         └───────────────────┬───────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │       Interactive PDF Viewer           │
         │   Highlight · Scroll · Zoom · Verify   │
         └───────────────────────────────────────┘
```

<br/>

---

## 🔄 End-to-End Workflow

```
   1. 📤  Upload PDF
          │
   2. 🔎  PDF Classification  (Digital or Scanned?)
          │
   3-a. 📑  Digital → PyMuPDF Extraction
   3-b. 🖨️  Scanned → OCR Extraction
          │
   4. 🧱  Generate Text Blocks + Bounding Boxes
          │
   5. 🤖  Gemini Grounded Extraction
          │
   6. 📊  Structured JSON Output
          │
   7. 🗺️  Source Attribution Mapping
          │
   8. 🖥️  Interactive PDF Highlighting + Scroll Sync
```

<br/>

---

## 📦 Example Output

When DocTrace AI extracts a field, it doesn't just give you the value — it gives you **proof**:

```json
{
  "field_name": "invoice_number",
  "value": "INV-1234",
  "confidence": 0.98,
  "source_block_id": "b17",
  "page": 2,
  "bbox": {
    "x0": 120,
    "y0": 220,
    "x1": 350,
    "y1": 250
  }
}
```

> 💡 `bbox` coordinates let the frontend **draw a highlight box** directly on the PDF at that exact location.

<br/>

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| 🌐 API | **FastAPI** | REST endpoints |
| 📄 Digital PDF | **PyMuPDF** | Text + coordinate extraction |
| 🖨️ Scanned PDF | **Tesseract / OCR Engine** | Optical character recognition |
| 🤖 AI | **Google Gemini API** | Grounded structured extraction |
| 🐍 Language | **Python 3.10+** | Core runtime |

### Frontend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| ⚛️ Framework | **React 18** | Component-based UI |
| 📄 PDF Viewer | **React-PDF + PDF.js** | In-browser PDF rendering |
| 🌐 HTTP | **Axios** | API communication |
| 🖊️ Highlighting | **Canvas / PDF.js Overlay** | Bounding box visualization |

<br/>

---

## ✅ Current Capabilities

- [x] Digital PDF text extraction
- [x] Scanned PDF OCR extraction
- [x] Bounding box coordinate mapping
- [x] Interactive in-browser PDF viewer
- [x] Click-to-highlight source evidence
- [x] Auto scroll to source location
- [x] Grounded AI extraction via Gemini
- [x] Full source attribution (page + block + bbox)

<br/>

---

## 🚀 Roadmap

| Feature | Status |
|---------|--------|
| Bidirectional PDF ↔ Field Sync | 🔜 Planned |
| Multi-field simultaneous highlighting | 🔜 Planned |
| Confidence score visualization | 🔜 Planned |
| Human-in-the-loop correction | 🔜 Planned |
| Table structure extraction | 🔜 Planned |
| Document classification | 🔜 Planned |
| Rule-based validation engine | 🔜 Planned |
| Annotation layer | 🔜 Planned |
| Document comparison view | 🔜 Planned |
| Version tracking | 🔜 Planned |

<br/>

---

## 💼 Use Cases

> DocTrace AI is built for any domain where **data accuracy and traceability** are non-negotiable.

- 🧾 **Invoice Processing** — Extract invoice numbers, line items, totals with source proof
- 📦 **Procurement Documents** — Validate PO fields against source pages
- 👤 **HR Documents** — Parse contracts, payslips, and onboarding forms
- ✈️ **Aircraft Technical Logs (ATL/AL)** — Mission-critical traceability for aviation
- 🔧 **Maintenance Records** — Trace repair entries back to scanned log pages
- 📋 **Compliance & Regulatory Audits** — Full evidence chain for every extracted value
- 🏢 **Enterprise IDP** — Scalable Intelligent Document Processing with explainability

<br/>

---

## 🧠 Why "Grounded" Extraction Matters

Most AI systems extract a value and you just have to **trust it**.

DocTrace AI forces the AI to extract values **only from blocks it can see** — not from hallucinated or inferred knowledge. Every answer is anchored to a real chunk of text in the document, with coordinates you can verify with your own eyes.

This is what **Explainable AI** looks like in practice.

<br/>

---

## 📜 License

This project is licensed under the **MIT License** — free to use, modify, and distribute.  
See [`LICENSE`](LICENSE) for full details.

<br/>

---

<div align="center">

**Built with precision. Powered by AI. Grounded in evidence.**

*DocTrace AI — Because extracted data should always come with proof.*

<br/>

⭐ *If this project helped you or inspired you, consider giving it a star!*

</div>
