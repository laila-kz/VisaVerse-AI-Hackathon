// All logic that talks to the LLM (OpenAI or other).

// Functions like:

// extractFieldsFromOcr(ocrResult, formContext) → returns list of fields.

// explainFields(fields, language) → returns fields with explanations.

// autofillFieldsFromProfile(fields, profile) → returns suggested values.

// checkConsistency(fields, profile) → returns warnings or issues.

// Central place for prompts and API calls, so components stay simple.

// Handles errors and timeouts, returning clean error objects/messages.

import type { AiFieldExtractionRequest, AiFieldExtractionResponse, AiWarning, Field, UserProfile } from "../types/index";

// Frontend should not call OpenAI SDK directly (exposes secret and often fails in the browser).
// Instead we proxy requests to a small backend endpoint at `/api/chat`.
async function callOpenAI(prompt: string): Promise<string> {
    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
    });

    if (!res.ok) {
        const errText = await res.text();
        let err: any = {};
        try {
            err = JSON.parse(errText);
        } catch {
            console.error("Raw error response:", errText);
        }
        throw new Error(err?.error || errText || `OpenAI proxy request failed: ${res.status}`);
    }

    const data = await res.json();
    return data.text || "";
}

function buildFieldExtractionPrompt(input: AiFieldExtractionRequest) {
    return `
You are a visa form assistant. Extract structured fields from OCR text.

OCR TEXT:
---
${input.ocrTxt}
---

COUNTRY: ${input.country}
VISA TYPE: ${input.visaType}

Return JSON only with this format:

{
  "fields": [
    { "id": "field_1", "label": "Full Name", "value": "", "explanation": "Your full legal name", "required": true }
  ]
}
    `;
}

export async function extractFieldFromOcr(request: AiFieldExtractionRequest): Promise<AiFieldExtractionResponse> {
    const prompt = buildFieldExtractionPrompt(request);
    const responseTxt = await callOpenAI(prompt);

    try {
        return JSON.parse(responseTxt) as AiFieldExtractionResponse;
    } catch {
        console.error("Invalid AI response", responseTxt);
        throw new Error("AI returned invalid JSON.");
    }
}

export async function explainFields(fields: Field[], language: string = "en"): Promise<Field[]> {
    const prompt = `
You are a helpful assistant. Provide clear, concise explanations for visa form fields in ${language}.

Fields to explain:
${JSON.stringify(fields, null, 2)}

Return updated fields with improved explanations in the same JSON format.
`;
    const responseTxt = await callOpenAI(prompt);
    try {
        const result = JSON.parse(responseTxt);
        return result.fields || fields;
    } catch {
        console.warn("Failed to enhance explanations, returning original fields");
        return fields;
    }
}

export async function autofillFieldsFromProfile(fields: Field[], profile: UserProfile): Promise<Field[]> {
    const prompt = `
You are a form autofill assistant. Given a user profile and form fields, suggest which profile values should fill which fields.

Profile:
${JSON.stringify(profile, null, 2)}

Form Fields:
${JSON.stringify(fields, null, 2)}

Return the fields with suggested values filled in where appropriate. Return JSON format only.
`;
    const responseTxt = await callOpenAI(prompt);
    try {
        const result = JSON.parse(responseTxt);
        return result.fields || fields;
    } catch {
        console.warn("Failed to autofill from profile");
        return fields;
    }
}

export async function checkConsistency(fields: Field[], profile: UserProfile): Promise<AiWarning[]> {
    const prompt = `
You are a data quality assistant. Check for inconsistencies between form field values and the user profile.

Profile:
${JSON.stringify(profile, null, 2)}

Fields:
${JSON.stringify(fields, null, 2)}

Return a JSON array of warnings with structure: [{ "fieldId": "...", "message": "...", "severity": "error|warning|info" }]
`;
    const responseTxt = await callOpenAI(prompt);
    try {
        return JSON.parse(responseTxt) as AiWarning[];
    } catch {
        console.warn("Failed to check consistency");
        return [];
    }
}