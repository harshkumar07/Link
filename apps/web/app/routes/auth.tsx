import { useState } from "react";
import { Link, Form, useNavigation, useSearchParams } from "react-router";
import type { Route } from "./+types/auth";
import { Brand, Button, Field } from "../components/ui";
import { api } from "../lib/api";
import "../styles.css";

export function meta({}: Route.MetaArgs) { return [{ title: "Sign in to Link" }, { name: "description", content: "Sign in to manage your Link profile." }]; }

export default function AuthPage() {
  const [params] = useSearchParams();
  const isRegister = params.get("mode") === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const navigation = useNavigation();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setWorking(true);
    try {
      await api(isRegister ? "/auth/register" : "/auth/login", { method: "POST", body: JSON.stringify({ email, password, name }) });
      window.location.assign("/");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to authenticate. Please try again."); }
    finally { setWorking(false); }
  }
  return <main className="page-center"><section className="auth-card"><Brand/><h1>{isRegister ? "Make Link yours." : "Welcome back."}</h1><p>{isRegister ? "Create your creator space and bring everything you share together." : "Sign in to pick up where you left off."}</p>{error && <div className="notice error-notice" role="alert">{error}</div>}<form className="form-stack" onSubmit={(event) => void submit(event)}>{isRegister && <Field label="Your name" placeholder="Alex Morgan" value={name} onChange={(event) => setName(event.target.value)} required maxLength={80}/>}<Field label="Email address" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required/><Field label="Password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required/><Button variant="primary" type="submit" disabled={working || navigation.state !== "idle"}>{working ? "Please wait…" : isRegister ? "Create account ↗" : "Sign in ↗"}</Button></form><div className="auth-switch">{isRegister ? "Already have an account? " : "New to Link? "}<Link to={isRegister ? "/login" : "/login?mode=register"}>{isRegister ? "Sign in" : "Create an account"}</Link></div></section></main>;
}
