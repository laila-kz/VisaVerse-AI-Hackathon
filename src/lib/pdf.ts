// Handles reading and writing PDF content using pdf-lib.

// Functions like:

// preparePdf(file) → loads original PDF bytes.

// fillPdfWithFields(originalPdfBytes, fields) → returns new PDF bytes.

// Optionally, flattenPdf or helpers for drawing text if there are no form fields.

// Abstract away all pdf-lib usage so components just pass data in and get a finished PDF out.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PdfField, PdfResult } from "../types/index";

interface PreparePdfResult {
    bytes: Uint8Array;
    pageCount: number;
}

async function preparePdf(file: File): Promise<PdfResult> {
    try {
        if (!file.type.includes("pdf")) {
            return {
                ok: false,
                error: {
                    type: "INVALID_FILE",
                    message: "File is not a PDF",
                },
            };
        }
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        const pdfDoc = await PDFDocument.load(bytes);
        const pageCount = pdfDoc.getPageCount();
        return { ok: true, bytes, pageCount };
    } catch (e: any) {
        return {
            ok: false,
            error: {
                type: "PDF_LOAD_ERROR",
                message: "Failed to load PDF.",
                details: e.message,
            },
        };
    }
}

async function loadPdf(bytes: Uint8Array): Promise<PDFDocument> {
    return await PDFDocument.load(bytes);
}

export async function fillPdfWithFields(originalPdfBytes: Uint8Array, fields: PdfField[]): Promise<PdfResult> {
    try {
        const pdfDoc = await loadPdf(originalPdfBytes);
        let form: any = null;
        try {
            form = pdfDoc.getForm();
        } catch {
            form = null;
        }

        if (form) {
            for (const f of fields) {
                if (!f.pdfFieldName) continue;
                try {
                    const field = form.getTextField(f.pdfFieldName);
                    field.setText(f.value ?? "");
                } catch {
                    console.warn(`PDF field not found: ${f.pdfFieldName}`);
                }
            }
            const pdfBytes = await pdfDoc.save();
            return { ok: true, bytes: pdfBytes };
        }

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        for (const f of fields) {
            if (f.page == null || f.x == null || f.y == null) {
                console.warn(`Missing placement info for field:`, f.id);
                continue;
            }
            const page = pdfDoc.getPages()[f.page];
            if (!page) continue;
            page.drawText(f.value ?? "", {
                x: f.x,
                y: f.y,
                size: f.fontSize ?? 12,
                font,
                color: rgb(0, 0, 0),
            });
        }

        const pdfBytes = await pdfDoc.save();
        return { ok: true, bytes: pdfBytes };
    } catch (e: any) {
        return {
            ok: false,
            error: {
                type: "PDF_FILL_ERROR",
                message: "Failed to fill PDF with fields.",
                details: e.message,
            },
        };
    }
}

export async function flattenPdf(pdfBytes: Uint8Array): Promise<PdfResult> {
    try {
        const pdfDoc = await loadPdf(pdfBytes);
        let form = null;
        try {
            form = pdfDoc.getForm();
        } catch {
            form = null;
        }
        if (form) {
            try {
                form.flatten();
            } catch (e) {
                console.warn("Flatten error", e);
            }
        }
        const newBytes = await pdfDoc.save();
        return { ok: true, bytes: newBytes };
    } catch (e: any) {
        return {
            ok: false,
            error: {
                type: "PDF_FLATTEN_ERROR",
                message: "Failed to flatten PDF.",
                details: e.message,
            },
        };
    }
}

export async function detectPdfFields(bytes: Uint8Array): Promise<any> {
    try {
        const pdfDoc = await loadPdf(bytes);
        const form = pdfDoc.getForm();
        const fields = form.getFields();

        return fields.map((f: any) => ({
            name: f.getName(),
            type: f.constructor.name,
        }));
    } catch (e) {
        return [];
    }
}

export { preparePdf };
export type { PreparePdfResult };

