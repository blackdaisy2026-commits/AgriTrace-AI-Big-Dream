"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body
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
                    margin: 0,
                }}
            >
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔴</div>
                <h2
                    style={{
                        color: "#fff",
                        fontSize: "1.5rem",
                        fontWeight: 900,
                        marginBottom: "10px",
                    }}
                >
                    Critical Application Error
                </h2>
                <p style={{ color: "#666", marginBottom: "24px", maxWidth: "400px" }}>
                    {error?.message || "The application encountered a critical error."}
                </p>
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
                    }}
                >
                    Reload App
                </button>
            </body>
        </html>
    );
}
