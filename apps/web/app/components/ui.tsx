import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <a className={`brand ${compact ? "brand-compact" : ""}`} href="/" aria-label="Link home"><span className="brand-symbol">↗</span><span>link<span className="brand-period">.</span></span></a>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost"; icon?: ReactNode };
export function Button({ variant = "secondary", icon, children, className = "", ...props }: ButtonProps) {
  return <button className={`button button-${variant} ${className}`} {...props}>{icon && <span className="button-icon">{icon}</span>}{children}</button>;
}

export function Card({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`} {...props}>{children}</div>;
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
  return <span className={`avatar avatar-${size}`} aria-label={name}>{initials || "L"}</span>;
}

export function SectionHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="section-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>;
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;
  return <div className="toast" role="status"><span className="toast-check">✓</span>{message}<button onClick={onClose} aria-label="Dismiss notification">×</button></div>;
}

export function Field({ label, hint, error, ...props }: { label: string; hint?: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="field"><span>{label}</span><input {...props} aria-invalid={Boolean(error)} />{error ? <small className="field-error">{error}</small> : hint ? <small>{hint}</small> : null}</label>;
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog">×</button></div>{children}</section></div>;
}
