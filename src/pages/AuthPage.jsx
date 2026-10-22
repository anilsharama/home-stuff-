import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function AuthPage({ mode = "login" }) {
  const registering = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function signInAs(role) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const user = await signIn({
        email: email || (role === "admin" ? "admin@nova.demo" : "shopper@nova.demo"),
        name: name || (role === "admin" ? "NOVA Demo Admin" : "NOVA Shopper"),
        role,
      });
      navigate(location.state?.from?.pathname || (role === "admin" ? "/admin" : "/profile"), { replace: true });
    } catch {
      setError("Demo sign-in could not be completed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (registering && name.trim().length < 2) {
      setError("Enter a name of at least two characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (registering && password.length < 8) {
      setError("For this demo, use at least 8 characters.");
      return;
    }
    signInAs("customer");
  }

  return (
    <main className="auth-page">
      <Link className="store-logo auth-store-logo" to="/">nova<span>.</span></Link>
      <section className="auth-card">
        <span className="eyebrow">YOUR NOVA ACCOUNT · DEMO MODE</span>
        <h1>{registering ? "A good thing starts here." : "Welcome back."}</h1>
        <p>{registering ? "Create a demo account to explore your customer space." : "Sign in to explore the NOVA demo."}</p>
        <div className="demo-disclaimer"><b>Demo authentication only.</b> Passwords are never saved; accounts are stored locally on this device.</div>
        <form onSubmit={handleSubmit}>
          {registering && <><label htmlFor="auth-name">Your name</label><input id="auth-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required /></>}
          <label htmlFor="auth-email">Email address</label>
          <input id="auth-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="auth-password">Password {registering && <small>(demo validation only)</small>}</label>
          <div className="password-field"><input id="auth-password" type={showPassword ? "text" : "password"} autoComplete={registering ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={busy}>{busy ? "One moment..." : registering ? "Create demo account" : "Continue as customer"} <ArrowRight size={16} /></button>
        </form>
        {!registering && <button className="secondary-button admin-demo-button" type="button" disabled={busy} onClick={() => signInAs("admin")}>Explore admin demo</button>}
        <p className="auth-switch">{registering ? "Already have a demo account?" : "New to NOVA?"} <Link to={registering ? "/login" : "/register"}>{registering ? "Sign in" : "Create an account"}</Link></p>
        <Link to="/forgot-password" className="auth-back-link">Forgot your password?</Link>
      </section>
    </main>
  );
}

export default AuthPage;
