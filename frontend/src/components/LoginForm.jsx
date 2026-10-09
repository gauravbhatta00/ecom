import { GoogleSignIn } from "./auth/google-sign-in";
import { loginDestination } from "../lib/login-destination";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, LogIn, User } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

export function LoginForm({ className, ...props }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginWithGoogle, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.info || null;

  const handleGoogleCredential = async (response) => {
    if (!response?.credential) return;
    const success = await loginWithGoogle(response.credential);
    if (success) navigate(loginDestination(location.state?.from));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login({ username, password });
    if (success) navigate(loginDestination(location.state?.from));
  };

  return (
    <div className={cn("flex flex-col gap-6 rounded-2xl border border-[#dedfd7] bg-white p-6 shadow-sm sm:p-8", className)} {...props}>
      <div className="text-center">
        <h2 className="display-font text-2xl text-[#18231c]">Welcome back</h2>
        <p className="mt-1 text-sm text-[#68716b]">Log in to continue shopping</p>
      </div>

      <div className="flex flex-col gap-3">
        <GoogleSignIn onCredential={handleGoogleCredential} />
      </div>

      <div className="flex items-center justify-center gap-3 text-xs text-[#a3a89e]">
        <span className="h-px flex-1 bg-[#e4e4dc]" /><span>Or continue with email</span><span className="h-px flex-1 bg-[#e4e4dc]" />
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7c857d]">Username</span>
          <div className="flex items-center gap-2.5 rounded-xl border border-[#dedfd7] bg-[#f7f6f1] px-3.5 py-2.5 transition focus-within:border-[#9cab6d] focus-within:bg-white">
            <User size={16} className="text-[#788078]" />
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your username" required className="w-full bg-transparent text-sm text-[#18231c] outline-none placeholder:text-[#a3a89e]" />
          </div>
        </label>

        <label className="block">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-[#7c857d]">Password</span>
            <Link to="/forgot-password" className="text-xs font-semibold text-[#71813d] hover:underline">Forgot?</Link>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-[#dedfd7] bg-[#f7f6f1] px-3.5 py-2.5 transition focus-within:border-[#9cab6d] focus-within:bg-white">
            <Lock size={16} className="text-[#788078]" />
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-transparent text-sm text-[#18231c] outline-none" />
          </div>
        </label>

        {successMessage && <p className="rounded-lg bg-[#f2f7e4] px-3 py-2 text-sm text-[#2f4a17]">{successMessage}</p>}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 rounded-full bg-[#173c2b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#24533d] disabled:cursor-not-allowed disabled:opacity-50">
          <LogIn size={16} />
          {loading ? "Logging in…" : "Log in"}
        </button>

        <p className="text-center text-sm text-[#68716b]">Don&apos;t have an account? <Link to="/signup" className="font-semibold text-[#71813d] hover:underline">Sign up</Link></p>
      </form>

      <p className="text-center text-xs text-[#a3a89e]">By continuing, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.</p>
    </div>
  );
}
