// Receives the current filled fields and original file data as props.

// Provides buttons/actions:

// “Generate filled PDF” → calls a function from pdf.ts.

// “Download filled PDF”.

// “Export JSON” (fields + answers + explanations) if you support it.

// Shows any errors from the PDF generation step.

// Optionally indicates file size and success message after download is ready.



import React, { useState } from "react";
import type { Field } from "../types/index";

interface DownloadSectionProps {
    fields: Field[];
    originalPdf: File | null;
    generateFilledPdf: (originalPdf: File, fields: Field[]) => Promise<Blob>;
}

const DownloadSection: React.FC<DownloadSectionProps> = ({
    fields,
    originalPdf,
    generateFilledPdf,
}) => {
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    //generate the filled pdf 
    const handleGeneratePdf = async () => {
        if (!originalPdf) {
            setError("No original PDF loaded");
            return;
        }
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const result = await generateFilledPdf(originalPdf, fields);
            setPdfBlob(result);
            const sizeKB = (result.size / 1024).toFixed(1);
            setSuccessMsg(`PDF generated successfully! Size: ${sizeKB} KB`);
        } catch (err) {
            setError("PDF generation failed.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    //download button 
    const handleDownload = async () => {
        if (!pdfBlob) return;

        const url = URL.createObjectURL(pdfBlob);  //temporary url to point to the pdf file data
        const a = document.createElement("a"); //create a hidden <a> tag
        a.href = url; //attach the url to the <A> tag
        a.download = "filled.pdf"; //tell the browser When clicked, download this as filled.pdf
        a.click(); //Pretends the user clicked the link so the download starts automatically.

        URL.revokeObjectURL(url); // delete the temp url to free memory 
    };

    //export data as a json file 
    const handleExportJson = () => {
        const data = {
            originalPdf: originalPdf?.name || "N/A",
            fields,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "form-data.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <h3>Download Options</h3>
            <button onClick={handleGeneratePdf} disabled={loading || !originalPdf}>
                {loading ? "Generating PDF..." : "Generate Filled PDF"}
            </button>
            <button onClick={handleDownload} disabled={!pdfBlob}>
                Download Filled PDF
            </button>
            <button onClick={handleExportJson}>Export JSON (fields + answers)</button>

            {/* ERRORS */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* SUCCESS MESSAGE */}
            {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

        </div>
    );
};

export default DownloadSection;