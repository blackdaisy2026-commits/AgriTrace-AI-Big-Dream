"use client";
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import toast from "react-hot-toast";

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    placeholder?: string;
}

export default function VoiceInput({ onTranscript, placeholder = "Tap mic and speak in Tamil or English..." }: VoiceInputProps) {
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [supported, setSupported] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            setSupported(!!SpeechRecognition);
        }
    }, []);

    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Voice not supported on this browser");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "ta-IN"; // Tamil first

        recognition.onstart = () => setListening(true);

        recognition.onresult = (event: any) => {
            const results = event.results;
            const last = results[results.length - 1];
            const text = last[0].transcript;
            setTranscript(text);
            if (last.isFinal) {
                onTranscript(text);
                speak(`Recorded: ${text}`);
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error === "no-speech") {
                toast("No speech detected. Try again.", { icon: "🎤" });
            } else if (event.error === "not-allowed") {
                toast.error("Microphone permission denied");
            }
            setListening(false);
        };

        recognition.onend = () => setListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        toast("🎤 Listening... Speak now", { duration: 2000 });
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setListening(false);
    };

    const speak = (text: string) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "ta-IN";
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={listening ? stopListening : startListening}
                    disabled={!supported}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${!supported
                            ? "opacity-40 cursor-not-allowed bg-gray-800 text-gray-500"
                            : listening
                                ? "bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-lg shadow-red-900/30"
                                : "bg-green-700 hover:bg-green-600 text-white shadow-lg shadow-green-900/30"
                        }`}
                >
                    {listening ? (
                        <><MicOff className="w-4 h-4" /> Stop (நிறுத்து)</>
                    ) : (
                        <><Mic className="w-4 h-4" /> Speak Tamil (தமிழில் பேசு)</>
                    )}
                </button>

                {transcript && (
                    <button
                        type="button"
                        onClick={() => speak(transcript)}
                        className="p-2 rounded-lg bg-blue-900/20 border border-blue-500/20 text-blue-400 hover:bg-blue-900/40 transition-colors"
                    >
                        <Volume2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {listening && (
                <div className="flex items-center gap-2 text-xs text-red-400">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    Recording... (ta-IN / en-IN)
                </div>
            )}

            {transcript && (
                <div className="p-2.5 rounded-lg bg-green-900/10 border border-green-500/20 text-sm text-green-300">
                    🎤 {transcript}
                </div>
            )}

            {!supported && (
                <p className="text-xs text-gray-500">
                    Voice not available. Use Chrome/Edge on HTTPS for Tamil speech input.
                </p>
            )}
        </div>
    );
}
