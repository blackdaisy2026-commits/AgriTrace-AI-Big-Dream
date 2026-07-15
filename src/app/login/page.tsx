import { Suspense } from "react";
import LoginContent from "./login-content";

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen min-h-screen flex items-center justify-center text-slate-900">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}

