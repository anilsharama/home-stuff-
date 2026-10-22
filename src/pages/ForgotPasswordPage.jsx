import { Link } from "react-router-dom";
export default function ForgotPasswordPage() {
  return <main className="content-page workspace-page"><section className="auth-card"><span className="eyebrow">DEMO ACCOUNT</span><h1>Password reset</h1><p>This frontend-only demo does not create passwords or send reset emails. Sign in again using the customer or administrator demo option.</p><Link className="primary-button" to="/login">Return to demo sign in</Link></section></main>;
}
