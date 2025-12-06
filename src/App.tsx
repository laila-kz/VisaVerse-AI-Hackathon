import { useState } from "react";
import { runOcr } from "./lib/ocr";
import { extractFieldFromOcr, autofillFieldsFromProfile } from "./lib/ai";
import { loadProfile, saveProfile } from "./lib/profile";
import { fillPdfWithFields } from "./lib/pdf";
import PdfUpload from "./components/UploadForm";
import FieldList from "./components/FieldList";
import ProfileForm from "./components/ProfileEditor";
import DownloadSection from "./components/DownloadSection";
import type { Field, UserProfile } from "./types/index";
import "./App.css";

function App() {
    const [originalPdf, setOriginalPdf] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [profile, setProfile] = useState<UserProfile>(loadProfile());
    const [fields, setFields] = useState<Field[]>([]);
    const [currentStep, setCurrentStep] = useState<"upload" | "review" | "download">("upload");
    const [error, setError] = useState<string | null>(null);

    const handleOCRSubmit = async (file: File) => {
        setProcessing(true);
        setError(null);
        setOriginalPdf(file);

        try {
            // Run OCR
            const ocrResult = await runOcr(file);
            const ocrText = ocrResult.pages.map((p) => p.text).join("\n");

            // Extract fields with AI
            const aiRequest = {
                ocrTxt: ocrText,
                country: "US",
                visaType: "Tourist",
            };
            const aiResponse = await extractFieldFromOcr(aiRequest);

            // Autofill from profile
            const autofilled = await autofillFieldsFromProfile(aiResponse.fields, profile);
            setFields(autofilled);
            setCurrentStep("review");
        } catch (err: any) {
            setError(err.message || "OCR/AI processing failed");
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const generateFilledPdf = async (pdfFile: File, fieldsToFill: Field[]): Promise<Blob> => {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        const result = await fillPdfWithFields(bytes, fieldsToFill);
        if (!result.ok) {
            throw new Error(result.error?.message || "PDF generation failed");
        }

        return new Blob([result.bytes!], { type: "application/pdf" });
    };

    const handleFieldChange = (id: string, newValue: string) => {
        setFields((prev) =>
            prev.map((f) => (f.id === id ? { ...f, value: newValue } : f))
        );
    };

    const handleProfileSave = async (updatedProfile: UserProfile) => {
        setProfile(updatedProfile);
        saveProfile(updatedProfile);

        // Re-autofill fields with updated profile
        const autofilled = await autofillFieldsFromProfile(fields, updatedProfile);
        setFields(autofilled);
    };

    return (
        <>
            <div>
                <h1>VisaVerse Application</h1>
                <p>Welcome to VisaVerse, your AI-powered visa document assistant.</p>
            </div>

            {error && <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>}

            {currentStep === "upload" && (
                <div>
                    <PdfUpload onSubmit={handleOCRSubmit} isProcessing={processing} />
                </div>
            )}

            {currentStep === "review" && fields.length > 0 && (
                <>
                    <div className="fieldList-container">
                        <h2>Editable Field List</h2>
                        <FieldList fields={fields} onFieldChange={handleFieldChange} />
                    </div>

                    <div className="profileEditor-container">
                        <h2>User Profile Editor</h2>
                        <ProfileForm profile={profile} onSave={handleProfileSave} />
                    </div>

                    <div className="download-container">
                        <DownloadSection
                            fields={fields}
                            originalPdf={originalPdf}
                            generateFilledPdf={generateFilledPdf}
                        />
                    </div>
                </>
            )}
        </>
    );
}

export default App;
