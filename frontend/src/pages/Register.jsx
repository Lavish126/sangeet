import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogoIcon } from "../components/Icons";
import { APP_NAME } from "../utils";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ ...form, userName: form.userName.trim(), email: form.email.trim() });
      navigate(form.role === "artist" ? "/studio" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand brand-lg"><LogoIcon width={34} height={34} /> <span>{APP_NAME}</span></div>
        <h1>Create your account</h1>

        <label>
          Username
          <input value={form.userName} onChange={update("userName")} required autoFocus />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={update("email")} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={update("password")} required minLength={6} />
        </label>

        <fieldset className="role-picker">
          <legend>I want to</legend>
          <label className={form.role === "user" ? "role selected" : "role"}>
            <input type="radio" name="role" value="user" checked={form.role === "user"} onChange={update("role")} />
            <strong>Listen</strong>
            <small>Stream songs and albums</small>
          </label>
          <label className={form.role === "artist" ? "role selected" : "role"}>
            <input type="radio" name="role" value="artist" checked={form.role === "artist"} onChange={update("role")} />
            <strong>Publish</strong>
            <small>Upload songs as an artist</small>
          </label>
        </fieldset>

        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={loading}>{loading ? "Creating account…" : "Sign up"}</button>
        <p className="muted center">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
