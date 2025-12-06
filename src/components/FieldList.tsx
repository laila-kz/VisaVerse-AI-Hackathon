import React from "react";
import type { Field } from "../types/index";

interface FieldListProps {
    fields: Field[];
    onFieldChange: (id: string, newValue: string) => void;
}

const FieldList: React.FC<FieldListProps> = ({ fields, onFieldChange }) => {
    return (
        <div className="field-container">
            {fields.map((field) => {
                const requiredError =
                    field.required && !field.value.trim()
                        ? "This field is required."
                        : null;

                const customError = field.validator
                    ? field.validator(field.value)
                    : null;

                const errorMessage = requiredError || customError;

                return (
                    <div
                        key={field.id}
                        style={{
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                        }}
                    >
                        <label
                            htmlFor={field.id}
                            style={{ fontWeight: "bold", fontSize: "16px" }}
                        >
                            {field.label} {field.required && "*"}
                        </label>

                        <p style={{ margin: "4px 0 10px", color: "#666" }}>
                            {field.explanation}
                        </p>

                        {field.type === "textarea" ? (
                            <textarea
                                id={field.id}
                                value={field.value}
                                onChange={(e) => onFieldChange(field.id, e.target.value)}
                                style={{
                                    width: "100%",
                                    minHeight: "80px",
                                    padding: "8px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                }}
                            />
                        ) : (
                            <input
                                id={field.id}
                                type={field.type || "text"}
                                value={field.value}
                                onChange={(e) => onFieldChange(field.id, e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                }}
                            />
                        )}

                        {errorMessage && (
                            <p style={{ marginTop: "5px", color: "red", fontSize: "14px" }}>
                                {errorMessage}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default FieldList;