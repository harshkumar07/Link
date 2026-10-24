import { useEffect, useMemo, useState } from "react";
import { Avatar, Brand, Button, Card, Field, Modal, SectionHeading, Toast } from "../components/ui";
import type { LinkAnalytics, LinkItem, Profile } from "../lib/api";
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

export function meta() {
  return [{ title: "Link — Creator dashboard" }, { name: "description", content: "Your online home, all in one link." }];
}

export default function Home() {
  const [analytics, setAnalytics] = useState<LinkAnalytics>({ days: [], links: [] });
  const [analyticsRange, setAnalyticsRange] = useState<"30" | "90">("30");
  const [, setHasChanges] = useState(false);
  const [profile, setProfile] = useState<Profile>({ username: "harshkumar", displayName: "Harsh Kumar", bio: "Developer, builder & curious mind. Making useful things for the internet.", published: true, template: "stack", theme: "sage", linkStyle: "soft", links: starterLinks });
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<"link" | "profile" | "appearance" | "theme" | "settings" | null>(null);
  const [editing, setEditing] = useState<LinkItem | null>(null);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkKind, setLinkKind] = useState("Website");
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid" | "error">("idle");
  const [bio, setBio] = useState(profile.bio);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [template, setTemplate] = useState("stack");
  const [theme, setTheme] = useState("sage");
  const [baseColor, setBaseColor] = useState("#f7f8f3");
  const [dashboardTheme, setDashboardTheme] = useState("sage");
  const [appearanceLoaded, setAppearanceLoaded] = useState(false);
  const [linkStyle, setLinkStyle] = useState("soft");
  const [device, setDevice] = useState("iphone");
  const [showDesigns, setShowDesigns] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("link-appearance");
      if (saved) {
        const value = JSON.parse(saved) as { template?: string; theme?: string; linkStyle?: string; device?: string; baseColor?: string; dashboardTheme?: string };
        if (value.template) setTemplate(value.template);
        if (value.theme) setTheme(value.theme);
        if (value.linkStyle) setLinkStyle(value.linkStyle);
        if (value.device) setDevice(value.device);
        if (value.baseColor) setBaseColor(value.baseColor);
        if (value.dashboardTheme) setDashboardTheme(value.dashboardTheme);
      }
    } catch { /* keep defaults when saved preferences are unavailable */ }
    setAppearanceLoaded(true);
  }, []);

  useEffect(() => {
    if (!appearanceLoaded) return;
    window.localStorage.setItem("link-appearance", JSON.stringify({ template, theme, linkStyle, device, baseColor, dashboardTheme }));
  }, [appearanceLoaded, template, theme, linkStyle, device, baseColor, dashboardTheme]);

  useEffect(() => {
    let cancelled = false;
    api<Profile>("/profile/me").then((data) => { if (!cancelled) { setProfile(data); setDisplayName(data.displayName); setUsername(data.username); setBio(data.bio); if (data.template) setTemplate(data.template); if (data.theme) setTheme(data.theme); if (data.linkStyle) setLinkStyle(data.linkStyle); if (data.baseColor) setBaseColor(data.baseColor); } }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api<LinkAnalytics>(`/profile/me/analytics?days=${analyticsRange}`).then((data) => { if (!cancelled) setAnalytics(data); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [profile.links]);

  useEffect(() => {
    const normalized = username.trim().toLowerCase();
    if (!/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/.test(normalized)) { setUsernameStatus(normalized ? "invalid" : "idle"); return; }
    if (normalized === profile.username.toLowerCase()) { setUsernameStatus("available"); return; }
    setUsernameStatus("checking");
    let cancelled = false;
    const timer = window.setTimeout(() => {
      api<{ available: boolean }>("/profile/username-availability/" + encodeURIComponent(normalized))
        .then((result) => { if (!cancelled) setUsernameStatus(result.available ? "available" : "taken"); })
        .catch(() => { if (!cancelled) setUsernameStatus("error"); });
    }, 350);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [username, profile.username]);

  function updateAppearance(change: { template?: string; theme?: string; linkStyle?: string; baseColor?: string }) {
    setHasChanges(true);
    if (change.template) setTemplate(change.template);
    if (change.theme) {
      setTheme(change.theme);
    }
    if (change.linkStyle) setLinkStyle(change.linkStyle);
    if (change.baseColor) setBaseColor(change.baseColor);
    void api("/profile/me", { method: "PATCH", body: JSON.stringify(change) }).catch(() => { /* local preview remains usable if the API is unavailable */ });
  }

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
    setHasChanges(true);
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
    setHasChanges(true);
    setProfile((current) => ({ ...current, links: current.links.map((item) => item.id === link.id ? { ...item, enabled } : item) }));
    try { await api(`/profile/me/links/${link.id}`, { method: "PATCH", body: JSON.stringify({ enabled }) }); } catch { /* local preview remains interactive */ }
    flash(enabled ? "Link is visible on your page." : "Link hidden from your page.");
  }
  async function deleteLink(link: LinkItem, confirmed = false) {
    if (!confirmed && !window.confirm(`Delete “${link.title}”? This will remove it from your page. Are you sure?`)) return;
    setHasChanges(true);
    setProfile((current) => ({ ...current, links: current.links.filter((item) => item.id !== link.id) }));
    try { await api(`/profile/me/links/${link.id}`, { method: "DELETE" }); flash("Link removed."); } catch { flash("Link removed from this preview."); }
  }
  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/.test(username)) { flash("Username must be 3–30 characters using letters, numbers or hyphens."); return; }
    if (["taken", "checking", "invalid", "error"].includes(usernameStatus)) { flash(usernameStatus === "taken" ? "That username is already taken. Try another one." : "Please wait until username availability is confirmed."); return; }
    const updated = { ...profile, username: username.toLowerCase(), displayName: displayName.trim(), bio: bio.trim() };
    setHasChanges(true);
    setProfile(updated); setModal(null);
    try { await api("/profile/me", { method: "PATCH", body: JSON.stringify({ username: updated.username, displayName: updated.displayName, bio: updated.bio }) }); flash("Profile updated."); } catch { flash("Profile updated in this preview."); }
  }
  async function publish() {
    setProfile((current) => ({ ...current, published: true }));
    try {
      await api("/profile/me", { method: "PATCH", body: JSON.stringify({ published: true }) });
      setHasChanges(false);
      flash("Your changes are published.");
    } catch {
      flash("Could not publish changes. Please try again.");
    }
  }

  return <div className={`app-shell dashboard-theme-${dashboardTheme}`}><div className="layout">
    <aside className={`sidebar ${mobileMenuOpen ? "mobile-menu-open" : ""}`}><div className="mobile-sidebar-head"><Brand /><button className="icon-button mobile-menu-close" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)}>×</button></div><div className="workspace-switch"><Avatar name={profile.displayName} /><div><div className="workspace-label">WORKSPACE</div><div className="workspace-name">{profile.displayName.trim().split(/\s+/)[0]}'s space</div></div><span className="chevron">⌄</span></div>
      <div className="nav-group"><div className="nav-label">YOUR SPACE</div><a className="nav-link active" href="#overview"><span className="nav-icon">⌂</span>Dashboard</a><a className="nav-link" href="#preview"><span className="nav-icon">▣</span>Live preview</a><a className="nav-link" href="#links"><span className="nav-icon">↗</span>My links <span className="nav-count">{profile.links.length}</span></a><button className="nav-link" onClick={() => setModal("theme")}><span className="nav-icon">◐</span>Theme</button><button className="nav-link" onClick={() => setModal("profile")}><span className="nav-icon">◉</span>Profile</button></div>
      <div className="nav-group"><div className="nav-label">ACCOUNT</div><button className="nav-link" onClick={() => setModal("settings")}><span className="nav-icon">⚙</span>Settings</button></div>
      <div className="sidebar-spacer" />
    </aside>
    <main className="main"><header className="topbar"><button className="icon-button mobile-menu-toggle" aria-label="Open navigation menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((value) => !value)}>☰</button><div className="breadcrumb"><strong>Dashboard</strong><span style={{ marginLeft: 10, color: "#8b8e82" }}>Your online presence, in one place</span></div><div className="topbar-actions"><button className="icon-button" aria-label="Sign out" title="Sign out" onClick={() => { void api("/auth/logout", { method: "POST" }).catch(() => undefined).finally(() => window.location.assign("/login")); }}>↪</button><div className="user-menu"><Avatar name={profile.displayName} />{profile.displayName}<span className="chevron">⌄</span></div></div></header>
      <div className="content" id="overview">
        <div className="page-heading dashboard-welcome"><div><div className="eyebrow">WELCOME TO LINK</div><h1>Everything you share,<br className="desktop-break" /> in one simple page.</h1><p>Link brings your portfolio, social profiles, projects and contact details together in one shareable link. Customize your page, preview it live, and control what visitors see.</p></div><div className="heading-actions"><Button variant="primary" onClick={() => void publish()}>Save &amp; publish</Button></div></div>
        <section className="dashboard-overview" aria-label="Page overview">
          <div className="overview-card overview-intro"><span className="overview-icon">↗</span><div><strong>Your page</strong><p>One link for all your important places online.</p><div className="overview-actions"><button className="overview-action" onClick={() => { void navigator.clipboard?.writeText(window.location.origin + "/" + profile.username).then(() => flash("Your page link was copied.")).catch(() => flash("Your page is at " + window.location.origin + "/" + profile.username)); }}>Copy page link ↗</button><button className="overview-action" onClick={() => window.open("/" + profile.username, "_blank", "noopener,noreferrer")}>Preview page ↗</button></div></div></div>
          <div className="overview-card"><span className="overview-label">TOTAL LINKS</span><strong className="overview-value">{profile.links.length}</strong><span className="overview-note">{activeLinks.length} currently visible</span></div>
          <div className="overview-card"><span className="overview-label">TOTAL CLICKS</span><strong className="overview-value">{number(clicks)}</strong><span className="overview-note">Across your links</span></div>
          <div className="overview-card"><span className="overview-label">PAGE STATUS</span><strong className="overview-value overview-status">{profile.published ? "Published" : "Private"}</strong><span className="overview-note">{profile.published ? "Your page is marked live" : "Only you should edit for now"}</span></div>
        </section>

        <div className="links-layout"><section id="links"><SectionHeading title={`Your links (${profile.links.length})`} subtitle="Make it easy for people to find your best stuff." action={<div className="link-heading-actions"><Button onClick={() => setEditMode((value) => !value)}>{editMode ? "Done" : "Edit links"}</Button><Button variant="primary" onClick={openNewLink} icon="＋">Add link</Button></div>} /><Card className="links-card"><div className="card-heading"><strong>All links</strong><span className="muted-small">{activeLinks.length} active · <button className="button-ghost" style={{ padding: 0, minHeight: 0, fontSize: 10 }} onClick={() => { if (showSearch) { setSearch(""); setShowSearch(false); } else { setShowSearch(true); } }}>{showSearch ? "Close search" : "Search links"}</button></span></div>{!editMode && <p className="edit-mode-hint">Your links are shown as visitors will see them. Choose <strong>Edit links</strong> to manage visibility and edit details.</p>}{showSearch && <div style={{ padding: "10px 16px" }}><Field aria-label="Search links" label="Search links" placeholder="Search by title or URL" value={search} onChange={(event) => setSearch(event.target.value)} /></div>}{filteredLinks.map((link) => { const series = analytics.links.find((item) => item.id === link.id)?.clicks ?? []; const peak = Math.max(1, ...series); const recent = series.reduce((sum, value) => sum + value, 0); return <div className={`link-row ${link.enabled ? "" : "off"} ${editMode ? "edit-mode" : ""}`} key={link.id}><div className="link-symbol">{iconFor(link.kind)}</div><div className="link-details"><div className="link-title">{link.title}</div><div className="link-url">{link.url}</div></div><div className="link-metrics"><div className="link-clicks">{number(link.clicks)}</div><div className="link-click-label">all-time clicks</div></div><div className="link-progress" aria-label={`${link.title}: ${recent} clicks in the last ${analyticsRange === "30" ? "30 days" : "3 months"}`}><div className="link-progress-heading"><span>Last {analyticsRange === "30" ? "30 days" : "3 months"}</span><strong>{number(recent)}</strong></div><div className="link-progress-bars">{series.map((value, index) => <div className="link-progress-day" key={analytics.days[index]?.date ?? index} title={`${analytics.days[index]?.date ?? "Day"}: ${value} clicks`}><span className="link-progress-bar" style={{ height: `${Math.max(value > 0 ? 12 : 3, (value / peak) * 28)}px` }} /><small>{analyticsRange === "30" ? (index % 5 === 0 ? analytics.days[index]?.label.split(" ")[1] : "") : (index % 15 === 0 ? analytics.days[index]?.label.split(" ")[1] : "")}</small></div>)}</div></div>{editMode && <><button className={`toggle ${link.enabled ? "on" : ""}`} aria-label={`${link.enabled ? "Disable" : "Enable"} ${link.title}`} aria-pressed={link.enabled} onClick={() => void toggleLink(link)}><span /></button><button className="icon-button" aria-label={`Edit ${link.title}`} title="Edit link" onClick={() => openEditLink(link)}>✎</button><button className="icon-button delete-link-button" aria-label={`Delete ${link.title}`} title="Delete link" onClick={() => void deleteLink(link)}>×</button></>}</div>; })}{filteredLinks.length === 0 && <div className="empty-state">No links match your search. Add a link to get started.</div>}</Card>

        </section>
        </div><section className="preview-section" id="preview"><aside className="preview-card card"><div className="preview-wrap"><div className="preview-top"><strong>Live preview</strong><span className="preview-live">● {profile.published ? "PUBLISHED" : "PRIVATE"}</span></div><div className="preview-controls"><span className="preview-device-note">Preview on a phone</span><button className="design-toggle" onClick={() => setShowDesigns((value) => !value)}>{showDesigns ? "Hide design options ↑" : "Customize design ↓"}</button></div>{showDesigns && <div className="quick-designs"><div className="quick-design-label">PAGE STYLE</div><div className="design-chip-row">{[{id:"stack",name:"Classic"},{id:"profile",name:"Creator"},{id:"cards",name:"Cards"},{id:"minimal",name:"Minimal"},{id:"gradient",name:"Gradient"}].map((item) => <button key={item.id} className={`design-chip ${template === item.id ? "selected" : ""}`} aria-pressed={template === item.id} onClick={() => updateAppearance({ template: item.id })}>{item.name}</button>)}</div><div className="quick-design-label">COLOR THEME</div><div className="theme-swatches">{[{id:"sage",name:"Sage Mist",color:"#dce8d5"},{id:"ocean",name:"Powder Blue",color:"#dce8f4"},{id:"blush",name:"Dusty Rose",color:"#f0dfe1"},{id:"lavender",name:"Soft Lavender",color:"#e8e2f3"}].map((item) => <button key={item.id} className={`theme-swatch ${theme === item.id ? "selected" : ""}`} aria-pressed={theme === item.id} title={item.name} aria-label={`${item.name} theme`} onClick={() => updateAppearance({ theme: item.id })}><span style={{background:item.color}} />{item.name}</button>)}</div><div className="quick-design-label">LINK BUTTONS</div><div className="design-chip-row">{[{id:"soft",name:"Soft cards"},{id:"outline",name:"Outlined"},{id:"solid",name:"Solid"}].map((item) => <button key={item.id} className={`design-chip ${linkStyle === item.id ? "selected" : ""}`} aria-pressed={linkStyle === item.id} onClick={() => updateAppearance({ linkStyle: item.id })}>{item.name}</button>)}</div></div>}<div className={`phone-frame device-iphone theme-${theme} template-${template} linkstyle-${linkStyle}`} style={{ "--preview-bg": baseColor, backgroundColor: baseColor } as React.CSSProperties}><div className="phone-notch"><span /></div><div className="phone-body"><Avatar name={profile.displayName} size="lg" /><div className="phone-name" style={{ marginTop: 10 }}>{profile.displayName}</div><div className="phone-handle">@{profile.username}</div><p className="phone-bio">{profile.bio || "A little bit about me goes here."}</p>{activeLinks.slice(0, 6).map((link) => <div className="phone-link" key={link.id}><span className="phone-link-icon">{iconFor(link.kind)}</span><span className="phone-link-label">{link.title}</span><span className="phone-link-arrow">↗</span></div>)}{activeLinks.length === 0 && <p className="phone-bio">Turn on a link to show it on your page.</p>}<div className="phone-footer">Made with <span>link.</span></div></div></div><div className="preview-foot">Your layout and colors update instantly.</div><Button variant="secondary" style={{ width: "100%", marginTop: 12 }} onClick={() => window.open("/" + profile.username, "_blank", "noopener,noreferrer")}>Open public page ↗</Button></div></aside></section>
      </div>
    </main>
  </div>
  {modal === "link" && <Modal title={editing ? "Edit link" : "Add a new link"} onClose={() => setModal(null)}><form className="form-stack" onSubmit={(event) => void saveLink(event)}><Field label="Link title" placeholder="e.g. My portfolio" value={linkTitle} onChange={(event) => setLinkTitle(event.target.value)} required maxLength={70} /><Field label="Destination URL" placeholder="https://example.com" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} required type="text" hint="Use https://, mailto: or tel: links."/><label className="field">Category<select value={linkKind} onChange={(event) => setLinkKind(event.target.value)}><option>Website</option><option>Portfolio</option><option>Social</option><option>Project</option><option>Contact</option><option>Video</option><option>Store</option></select></label><div className="form-actions">{editing && <Button type="button" onClick={() => { if (window.confirm(`Delete “${editing.title}”? This will remove it from your page. Are you sure?`)) { void deleteLink(editing, true); setModal(null); } }}>Delete link</Button>}<Button type="button" onClick={() => setModal(null)}>Cancel</Button><Button variant="primary" type="submit">{editing ? "Save changes" : "Add link"}</Button></div></form></Modal>}
  {modal === "appearance" && <Modal title="Public page design" onClose={() => setModal(null)}><div className="appearance-modal"><p>These options affect your public link page only. Dashboard colors are managed separately under Theme.</p><div className="appearance-group"><strong>Choose a layout</strong><div className="template-grid">{[{id:"stack",name:"Classic stack",desc:"Clean, familiar link list"},{id:"profile",name:"Creator profile",desc:"Big profile, editorial feel"},{id:"cards",name:"Card grid",desc:"Distinct visual cards"},{id:"minimal",name:"Minimal",desc:"Typography first"},{id:"gradient",name:"Gradient glow",desc:"Bold color background"}].map((item) => <button key={item.id} className={`template-option ${template === item.id ? "selected" : ""}`} aria-pressed={template === item.id} onClick={() => updateAppearance({ template: item.id })}><span className={`template-thumb thumb-${item.id}`}><i /><i /><i /></span><strong>{item.name}</strong><small>{item.desc}</small></button>)}</div></div><div className="appearance-group"><strong>Color palette</strong><div className="palette-grid">{[{id:"sage",name:"Sage Mist",colors:["#dce8d5","#f8faf6","#55745b"]},{id:"ocean",name:"Powder Blue",colors:["#dce8f4","#f7faff","#53799c"]},{id:"blush",name:"Dusty Rose",colors:["#f0dfe1","#fff9f8","#a56e78"]},{id:"lavender",name:"Soft Lavender",colors:["#e8e2f3","#fbf9ff","#796aa5"]}].map((item) => <button key={item.id} className={`palette-option ${theme === item.id ? "selected" : ""}`} aria-pressed={theme === item.id} onClick={() => updateAppearance({ theme: item.id })}><span className="palette-dots">{item.colors.map((color) => <i key={color} style={{background:color}} />)}</span><span>{item.name}</span>{theme === item.id && <b>✓</b>}</button>)}</div></div><div className="appearance-group"><strong>Button style</strong><div className="design-chip-row">{[{id:"soft",name:"Soft cards"},{id:"outline",name:"Outlined"},{id:"solid",name:"Solid"}].map((item) => <button key={item.id} className={`design-chip ${linkStyle === item.id ? "selected" : ""}`} aria-pressed={linkStyle === item.id} onClick={() => updateAppearance({ linkStyle: item.id })}>{item.name}</button>)}</div></div><div className="form-actions"><Button onClick={() => setModal(null)}>Done</Button></div></div></Modal>}
  {modal === "theme" && <Modal title="Dashboard theme" onClose={() => setModal(null)}><div className="appearance-modal"><p>Choose a soft workspace color. This changes the dashboard only, not the colors visitors see on your public page.</p><div className="palette-grid">{[{id:"sage",name:"Sage Mist",colors:["#dce8d5","#f8faf6","#55745b"]},{id:"ocean",name:"Powder Blue",colors:["#dce8f4","#f7faff","#53799c"]},{id:"blush",name:"Dusty Rose",colors:["#f0dfe1","#fff9f8","#a56e78"]},{id:"lavender",name:"Soft Lavender",colors:["#e8e2f3","#fbf9ff","#796aa5"]}].map((item) => <button key={item.id} className={`palette-option ${dashboardTheme === item.id ? "selected" : ""}`} aria-pressed={dashboardTheme === item.id} onClick={() => setDashboardTheme(item.id)}><span className="palette-dots">{item.colors.map((color) => <i key={color} style={{background:color}} />)}</span><span>{item.name}</span>{dashboardTheme === item.id && <b>✓</b>}</button>)}</div><div className="form-actions"><Button onClick={() => setModal(null)}>Done</Button></div></div></Modal>}
  {modal === "settings" && <Modal title="Settings" onClose={() => setModal(null)}><div className="settings-page"><p className="settings-intro">A few simple controls for your Link page and account.</p><button className="settings-row" onClick={() => { setModal("profile"); }}><span className="settings-row-icon">◉</span><span><strong>Profile details</strong><small>Display name, username and bio</small></span><span className="settings-chevron">›</span></button><button className="settings-row" onClick={() => setModal("theme")}><span className="settings-row-icon">◐</span><span><strong>Dashboard theme</strong><small>Colors used only in your workspace</small></span><span className="settings-chevron">›</span></button><div className="settings-actions"><Button variant="secondary" onClick={() => { void api("/auth/logout", { method: "POST" }).catch(() => undefined).finally(() => window.location.assign("/login")); }}>Sign out</Button></div></div></Modal>}
  {modal === "profile" && <Modal title="Edit your profile" onClose={() => setModal(null)}><form className="form-stack" onSubmit={(event) => void saveProfile(event)}><Field label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={80}/><Field label="Username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={30} hint="3–30 letters, numbers or hyphens."/><div className={`username-feedback username-${usernameStatus}`} aria-live="polite">{usernameStatus === "checking" ? "Checking availability…" : usernameStatus === "available" ? `Available · ${window.location.host}/${username.trim().toLowerCase()}` : usernameStatus === "taken" ? "This username is already taken. Try a different one." : usernameStatus === "invalid" ? "Use 3–30 letters, numbers or hyphens; no spaces." : usernameStatus === "error" ? "Could not check availability. Try again shortly." : "Your public link will use this username."}{usernameStatus === "taken" && <div className="username-suggestions">{[`${username.trim().toLowerCase().replace(/-+$/,"")}-dev`, `${username.trim().toLowerCase().replace(/-+$/,"")}-07`].map((suggestion) => <button key={suggestion} type="button" onClick={() => setUsername(suggestion.slice(0,30))}>{suggestion}</button>)}</div>}</div><label className="field">Short bio<textarea rows={4} value={bio} onChange={(event) => setBio(event.target.value)} maxLength={280} placeholder="A little bit about you..." style={{ resize: "vertical" }}/><small>{bio.length}/280 characters</small></label><div className="form-actions"><Button type="button" onClick={() => setModal(null)}>Cancel</Button><Button variant="primary" type="submit">Save profile</Button></div></form></Modal>}
  <Toast message={toast} onClose={() => setToast("")}/>{mobileMenuOpen && <button className="mobile-nav-backdrop" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />}</div>;
}
