import { useEffect, useMemo, useState } from "react";
import type { Route } from "./+types/home";
import { Avatar, Brand, Button, Card, Field, Modal, SectionHeading, Toast } from "../components/ui";
import type { LinkItem, Profile } from "../lib/api";
import { api } from "../lib/api";
import "../styles.css";

const starterLinks: LinkItem[] = [
  { id: "portfolio", title: "My portfolio", url: "https://harshkumar07.vercel.app", kind: "Portfolio", clicks: 1284, enabled: true },
  { id: "github", title: "Find me on GitHub", url: "https://github.com/harshkumar07", kind: "Project", clicks: 936, enabled: true },
  { id: "linkedin", title: "Connect on LinkedIn", url: "https://linkedin.com/in/harshkumargupta", kind: "Social", clicks: 742, enabled: true },
  { id: "contact", title: "Get in touch", url: "mailto:hello@example.com", kind: "Contact", clicks: 318, enabled: false },
];
const iconFor = (kind: string) => ({ Portfolio: "↗", Social: "◎", Project: "⌘", Contact: "✉", Video: "▷", Store: "◇" }[kind] ?? "↗");
const number = (value: number) => new Intl.NumberFormat("en-US", { notation: value > 9999 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);

export function meta(_args: Route.MetaArgs) {
  return [{ title: "Link — Creator dashboard" }, { name: "description", content: "Your online home, all in one link." }];
}

export default function Home() {
  const [profile, setProfile] = useState<Profile>({ username: "harshkumar", displayName: "Harsh Kumar", bio: "Developer, builder & curious mind. Making useful things for the internet.", published: true, links: starterLinks });
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<"link" | "profile" | null>(null);
  const [editing, setEditing] = useState<LinkItem | null>(null);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkKind, setLinkKind] = useState("Website");
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<Profile>("/profile/me").then((data) => { if (!cancelled) { setProfile(data); setDisplayName(data.displayName); setUsername(data.username); setBio(data.bio); } }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  const activeLinks = useMemo(() => profile.links.filter((link) => link.enabled), [profile.links]);
  const filteredLinks = useMemo(() => profile.links.filter((link) => `${link.title} ${link.url}`.toLowerCase().includes(search.toLowerCase())), [profile.links, search]);
  const clicks = profile.links.reduce((sum, link) => sum + link.clicks, 0);

  function flash(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2800); }
  function openNewLink() { setEditing(null); setLinkTitle(""); setLinkUrl(""); setLinkKind("Website"); setModal("link"); }
  function openEditLink(link: LinkItem) { setEditing(link); setLinkTitle(link.title); setLinkUrl(link.url); setLinkKind(link.kind); setModal("link"); }
  async function saveLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const safeUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(safeUrl) && !/^(mailto:|tel:)/i.test(safeUrl)) { flash("Use a full https:// URL, mailto: or tel: link."); return; }
    const optimistic: LinkItem = { id: editing?.id ?? `local-${Date.now()}`, title: linkTitle.trim(), url: safeUrl, kind: linkKind, clicks: editing?.clicks ?? 0, enabled: editing?.enabled ?? true };
    setProfile((current) => ({ ...current, links: editing ? current.links.map((item) => item.id === editing.id ? optimistic : item) : [...current.links, optimistic] }));
    setModal(null);
    try {
      const data = editing
        ? await api<{ link: LinkItem }>(`/profile/me/links/${editing.id}`, { method: "PATCH", body: JSON.stringify({ title: linkTitle.trim(), url: safeUrl, kind: linkKind }) })
        : await api<{ link: LinkItem }>("/profile/me/links", { method: "POST", body: JSON.stringify({ title: linkTitle.trim(), url: safeUrl, kind: linkKind }) });
      setProfile((current) => ({ ...current, links: current.links.map((item) => item.id === optimistic.id || item.id === editing?.id ? data.link : item) }));
      flash("Link saved.");
    } catch { flash("Saved in this preview. Connect the API database to persist it across sessions."); }
  }
  async function toggleLink(link: LinkItem) {
    const enabled = !link.enabled;
    setProfile((current) => ({ ...current, links: current.links.map((item) => item.id === link.id ? { ...item, enabled } : item) }));
    try { await api(`/profile/me/links/${link.id}`, { method: "PATCH", body: JSON.stringify({ enabled }) }); } catch { /* local preview remains interactive */ }
    flash(enabled ? "Link is visible on your page." : "Link hidden from your page.");
  }
  async function deleteLink(link: LinkItem) {
    setProfile((current) => ({ ...current, links: current.links.filter((item) => item.id !== link.id) }));
    try { await api(`/profile/me/links/${link.id}`, { method: "DELETE" }); flash("Link removed."); } catch { flash("Link removed from this preview."); }
  }
  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/.test(username)) { flash("Username must be 3–30 characters using letters, numbers or hyphens."); return; }
    const updated = { ...profile, username: username.toLowerCase(), displayName: displayName.trim(), bio: bio.trim() };
    setProfile(updated); setModal(null);
    try { await api("/profile/me", { method: "PATCH", body: JSON.stringify({ username: updated.username, displayName: updated.displayName, bio: updated.bio }) }); flash("Profile updated."); } catch { flash("Profile updated in this preview."); }
  }
  async function publish() {
    const published = !profile.published;
    setProfile((current) => ({ ...current, published }));
    try { await api("/profile/me", { method: "PATCH", body: JSON.stringify({ published }) }); } catch { /* local preview remains interactive */ }
    flash(published ? "Your page is published." : "Your page is now private.");
  }

  return <div className="app-shell"><div className="layout">
    <aside className="sidebar"><Brand /><div className="workspace-switch"><Avatar name={profile.displayName} /><div><div className="workspace-label">WORKSPACE</div><div className="workspace-name">{profile.displayName}'s space</div></div><span className="chevron">⌄</span></div>
      <div className="nav-group"><div className="nav-label">YOUR SPACE</div><a className="nav-link active" href="#overview"><span className="nav-icon">▦</span>Overview</a><a className="nav-link" href="#links"><span className="nav-icon">↗</span>My links <span className="nav-count">{profile.links.length}</span></a><a className="nav-link" href="#analytics"><span className="nav-icon">▥</span>Analytics</a><button className="nav-link" onClick={() => setModal("profile")}><span className="nav-icon">◐</span>Appearance & profile</button></div>
      <div className="nav-group"><div className="nav-label">ACCOUNT</div><button className="nav-link" onClick={() => flash("Account settings are coming next.")}><span className="nav-icon">⚙</span>Settings</button><button className="nav-link" onClick={() => flash("Help center is coming next.")}><span className="nav-icon">?</span>Help & support</button></div>
      <div className="sidebar-spacer" /><div className="sidebar-promo"><h3>A little more Link ✦</h3><p>Custom themes, deeper insights and your own domain. More room to make it yours.</p><Button variant="primary" onClick={() => flash("You're on the early-access list.")}>Explore Link Pro ↗</Button></div>
    </aside>
    <main className="main"><header className="topbar"><div className="breadcrumb">Workspace <span style={{ margin: "0 8px", color: "#c4c5bd" }}>/</span> <strong>Overview</strong></div><div className="topbar-actions"><button className="icon-button" aria-label="Notifications" onClick={() => flash("You're all caught up.")}>♧</button><button className="icon-button" aria-label="Help" onClick={() => flash("Help center is coming next.")}>?</button><button className="icon-button" aria-label="Sign out" title="Sign out" onClick={() => { void api("/auth/logout", { method: "POST" }).catch(() => undefined).finally(() => window.location.assign("/login")); }}>↪</button><div className="user-menu"><Avatar name={profile.displayName} />{profile.displayName}<span className="chevron">⌄</span></div></div></header>
      <div className="content" id="overview">
        <div className="page-heading"><div><div className="eyebrow">YOUR CREATOR SPACE</div><h1>Your little corner<br className="desktop-break" /> of the internet.</h1><p>Everything you share, all in one place. Here's how you're doing.</p></div><div className="heading-actions"><Button onClick={() => window.open(`/${profile.username}`, "_blank", "noopener,noreferrer")} icon="◉">Preview page</Button><Button variant="primary" onClick={openNewLink} icon="＋">Add a link</Button></div></div>
        <section className="profile-banner"><Avatar name={profile.displayName} size="lg" /><div className="profile-info"><div className="profile-name">{profile.displayName}</div><div className="profile-url">link.to/<strong>{profile.username}</strong> · Public profile</div></div><div className="banner-actions"><div className="live-status"><span className="live-dot" />{profile.published ? "Published" : "Private"}</div><Button onClick={() => { setDisplayName(profile.displayName); setUsername(profile.username); setBio(profile.bio); setModal("profile"); }}>Edit profile ↗</Button></div></section>
        <section className="stats-grid" aria-label="Performance overview"><Card className="stat-card"><div className="stat-top"><span>Profile views</span><span className="stat-icon">◉</span></div><div className="stat-value">8,492</div><div className="stat-foot"><span className="positive">↗ 12.8%</span> vs. last month</div></Card><Card className="stat-card"><div className="stat-top"><span>Link clicks</span><span className="stat-icon">↗</span></div><div className="stat-value">{number(clicks)}</div><div className="stat-foot"><span className="positive">↗ 8.2%</span> vs. last month</div></Card><Card className="stat-card"><div className="stat-top"><span>Click-through rate</span><span className="stat-icon">％</span></div><div className="stat-value">24.6%</div><div className="stat-foot"><span className="positive">↗ 2.4%</span> vs. last month</div></Card></section>
        <div className="links-layout"><section id="links"><SectionHeading title={`Your links (${profile.links.length})`} subtitle="Make it easy for people to find your best stuff." action={<Button onClick={openNewLink} icon="＋">Add new</Button>} /><Card className="links-card"><div className="card-heading"><strong>All links</strong><span className="muted-small">{activeLinks.length} active · <button className="button-ghost" style={{ padding: 0, minHeight: 0, fontSize: 10 }} onClick={() => setSearch(search ? "" : " ")}>{search ? "Clear filter" : "Search links"}</button></span></div>{search !== " " && <div style={{ padding: "10px 16px" }}><Field aria-label="Search links" label="Search links" placeholder="Search by title or URL" value={search} onChange={(event) => setSearch(event.target.value)} /></div>}{filteredLinks.map((link) => <div className={`link-row ${link.enabled ? "" : "off"}`} key={link.id}><div className="link-symbol">{iconFor(link.kind)}</div><div className="link-details"><div className="link-title">{link.title}</div><div className="link-url">{link.url}</div></div><div className="link-metrics"><div className="link-clicks">{number(link.clicks)}</div><div className="link-click-label">clicks</div></div><button className={`toggle ${link.enabled ? "on" : ""}`} aria-label={`${link.enabled ? "Disable" : "Enable"} ${link.title}`} aria-pressed={link.enabled} onClick={() => void toggleLink(link)}><span /></button><button className="icon-button" aria-label={`Edit ${link.title}`} onClick={() => openEditLink(link)}>✎</button><button className="icon-button" aria-label={`Delete ${link.title}`} onClick={() => void deleteLink(link)}>×</button></div>)}{filteredLinks.length === 0 && <div className="empty-state">No links match your search. Add a link to get started.</div>}</Card>
          <Card className="activity-card" id="analytics"><div className="activity-head"><div><div className="activity-title">Your audience is finding you</div><div className="activity-subtitle">Profile views over the last 7 days</div></div><select className="period-select" aria-label="Analytics period" onChange={(event) => flash(`Showing ${event.target.value}.`)}><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option></select></div><div className="chart" role="img" aria-label="Illustrative profile views chart increasing through the week">{[35,48,41,65,54,82,69,96,72,88,61,100,77,91,58,72,86,66,97,76,84].map((height, index) => <div className="bar-group" key={index}><span className={index % 3 === 1 ? "bar strong" : "bar"} style={{ height: `${height}%` }} /></div>)}</div><div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></Card>
        </section>
        <aside className="preview-card card"><div className="preview-wrap"><div className="preview-top"><strong>Live preview</strong><span className="preview-live">● {profile.published ? "PUBLISHED" : "PRIVATE"}</span></div><div className="phone"><div className="phone-notch"><span /></div><div className="phone-body"><Avatar name={profile.displayName} size="lg" /><div className="phone-name" style={{ marginTop: 10 }}>{profile.displayName}</div><div className="phone-handle">@{profile.username}</div><p className="phone-bio">{profile.bio || "A little bit about me goes here."}</p>{activeLinks.slice(0, 6).map((link) => <div className="phone-link" key={link.id}><span className="phone-link-icon">{iconFor(link.kind)}</span><span className="phone-link-label">{link.title}</span><span className="phone-link-arrow">↗</span></div>)}{activeLinks.length === 0 && <p className="phone-bio">Turn on a link to show it on your page.</p>}<div className="phone-footer">Made with <span>link.</span></div></div></div><div className="preview-foot">Changes to active links appear here.</div><Button variant="secondary" style={{ width: "100%", marginTop: 12 }} onClick={() => void publish()}>{profile.published ? "Unpublish page" : "Publish page"}</Button></div></aside></div>
      </div>
    </main>
  </div>
  {modal === "link" && <Modal title={editing ? "Edit link" : "Add a new link"} onClose={() => setModal(null)}><form className="form-stack" onSubmit={(event) => void saveLink(event)}><Field label="Link title" placeholder="e.g. My portfolio" value={linkTitle} onChange={(event) => setLinkTitle(event.target.value)} required maxLength={70} /><Field label="Destination URL" placeholder="https://example.com" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} required type="text" hint="Use https://, mailto: or tel: links."/><label className="field">Category<select value={linkKind} onChange={(event) => setLinkKind(event.target.value)}><option>Website</option><option>Portfolio</option><option>Social</option><option>Project</option><option>Contact</option><option>Video</option><option>Store</option></select></label><div className="form-actions"><Button type="button" onClick={() => setModal(null)}>Cancel</Button><Button variant="primary" type="submit">{editing ? "Save changes" : "Add link"}</Button></div></form></Modal>}
  {modal === "profile" && <Modal title="Edit your profile" onClose={() => setModal(null)}><form className="form-stack" onSubmit={(event) => void saveProfile(event)}><Field label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={80}/><Field label="Username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={30} hint="3–30 letters, numbers or hyphens."/><label className="field">Short bio<textarea rows={4} value={bio} onChange={(event) => setBio(event.target.value)} maxLength={280} placeholder="A little bit about you..." style={{ resize: "vertical" }}/><small>{bio.length}/280 characters</small></label><div className="form-actions"><Button type="button" onClick={() => setModal(null)}>Cancel</Button><Button variant="primary" type="submit">Save profile</Button></div></form></Modal>}
  <Toast message={toast} onClose={() => setToast("")}/></div>;
}
