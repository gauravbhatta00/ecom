import { Toaster, toast } from "sonner";

export const ToastProvider = ({ children }) => <>{children}<Toaster position="top-right" closeButton richColors toastOptions={{ style: { borderRadius: "4px", fontFamily: "var(--font-sans)" } }} /></>;

const notify = (message, type = "success", duration = 3200) => {
  const show = type === "error" ? toast.error : type === "info" ? toast.info : toast.success;
  return show(message, { duration });
};

export const useToast = () => ({ notify });
