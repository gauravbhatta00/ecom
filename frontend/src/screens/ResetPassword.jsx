import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [done, setDone] = useState(false);
  const { confirmPasswordReset, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await confirmPasswordReset({ uid, token, newPassword, newPassword2 });
    if (success) setDone(true);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#173c2b] p-12 text-white lg:flex">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute bottom-0 right-0 h-72 w-72 bg-[#dff274]/10 blur-3xl" />
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <span className="grid h-10 w-10 rotate-3 place-items-center rounded-xl bg-[#dff274] text-sm font-black text-[#173c2b]">LV</span>
          <span className="display-font text-xl">LeloVaiLelo</span>
        </Link>
        <div className="relative z-10 max-w-md">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#dff274]">Almost there</p>
          <h1 className="display-font text-4xl leading-tight tracking-[-.03em]">Choose a new <span className="italic text-[#dff274]">password.</span></h1>
          <p className="mt-4 text-sm leading-6 text-white/65">Pick something secure you haven&apos;t used before, and you&apos;ll be right back to shopping.</p>
        </div>
        <p className="relative z-10 text-xs text-white/40">© {new Date().getFullYear()} LeloVaiLelo</p>
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f7f6f1] p-6 md:p-10">
        <Link to="/" className="flex items-center gap-3 lg:hidden">
          <span className="grid h-10 w-10 rotate-3 place-items-center rounded-xl bg-[#173c2b] text-sm font-black text-[#dff274]">LV</span>
          <span className="display-font text-xl text-[#18231c]">LeloVaiLelo</span>
        </Link>

        <div className="w-full max-w-sm rounded-2xl border border-[#dedfd7] bg-white p-6 shadow-sm sm:p-8">
          {done ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[#f2f7e4] text-[#5a7025]"><CheckCircle2 size={26} /></span>
              <div>
                <h2 className="display-font text-2xl text-[#18231c]">Password reset</h2>
                <p className="mt-2 text-sm leading-6 text-[#68716b]">Your password has been updated. You can now log in with your new password.</p>
              </div>
              <button onClick={() => navigate("/login")} className="mt-2 rounded-full bg-[#173c2b] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#24533d]">Go to log in</button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#f4f4ee] text-[#173c2b]"><ShieldCheck size={22} /></span>
                <h2 className="display-font text-2xl text-[#18231c]">Set a new password</h2>
                <p className="mt-1 text-sm text-[#68716b]">Make it at least 8 characters.</p>
              </div>

              <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7c857d]">New password</span>
                  <div className="flex items-center gap-2.5 rounded-xl border border-[#dedfd7] bg-[#f7f6f1] px-3.5 py-2.5 transition focus-within:border-[#9cab6d] focus-within:bg-white">
                    <Lock size={16} className="text-[#788078]" />
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full bg-transparent text-sm text-[#18231c] outline-none" />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7c857d]">Confirm new password</span>
                  <div className="flex items-center gap-2.5 rounded-xl border border-[#dedfd7] bg-[#f7f6f1] px-3.5 py-2.5 transition focus-within:border-[#9cab6d] focus-within:bg-white">
                    <Lock size={16} className="text-[#788078]" />
                    <input type="password" value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)} required className="w-full bg-transparent text-sm text-[#18231c] outline-none" />
                  </div>
                </label>

                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

                <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 rounded-full bg-[#173c2b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#24533d] disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? "Resetting…" : "Reset password"}
                </button>

                <p className="text-center text-sm text-[#68716b]"><Link to="/login" className="font-semibold text-[#71813d] hover:underline">Back to log in</Link></p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
