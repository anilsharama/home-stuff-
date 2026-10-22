import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function AccountPage() {
  const { user, signOut } = useAuth();
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();

  async function handleSignOut() {
    setSigningOut(true);
    setError("");
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign out.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <main className="account-page">
      <Link className="account-back" to="/"><ArrowLeft size={15} /> Back to the shop</Link>
      <section className="account-card">
        <span className="eyebrow"><span /> YOUR NOVA ACCOUNT</span>
        <h1>Good to have you, {user.name}.</h1>
        <p>Your account details are securely linked to your sign-in.</p>
        <dl className="account-details">
          <div><dt>Name</dt><dd>{user.name}</dd></div>
          <div><dt>Email</dt><dd>{user.email}</dd></div>
          <div><dt>Account type</dt><dd>{user.role === "admin" ? "Administrator" : "Customer"}</dd></div>
        </dl>
        <p className="account-security"><ShieldCheck size={16} /> Your password is hashed on the server and is never sent back to this page.</p>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="account-signout" type="button" onClick={handleSignOut} disabled={signingOut}>
          <LogOut size={16} /> {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </section>
    </main>
  );
}

export default AccountPage;
