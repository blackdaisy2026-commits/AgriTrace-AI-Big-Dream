"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function AnimatedBackground() {
    return (
        <div
            className="fixed inset-0 pointer-events-none overflow-hidden"
            style={{ zIndex: 0 }}
            aria-hidden="true"
        >
            {/* Soft green gradient — top left */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
                className="absolute"
                style={{
                    top: "-20%",
                    left: "-10%",
                    width: "60vw",
                    height: "60vw",
                    background:
                        "radial-gradient(circle, rgba(22,163,74,0.08) 0%, rgba(22,163,74,0.03) 50%, transparent 80%)",
                    borderRadius: "50%",
                    filter: "blur(40px)",
                }}
            />

            {/* Soft blue gradient — top right */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 0.3 }}
                className="absolute"
                style={{
                    top: "-10%",
                    right: "-15%",
                    width: "50vw",
                    height: "50vw",
                    background:
                        "radial-gradient(circle, rgba(37,99,235,0.05) 0%, rgba(37,99,235,0.02) 50%, transparent 80%)",
                    borderRadius: "50%",
                    filter: "blur(50px)",
                }}
            />

            {/* Subtle green glow — bottom center */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 0.6 }}
                className="absolute"
                style={{
                    bottom: "5%",
                    left: "30%",
                    width: "40vw",
                    height: "40vw",
                    background:
                        "radial-gradient(circle, rgba(22,163,74,0.06) 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(60px)",
                }}
            />

            {/* Dot grid pattern — very subtle */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)`,
                    backgroundSize: "32px 32px",
                    backgroundPosition: "16px 16px",
                }}
            />
        </div>
    );
}
