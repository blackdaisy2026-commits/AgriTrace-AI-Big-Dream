"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#030a05",
                color: "#d1d5db",
                fontFamily: "Outfit, sans-serif",
                padding: "20px",
                textAlign: "center",
            }}
        >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>
            <h2
                style={{
                    color: "#fff",
                    fontSize: "1.5rem",
                    fontWeight: 900,
                    marginBottom: "10px",
                }}
            >
                Something went wrong
            </h2>
            <p style={{ color: "#666", marginBottom: "24px", maxWidth: "400px" }}>
                {error?.message || "An unexpected error occurred. Please try again."}
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                <button
                    onClick={() => reset()}
                    style={{
                        padding: "10px 24px",
                        background: "#22c55e",
                        color: "#000",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "Outfit, sans-serif",
                    }}
                >
                    Try Again
                </button>
                <button
                    onClick={() => (window.location.href = "/")}
                    style={{
                        padding: "10px 24px",
                        background: "transparent",
                        color: "#3b82f6",
                        border: "1px solid rgba(59,130,246,0.3)",
                        borderRadius: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "Outfit, sans-serif",
                    }}
                >
                    Go Home
                </button>
            </div>
        </div>
    );
}
