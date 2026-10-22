import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

function Toast() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    function showToast(event) {
      setMessage(String(event.detail ?? ""));
    }
    window.addEventListener("nova-toast", showToast);
    return () => window.removeEventListener("nova-toast", showToast);
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const timeout = window.setTimeout(() => setMessage(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [message]);

  if (!message) return null;
  return <div className="toast-message" role="status"><Check size={15} />{message}<button type="button" aria-label="Dismiss notification" onClick={() => setMessage("")}><X size={15} /></button></div>;
}

export default Toast;
