import { useEffect, useMemo, useState } from "react";
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

export function meta() {
  return [{ title: "Link — Creator dashboard" }, { name: "description", content: "Your online home, all in one link." }];
}

export default function Home() {
  const [profile, setProfile] = useState<Profile>({ username: "harshkumar", displayName: "Harsh Kumar", bio: "Developer, builder & curious mind. Making useful things for the internet.", published: true, template: "stack", theme: "sage", linkStyle: "soft", links: starterLinks });
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<"link" | "profile" | "appearance" | null>(null);
  const [editing, setEditing] = useState<LinkItem | null>(null);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkKind, setLinkKind] = useState("Website");
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [template, setTemplate] = useState("stack");
  const [theme, setTheme] = useState("sage");
  const [baseColor, setBaseColor] = useState("#f7f8f3");
  const [workspaceColor, setWorkspaceColor] = useState("#f5f6f2");
  const [appearanceLoaded, setAppearanceLoaded] = useState(false);
  const [linkStyle, setLinkStyle] = useState("soft");
  const [device, setDevice] = useState("iphone");
  const [showDesigns, setShowDesigns] = useState(true);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("link-appearance");
      if (saved) {
        const value = JSON.parse(saved) as { template?: string; theme?: string; linkStyle?: string; device?: string; baseColor?: string; workspaceColor?: string };
        if (value.template) setTemplate(value.template);
        if (value.theme) setTheme(value.theme);
        if (value.linkStyle) setLinkStyle(value.linkStyle);
        if (value.device) setDevice(value.device);
        if (value.baseColor) setBaseColor(value.baseColor);
        if (value.workspaceColor) setWorkspaceColor(value.workspaceColor);
      }
    } catch { /* keep defaults when saved preferences are unavailable */ }
    setAppearanceLoaded(true);
  }, []);

  useEffect(() => {
    if (!appearanceLoaded) return;
    window.localStorage.setItem("link-appearance", JSON.stringify({ template, theme, linkStyle, device, baseColor, workspaceColor }));
  }, [appearanceLoaded, template, theme, linkStyle, device, baseColor, workspaceColor]);

  useEffect(() => {
    let cancelled = false;
    api<Profile>("/profile/me").then((data) => { if (!cancelled) { setProfile(data); setDisplayName(data.displayName); setUsername(data.username); setBio(data.bio); if (data.template) setTemplate(data.template); if (data.theme) setTheme(data.theme); if (data.linkStyle) setLinkStyle(data.linkStyle); if (data.baseColor) setBaseColor(data.baseColor); } }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  function updateAppearance(change: { template?: string; theme?: string; linkStyle?: string; baseColor?: string }) {
    if (change.template) setTemplate(change.template);
    if (change.theme) setTheme(change.theme);
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

  return <div className={`app-shell theme-${theme}`} style={{ "--workspace-bg": workspaceColor, background: workspaceColor } as React.CSSProperties}><div className="layout">
    <aside className="sidebar"><Brand /><div className="workspace-switch"><Avatar name={profile.displayName} /><div><div className="workspace-label">WORKSPACE</div><div className="workspace-name">{profile.displayName}'s space</div></div><span className="chevron">⌄</span></div>
      <div className="nav-group"><div className="nav-label">YOUR SPACE</div><a className="nav-link active" href="#overview"><span className="nav-icon">▦</span>Overview</a><a className="nav-link" href="#links"><span className="nav-icon">↗</span>My links <span className="nav-count">{profile.links.length}</span></a><a className="nav-link" href="#analytics"><span className="nav-icon">▥</span>Analytics</a><button className="nav-link" onClick={() => setModal("appearance")}><span className="nav-icon">◐</span>Appearance & themes</button><button className="nav-link" onClick={() => setModal("profile")}><span className="nav-icon">◉</span>Edit profile</button></div>
      <div className="nav-group"><div className="nav-label">ACCOUNT</div><button className="nav-link" onClick={() => setModal("appearance")}><span className="nav-icon">⚙</span>Settings</button><button className="nav-link" onClick={() => flash("Help center is coming next.")}><span className="nav-icon">?</span>Help & support</button></div>
      <div className="sidebar-spacer" /><div className="sidebar-promo"><h3>A little more Link ✦</h3><p>Custom themes, deeper insights and your own domain. More room to make it yours.</p><Button variant="primary" onClick={() => flash("You're on the early-access list.")}>Explore Link Pro ↗</Button></div>
    </aside>
    <main className="main"><header className="topbar"><div className="breadcrumb">Workspace <span style={{ margin: "0 8px", color: "#c4c5bd" }}>/</span> <strong>Overview</strong></div><div className="topbar-actions"><button className="icon-button" aria-label="Notifications" onClick={() => flash("You're all caught up.")}>♧</button><button className="icon-button" aria-label="Help" onClick={() => flash("Help center is coming next.")}>?</button><button className="icon-button" aria-label="Sign out" title="Sign out" onClick={() => { void api("/auth/logout", { method: "POST" }).catch(() => undefined).finally(() => window.location.assign("/login")); }}>↪</button><div className="user-menu"><Avatar name={profile.displayName} />{profile.displayName}<span className="chevron">⌄</span></div></div></header>
      <div className="content" id="overview">
        <div className="page-heading"><div><div className="eyebrow">YOUR CREATOR SPACE</div><h1>Your little corner<br className="desktop-break" /> of the internet.</h1><p>Everything you share, all in one place. Here's how you're doing.</p></div><div className="heading-actions"><Button onClick={() => window.open(`/${profile.username}`, "_blank", "noopener,noreferrer")} icon="◉">Preview page</Button><Button variant="primary" onClick={openNewLink} icon="＋">Add a link</Button></div></div>
        <section className="profile-banner"><Avatar name={profile.displayName} size="lg" /><div className="profile-info"><div className="profile-name">{profile.displayName}</div><div className="profile-url">link.to/<strong>{profile.username}</strong> · Public profile</div></div><div className="banner-actions"><div className="live-status"><span className="live-dot" />{profile.published ? "Published" : "Private"}</div><Button onClick={() => { setDisplayName(profile.displayName); setUsername(profile.username); setBio(profile.bio); setModal("profile"); }}>Edit profile ↗</Button></div></section>
        <section className="stats-grid" aria-label="Performance overview"><Card className="stat-card"><div className="stat-top"><span>Profile views</span><span className="stat-icon">◉</span></div><div className="stat-value">8,492</div><div className="stat-foot"><span className="positive">↗ 12.8%</span> vs. last month</div></Card><Card className="stat-card"><div className="stat-top"><span>Link clicks</span><span className="stat-icon">↗</span></div><div className="stat-value">{number(clicks)}</div><div className="stat-foot"><span className="positive">↗ 8.2%</span> vs. last month</div></Card><Card className="stat-card"><div className="stat-top"><span>Click-through rate</span><span className="stat-icon">％</span></div><div className="stat-value">24.6%</div><div className="stat-foot"><span className="positive">↗ 2.4%</span> vs. last month</div></Card></section>
        <div className="links-layout"><section id="links"><SectionHeading title={`Your links (${profile.links.length})`} subtitle="Make it easy for people to find your best stuff." action={<Button onClick={openNewLink} icon="＋">Add new</Button>} /><Card className="links-card"><div className="card-heading"><strong>All links</strong><span className="muted-small">{activeLinks.length} active · <button className="button-ghost" style={{ padding: 0, minHeight: 0, fontSize: 10 }} onClick={() => { if (showSearch) { setSearch(""); setShowSearch(false); } else { setShowSearch(true); } }}>{showSearch ? "Close search" : "Search links"}</button></span></div>{showSearch && <div style={{ padding: "10px 16px" }}><Field aria-label="Search links" label="Search links" placeholder="Search by title or URL" value={search} onChange={(event) => setSearch(event.target.value)} /></div>}{filteredLinks.map((link) => <div className={`link-row ${link.enabled ? "" : "off"}`} key={link.id}><div className="link-symbol">{iconFor(link.kind)}</div><div className="link-details"><div className="link-title">{link.title}</div><div className="link-url">{link.url}</div></div><div className="link-metrics"><div className="link-clicks">{number(link.clicks)}</div><div className="link-click-label">clicks</div></div><button className={`toggle ${link.enabled ? "on" : ""}`} aria-label={`${link.enabled ? "Disable" : "Enable"} ${link.title}`} aria-pressed={link.enabled} onClick={() => void toggleLink(link)}><span /></button><button className="icon-button" aria-label={`Edit ${link.title}`} onClick={() => openEditLink(link)}>✎</button><button className="icon-button" aria-label={`Delete ${link.title}`} onClick={() => void deleteLink(link)}>×</button></div>)}{filteredLinks.length === 0 && <div className="empty-state">No links match your search. Add a link to get started.</div>}</Card>
          <Card className="activity-card" id="analytics"><div className="activity-head"><div><div className="activity-title">Your audience is finding you</div><div className="activity-subtitle">Profile views over the last 7 days</div></div><select className="period-select" aria-label="Analytics period" onChange={(event) => flash(`Showing ${event.target.value}.`)}><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option></select></div><div className="chart" role="img" aria-label="Illustrative profile views chart increasing through the week">{[35,48,41,65,54,82,69,96,72,88,61,100,77,91,58,72,86,66,97,76,84].map((height, index) => <div className="bar-group" key={index}><span className={index % 3 === 1 ? "bar strong" : "bar"} style={{ height: `${height}%` }} /></div>)}</div><div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></Card>
        </section>
        <aside className="preview-card card"><div className="preview-wrap"><div className="preview-top"><strong>Live preview</strong><span className="preview-live">● {profile.published ? "PUBLISHED" : "PRIVATE"}</span></div><div className="preview-controls"><label>Device frame<select aria-label="Device frame" value={device} onChange={(event) => setDevice(event.target.value)}><option value="iphone">iPhone 17 Pro</option><option value="android">Android phone</option><option value="frameless">No device frame</option></select></label><button className="design-toggle" onClick={() => setShowDesigns((value) => !value)}>{showDesigns ? "Hide design options ↑" : "Customize design ↓"}</button></div>{showDesigns && <div className="quick-designs"><div className="quick-design-label">PAGE STYLE</div><div className="design-chip-row">{[{id:"stack",name:"Classic"},{id:"profile",name:"Creator"},{id:"cards",name:"Cards"},{id:"minimal",name:"Minimal"},{id:"gradient",name:"Gradient"}].map((item) => <button key={item.id} className={`design-chip ${template === item.id ? "selected" : ""}`} aria-pressed={template === item.id} onClick={() => updateAppearance({ template: item.id })}>{item.name}</button>)}</div><div className="quick-design-label">COLOR THEME</div><div className="theme-swatches">{[{id:"sage",name:"Sage",color:"#d9e8c5"},{id:"midnight",name:"Midnight",color:"#25283b"},{id:"blush",name:"Blush",color:"#f2d5d8"},{id:"ocean",name:"Ocean",color:"#c7e4ef"},{id:"lavender",name:"Lavender",color:"#ddd3f5"},{id:"sunshine",name:"Sunshine",color:"#f3df9b"}].map((item) => <button key={item.id} className={`theme-swatch ${theme === item.id ? "selected" : ""}`} aria-pressed={theme === item.id} title={item.name} aria-label={`${item.name} theme`} onClick={() => updateAppearance({ theme: item.id })}><span style={{background:item.color}} />{item.name}</button>)}</div><div className="base-color-control"><label htmlFor="quick-base-color">PAGE BACKGROUND</label><div className="base-color-row"><input id="quick-base-color" aria-label="Page background color" type="color" value={baseColor} onChange={(event) => updateAppearance({ baseColor: event.target.value }) /><span>{baseColor.toUpperCase()}</span><button type="button" onClick={() => updateAppearance({ baseColor: "#f7f8f3" })}>Reset</button></div></div><div className="quick-design-label">LINK BUTTONS</div><div className="design-chip-row">{[{id:"soft",name:"Soft cards"},{id:"outline",name:"Outlined"},{id:"solid",name:"Solid"}].map((item) => <button key={item.id} className={`design-chip ${linkStyle === item.id ? "selected" : ""}`} aria-pressed={linkStyle === item.id} onClick={() => updateAppearance({ linkStyle: item.id })}>{item.name}</button>)}</div></div>}<div className={`phone-frame device-${device} theme-${theme} template-${template} linkstyle-${linkStyle}`} style={{ "--preview-bg": baseColor, background: baseColor } as React.CSSProperties}><div className="phone-notch"><span /></div><div className="phone-body"><Avatar name={profile.displayName} size="lg" /><div className="phone-name" style={{ marginTop: 10 }}>{profile.displayName}</div><div className="phone-handle">@{profile.username}</div><p className="phone-bio">{profile.bio || "A little bit about me goes here."}</p>{activeLinks.slice(0, 6).map((link) => <div className="phone-link" key={link.id}><span className="phone-link-icon">{iconFor(link.kind)}</span><span className="phone-link-label">{link.title}</span><span className="phone-link-arrow">↗</span></div>)}{activeLinks.length === 0 && <p className="phone-bio">Turn on a link to show it on your page.</p>}<div className="phone-footer">Made with <span>link.</span></div></div></div><div className="preview-foot">Your layout and colors update instantly.</div><Button variant="secondary" style={{ width: "100%", marginTop: 12 }} onClick={() => void publish()}>{profile.published ? "Unpublish page" : "Publish page"}</Button></div></aside></div>
      </div>
    </main>
  </div>
  {modal === "link" && <Modal title={editing ? "Edit link" : "Add a new link"} onClose={() => setModal(null)}><form className="form-stack" onSubmit={(event) => void saveLink(event)}><Field label="Link title" placeholder="e.g. My portfolio" value={linkTitle} onChange={(event) => setLinkTitle(event.target.value)} required maxLength={70} /><Field label="Destination URL" placeholder="https://example.com" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} required type="text" hint="Use https://, mailto: or tel: links."/><label className="field">Category<select value={linkKind} onChange={(event) => setLinkKind(event.target.value)}><option>Website</option><option>Portfolio</option><option>Social</option><option>Project</option><option>Contact</option><option>Video</option><option>Store</option></select></label><div className="form-actions"><Button type="button" onClick={() => setModal(null)}>Cancel</Button><Button variant="primary" type="submit">{editing ? "Save changes" : "Add link"}</Button></div></form></Modal>}
  {modal === "appearance" && <Modal title="Customize your page" onClose={() => setModal(null)}><div className="appearance-modal"><p>Pick a layout, choose a color palette and adjust the link buttons. Your phone preview updates as you choose.</p><div className="appearance-group"><strong>Choose a layout</strong><div className="template-grid">{[{id:"stack",name:"Classic stack",desc:"Clean, familiar link list"},{id:"profile",name:"Creator profile",desc:"Big profile, editorial feel"},{id:"cards",name:"Card grid",desc:"Distinct visual cards"},{id:"minimal",name:"Minimal",desc:"Typography first"},{id:"gradient",name:"Gradient glow",desc:"Bold color background"}].map((item) => <button key={item.id} className={`template-option ${template === item.id ? "selected" : ""}`} aria-pressed={template === item.id} onClick={() => updateAppearance({ template: item.id })}><span className={`template-thumb thumb-${item.id}`}><i /><i /><i /></span><strong>{item.name}</strong><small>{item.desc}</small></button>)}</div></div><div className="appearance-group"><strong>Color palette</strong><div className="palette-grid">{[{id:"sage",name:"Sage",colors:["#d9e8c5","#f7f8f3","#45642d"]},{id:"midnight",name:"Midnight",colors:["#25283b","#171824","#e5dafa"]},{id:"blush",name:"Blush",colors:["#f2d5d8","#fff7f5","#a54f68"]},{id:"ocean",name:"Ocean",colors:["#c7e4ef","#f3fbff","#256c87"]},{id:"lavender",name:"Lavender",colors:["#ddd3f5","#faf7ff","#7554a7"]},{id:"sunshine",name:"Sunshine",colors:["#f3df9b","#fffaf0","#85651d"]}].map((item) => <button key={item.id} className={`palette-option ${theme === item.id ? "selected" : ""}`} aria-pressed={theme === item.id} onClick={() => updateAppearance({ theme: item.id })}><span className="palette-dots">{item.colors.map((color) => <i key={color} style={{background:color}} />)}</span><span>{item.name}</span>{theme === item.id && <b>✓</b>}</button>)}</div></div><div className="appearance-group"><strong>Workspace background</strong><p className="appearance-help">This changes the background of your dashboard, not just your public link page. Your cards stay crisp and readable.</p><div className="base-color-row base-color-row-large"><input aria-label="Dashboard background color" type="color" value={workspaceColor} onChange={(event) => setWorkspaceColor(event.target.value)} /><span>{workspaceColor.toUpperCase()}</span><button type="button" onClick={() => setWorkspaceColor("#f5f6f2")}>Reset to default</button></div><div className="base-color-presets">{["#f5f6f2","#ffffff","#f1eee7","#eef3f9","#f6edf0","#edf4ee","#eae8f4","#20232b"].map((color) => <button key={color} type="button" aria-label={`Set dashboard background ${color}`} title={color} className={workspaceColor.toLowerCase() === color ? "selected" : ""} style={{ background: color }} onClick={() => setWorkspaceColor(color)} />)}</div></div><div className="appearance-group"><strong>Public page background</strong><p className="appearance-help">Choose any background color instead of being locked to a preset. Your current accent colors stay in place.</p><div className="base-color-row base-color-row-large"><input aria-label="Custom page background" type="color" value={baseColor} onChange={(event) => updateAppearance({ baseColor: event.target.value })} /><span>{baseColor.toUpperCase()}</span><button type="button" onClick={() => updateAppearance({ baseColor: "#f7f8f3" })}>Reset to default</button></div><div className="base-color-presets">{["#f7f8f3","#ffffff","#f4f0e8","#f3f6ff","#fff4ee","#f0f7f4","#191a22","#f5f0ff"].map((color) => <button key={color} type="button" aria-label={`Set background ${color}`} title={color} className={baseColor.toLowerCase() === color ? "selected" : ""} style={{ background: color }} onClick={() => updateAppearance({ baseColor: color }) />)}</div></div><div className="appearance-group"><strong>Button style</strong><div className="design-chip-row">{[{id:"soft",name:"Soft cards"},{id:"outline",name:"Outlined"},{id:"solid",name:"Solid"}].map((item) => <button key={item.id} className={`design-chip ${linkStyle === item.id ? "selected" : ""}`} aria-pressed={linkStyle === item.id} onClick={() => updateAppearance({ linkStyle: item.id })}>{item.name}</button>)}</div></div><div className="appearance-group"><strong>Preview device</strong><div className="design-chip-row">{[{id:"iphone",name:"iPhone 17 Pro"},{id:"android",name:"Android"},{id:"frameless",name:"No frame"}].map((item) => <button key={item.id} className={`design-chip ${device === item.id ? "selected" : ""}`} onClick={() => setDevice(item.id)}>{item.name}</button>)}</div></div><div className="form-actions"><Button onClick={() => setModal(null)}>Done</Button></div></div></Modal>}
  {modal === "profile" && <Modal title="Edit your profile" onClose={() => setModal(null)}><form className="form-stack" onSubmit={(event) => void saveProfile(event)}><Field label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={80}/><Field label="Username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={30} hint="3–30 letters, numbers or hyphens."/><label className="field">Short bio<textarea rows={4} value={bio} onChange={(event) => setBio(event.target.value)} maxLength={280} placeholder="A little bit about you..." style={{ resize: "vertical" }}/><small>{bio.length}/280 characters</small></label><div className="form-actions"><Button type="button" onClick={() => setModal(null)}>Cancel</Button><Button variant="primary" type="submit">Save profile</Button></div></form></Modal>}
  <Toast message={toast} onClose={() => setToast("")}/></div>;
}
