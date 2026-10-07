import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, LogOut, Mail, MapPin, Phone, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function Profile() {
  const { user, isAuthenticated, logout, updateProfile, fetchProfile, loading, error } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.profile?.phone || "");
  const [address, setAddress] = useState(user?.profile?.address || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatar_url || "");

  useEffect(() => () => { if (avatarUrl.startsWith("blob:")) URL.revokeObjectURL(avatarUrl); }, [avatarUrl]);

  if (!isAuthenticated) return null;

  const initials = (`${firstName?.[0] || ""}${lastName?.[0] || ""}` || user?.username?.[0] || "U").toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("address", address);
    if (avatarFile) formData.append("avatar", avatarFile);

    const success = await updateProfile(formData);
    if (success) {
      notify("Profile updated successfully.", "success");
      if (fetchProfile) await fetchProfile();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) setAvatarUrl(URL.createObjectURL(file));
  };

  const fields = [
    { id: "firstName", label: "First name", value: firstName, setter: setFirstName, type: "text" },
    { id: "lastName", label: "Last name", value: lastName, setter: setLastName, type: "text" },
    { id: "email", label: "Email", value: email, setter: setEmail, type: "email", icon: Mail },
    { id: "phone", label: "Phone", value: phone, setter: setPhone, type: "text", icon: Phone },
  ];

  return (
    <main className="min-h-screen bg-[#f7f6f1] pt-28 pb-20">
      <div className="page-shell max-w-2xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-[#71813d]">Your account</p>
          <h1 className="display-font text-4xl tracking-tight text-[#18231c] sm:text-5xl">Profile</h1>
          <p className="mt-2 text-sm text-[#68716b]">Keep your details up to date for a smoother checkout.</p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-[#dedfd7] bg-white p-6 sm:p-8"
        >
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border-2 border-[#dedfd7] bg-[#f4f4ee] text-lg font-black text-[#173c2b]">
                {avatarUrl ? <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" /> : initials}
              </div>
              <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-[#173c2b] text-white shadow-sm transition hover:bg-[#24533d]">
                <Camera size={14} />
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <div>
              <p className="font-semibold text-[#18231c]">{firstName || user?.username} {lastName}</p>
              <p className="text-sm text-[#68716b]">Tap the camera to change your photo</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(({ id, label, value, setter, type, icon: Icon }) => (
              <label key={id} className={Icon ? "block" : "block sm:col-span-1"}>
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7c857d]">{label}</span>
                <div className="flex items-center gap-2.5 rounded-xl border border-[#dedfd7] bg-[#f7f6f1] px-3.5 py-2.5 transition focus-within:border-[#9cab6d] focus-within:bg-white">
                  {Icon && <Icon size={16} className="shrink-0 text-[#788078]" />}
                  <input id={id} type={type} value={value} onChange={(e) => setter(e.target.value)} className="w-full bg-transparent text-sm text-[#18231c] outline-none" />
                </div>
              </label>
            ))}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#7c857d]">Address</span>
            <div className="flex items-start gap-2.5 rounded-xl border border-[#dedfd7] bg-[#f7f6f1] px-3.5 py-2.5 transition focus-within:border-[#9cab6d] focus-within:bg-white">
              <MapPin size={16} className="mt-0.5 shrink-0 text-[#788078]" />
              <textarea id="address" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} className="w-full resize-none bg-transparent text-sm text-[#18231c] outline-none" />
            </div>
          </label>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#173c2b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#24533d] disabled:cursor-not-allowed disabled:opacity-50">
              <Save size={16} />
              {loading ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => { logout(); navigate("/", { replace: true }); }}
              className="flex items-center justify-center gap-2 rounded-full border border-[#dedfd7] px-6 py-3 text-sm font-semibold text-[#8a3223] transition hover:bg-red-50"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </motion.form>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return <div role="status" className="page-shell py-20">Loading profile?</div>;
  return <Profile key={JSON.stringify(user)} />;
}
