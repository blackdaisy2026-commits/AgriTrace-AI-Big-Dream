import { Suspense } from "react";
import LoginContent from "./login-content";

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen circuit-bg flex items-center justify-center text-white">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
