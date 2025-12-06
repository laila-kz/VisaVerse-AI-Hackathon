//build a ui to upload pdf files x
//show a progress bar while uploading
//show the file name , size and type after upload is complete x
//passes the file to App on submit 
//trigger the ocr and ai analusis flow through a prop function onSubmit
//show loading / processing state while ocr and ai analysis is being done

import React, { useState } from 'react';
//import { useDropzone } from 'react-dropzone';

//drop zone component
// interface FileDropZone{
//     onFileSelect:(file:File)=>void;
// }

// const FileDropZone: React.FC<FileDropZone> = ({ onFileSelect }) => {
//     const { getRootProps, getInputProps, isDragActive } = useDropzone({
//         accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] },
//         onDrop: (acceptedFiles: File[]) => {
//             if (acceptedFiles.length > 0) {
//                 onFileSelect(acceptedFiles[0]);
//             }
//         }
//     });

//     return (
//         <div
//             {...getRootProps()}
//             className={`dropzone ${isDragActive ? 'active' : ''}`}
//             style={{
//                 padding: '40px',
//                 border: '2px dashed #ccc',
//                 borderRadius: '8px',
//                 textAlign: 'center',
//                 cursor: 'pointer',
//             }}
//         >
//             <input {...getInputProps()} />
//             <p>Drag PDF or image files here or click to select</p>
//         </div>
//     );
// };

interface ProgressBarProps{
    progress:number;
 
}

const ProgressBar: React.FC<ProgressBarProps> =({progress})=>{
    return(
        <div>
            <progress value={progress} max={100} style={{width: '100%'}} />
            <span style={{marginLeft: '10px'}}>{Math.round(progress)}%</span>
        </div>
        
    );
};

//main upload form component
interface PdfUploadProps{
    onSubmit: (file:File)=>Promise<void>;
    isProcessing?: boolean;
}

const PdfUpload: React.FC<PdfUploadProps>=({ onSubmit, isProcessing = false })=>{

    const [file,setFile] = useState<File |null>(null);
    const [uploadProgress,setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] =useState<boolean>(false);

    //handle file selection from input
    const handleFileSelected=(pdf: File)=>{
        if (!pdf.type.includes('pdf') && !pdf.type.includes('image')) {
            alert("Please upload a valid PDF or image file");
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (pdf.size > maxSize) {
            alert("File size must be less than 10MB");
            return;
        }

        setFile(pdf);
        // ⭐ Reset progress bar when a new file is selected
        setUploadProgress(0);

        let progress=0;
        const interval = setInterval(()=>{
            progress +=10;
            setUploadProgress(progress);
            if(progress >=100){
                clearInterval(interval);
            }
        },100)
    }

    const handleSubmit = async ()=>{
        if(!file) return alert("Please select a file before submitting");
        setIsUploading(true);

        try {
            //trigger the ocr and ai analusis flow through a prop function onSubmit
            await onSubmit(file);
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setIsUploading(false);
        }
    }




    return(
            <div className="container" style={{ maxWidth: "500px", margin: "auto" }}>
        <h2>Upload PDF or Image File</h2>

        {/* <FileDropZone onFileSelect={handleFileSelected} /> */}

        <br />

        <label>Or select a file:</label>
        <input
            className="upload-file"
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => {
            if (e.target.files?.[0]) handleFileSelected(e.target.files[0]);
            }}
        />

        {/* ----------------------------
            Show File Info + Progress
            ---------------------------- */}
        {file && (
            <div className="file-info" style={{ marginTop: "15px" }}>
            <p>📄 <strong>{file.name}</strong></p>
            <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
            <p>Type: {file.type}</p>

            <ProgressBar progress={uploadProgress} />
            </div>
        )}

        {/* ----------------------------
            Submit Button
            ---------------------------- */}
        <button
            className="submit-btn"
            type="button"
            onClick={handleSubmit}
            disabled={!file || uploadProgress < 100 || isProcessing || isUploading}
            style={{
            marginTop: "20px",
            padding: "10px 20px",
            borderRadius: "6px",
            background: "#007bff",
            color: "white",
            cursor: "pointer",
            opacity: !file || uploadProgress < 100 || isProcessing || isUploading ? 0.6 : 1,
            }}
        >
            {isProcessing ? "Analyzing..." : isUploading ? "Uploading..." : "Submit for OCR + AI Analysis"}
        </button>

        {/* Show processing state */}
        {(isProcessing || isUploading) && (
            <p style={{ marginTop: "10px", color: "#444" }}>
            ⏳ Processing your document...
            </p>
        )}
        </div>
    );


};
export default PdfUpload;
