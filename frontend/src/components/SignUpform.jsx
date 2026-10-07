import { GoogleSignIn } from "./auth/google-sign-in";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function SignupForm(props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { register, loginWithGoogle, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleGoogleCredential = async (response) => {
    if (!response?.credential) return;
    const success = await loginWithGoogle(response.credential);
    if (success) navigate("/");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register({ username, email, password, password2 });
    if (success) {
      setSuccessMessage("Account created successfully. Redirecting to login...");
      setTimeout(() => {
        navigate("/login", { state: { info: "Account created successfully. Please login." } });
      }, 800);
    }
  };

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-[#dedfd7] bg-white p-6 shadow-sm sm:p-8" {...props}>
      <div className="text-center">
        <h2 className="display-font text-2xl text-[#18231c]">Create an account</h2>
        <p className="mt-1 text-sm text-[#68716b]">Join us for a better way to shop</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7c857d]">Username</span>
          <div className="flex items-center gap-2.5 rounded-xl border border-[#dedfd7] bg-[#f7f6f1] px-3.5 py-2.5 transition focus-within:border-[#9cab6d] focus-within:bg-white">
            <User size={16} className="text-[#788078]" />
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="john_doe" required className="w-full bg-transparent text-sm text-[#18231c] outline-none placeholder:text-[#a3a89e]" />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7c857d]">Email</span>
          <div className="flex items-center gap-2.5 rounded-xl border border-[#dedfd7] bg-[#f7f6f1] px-3.5 py-2.5 transition focus-within:border-[#9cab6d] focus-within:bg-white">
            <Mail size={16} className="text-[#788078]" />
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="m@example.com" required className="w-full bg-transparent text-sm text-[#18231c] outline-none placeholder:text-[#a3a89e]" />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7c857d]">Password</span>
          <div className="flex items-center gap-2.5 rounded-xl border border-[#dedfd7] bg-[#f7f6f1] px-3.5 py-2.5 transition focus-within:border-[#9cab6d] focus-within:bg-white">
            <Lock size={16} className="text-[#788078]" />
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-transparent text-sm text-[#18231c] outline-none" />
          </div>
          <p className="mt-1 text-xs text-[#a3a89e]">Must be at least 8 characters long.</p>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7c857d]">Confirm password</span>
          <div className="flex items-center gap-2.5 rounded-xl border border-[#dedfd7] bg-[#f7f6f1] px-3.5 py-2.5 transition focus-within:border-[#9cab6d] focus-within:bg-white">
            <Lock size={16} className="text-[#788078]" />
            <input id="confirm-password" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required className="w-full bg-transparent text-sm text-[#18231c] outline-none" />
          </div>
        </label>

        {successMessage && <p className="rounded-lg bg-[#f2f7e4] px-3 py-2 text-sm text-[#2f4a17]">{successMessage}</p>}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 rounded-full bg-[#173c2b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#24533d] disabled:cursor-not-allowed disabled:opacity-50">
          <UserPlus size={16} />
          {loading ? "Creating account…" : "Create account"}
        </button>

        <div className="flex items-center justify-center gap-3 text-xs text-[#a3a89e]">
          <span className="h-px flex-1 bg-[#e4e4dc]" /><span>Or</span><span className="h-px flex-1 bg-[#e4e4dc]" />
        </div>

        <GoogleSignIn onCredential={handleGoogleCredential} />

        <p className="text-center text-sm text-[#68716b]">Already have an account? <Link to="/login" className="font-semibold text-[#71813d] hover:underline">Sign in</Link></p>
      </form>
    </div>
  );
}
