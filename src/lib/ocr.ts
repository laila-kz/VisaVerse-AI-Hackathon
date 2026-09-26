// Functions to handle OCR for both images and PDFs.

// For images:

// Take an image file or HTMLImageElement and return extracted text (+ optional bounding boxes).

// For PDFs:

// Take a PDF file or bytes, render pages to images (using a PDF library), then run OCR per page.

// Output a structured result: pages, text, and any layout info you will send to the AI.

// Hide all low-level OCR details from the rest of the app.

export interface OcrBlock{
    text: string;
    bbox:{x0:number; y0:number ; x1:number ; y1: number};

}
export interface OcrPageResult{
    page:number;
    text: string;
    blocks?:OcrBlock[];
}

export interface OcrResult {
    sourceName: string;
    pageCount: number;
    pages: OcrPageResult[];
}



import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { createWorker } from "tesseract.js";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

async function runImageOcr(imageInput: File | HTMLImageElement): Promise<OcrPageResult> {
  const worker: any = await createWorker("eng");


  const imageUrl =
    imageInput instanceof File ? URL.createObjectURL(imageInput) : imageInput.src;

  const { data } = await worker.recognize(imageUrl);

  await worker.terminate();

  return {
    page: 1,
    text: data.text,
    blocks: data.words?.map((w: any) => ({
      text: w.text,
      bbox: {
        x0: w.bbox.x0,
        y0: w.bbox.y0,
        x1: w.bbox.x1,
        y1: w.bbox.y1,
      },
    })),
  };
}

// --------------------
// OCR for PDFs
// --------------------

async function renderPdfPageToImage(page: any): Promise<string> {
  const viewport = page.getViewport({ scale: 2 });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;

  return canvas.toDataURL("image/png");
}

async function runPdfOcr(file: File): Promise<OcrPageResult[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const worker = await createWorker("eng");

  const pages: OcrPageResult[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const imageData = await renderPdfPageToImage(page);

    const { data } = await worker.recognize(imageData);

    pages.push({
      page: i,
      text: data.text,
      blocks: data.words?.map((w: any) => ({
        text: w.text,
        bbox: {
          x0: w.bbox.x0,
          y0: w.bbox.y0,
          x1: w.bbox.x1,
          y1: w.bbox.y1,
        },
      })),
    });
  }

  await worker.terminate();
  return pages;
}

// --------------------
// PUBLIC API
// --------------------

export async function runOcr(file: File): Promise<OcrResult> {
  const isPdf = file.type === "application/pdf";

  if (isPdf) {
    const pages = await runPdfOcr(file);
    return {
      sourceName: file.name,
      pageCount: pages.length,
      pages
    };
  }

  // Image OCR
  const page = await runImageOcr(file);
  return {
    sourceName: file.name,
    pageCount: 1,
    pages: [page]
  };
}