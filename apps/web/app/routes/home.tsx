import { useMemo, useState } from "react";

type LinkItem = {
  id: number;
  title: string;
  url: string;
  kind: string;
  clicks: number;
  enabled: boolean;
};

const initialLinks: LinkItem[] = [
  { id: 1, title: "My portfolio", url: "harshkumar.dev", kind: "Portfolio", clicks: 1284, enabled: true },
  { id: 2, title: "Follow on Instagram", url: "instagram.com/harshcreates", kind: "Social", clicks: 936, enabled: true },
  { id: 3, title: "Latest project on GitHub", url: "github.com/harshkumar07", kind: "Project", clicks: 742, enabled: true },
  { id: 4, title: "Get in touch", url: "hello@harshkumar.dev", kind: "Contact", clicks: 318, enabled: false },
];

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
:root{font-family:'DM Sans',sans-serif;color:#20201f;background:#f7f7f5;font-synthesis:none;text-rendering:optimizeLegibility}
*{box-sizing:border-box}body{margin:0}button,input{font:inherit}button{cursor:pointer}
.link-app{min-height:100vh;background:#f7f7f5;color:#20201f}.shell{display:grid;grid-template-columns:244px minmax(0,1fr);min-height:100vh}
.sidebar{background:#fff;border-right:1px solid #e9e9e5;padding:26px 16px;display:flex;flex-direction:column;gap:34px}
.brand{display:flex;align-items:center;gap:10px;padding:0 12px;font:800 22px Manrope,sans-serif;letter-spacing:-1px}.brand-mark{width:31px;height:31px;background:#c8f169;border-radius:10px;display:grid;place-items:center;font-size:20px;color:#26311b}
.workspace{margin:0 8px;padding:13px 12px;border:1px solid #ecece8;border-radius:12px;display:flex;align-items:center;gap:10px}.avatar-small{width:33px;height:33px;display:grid;place-items:center;border-radius:50%;background:#f1d4c2;color:#704c3a;font-weight:700}.workspace-label{font-size:11px;color:#96968f;margin-bottom:3px}.workspace-name{font-weight:700;font-size:13px}.chevron{margin-left:auto;color:#8d8d86}
.nav-label{font-size:10px;letter-spacing:1.6px;font-weight:700;color:#a0a09a;padding:0 13px;margin-bottom:8px}.nav{display:grid;gap:4px}.nav-item{border:0;background:transparent;border-radius:10px;text-align:left;display:flex;align-items:center;gap:12px;padding:12px 13px;color:#777871;font-size:13px;font-weight:600}.nav-item .nav-icon{font-size:17px;width:20px;text-align:center}.nav-item.active{background:#f1f5e8;color:#343d24}.nav-item:hover{background:#f5f6f2}.nav-count{margin-left:auto;background:#e5edda;padding:3px 7px;border-radius:6px;font-size:11px}
.sidebar-bottom{margin-top:auto}.upgrade{background:#f7f7f4;border:1px solid #ebebe6;border-radius:13px;padding:16px}.upgrade-title{font:700 13px Manrope;margin-bottom:6px}.upgrade p{font-size:12px;color:#82827a;line-height:1.6;margin:0 0 12px}.upgrade button{background:#20201f;color:#fff;border:0;border-radius:8px;padding:10px 12px;width:100%;font-size:12px;font-weight:700}
.main{min-width:0}.topbar{height:76px;background:rgba(255,255,255,.7);border-bottom:1px solid #e9e9e5;display:flex;align-items:center;justify-content:space-between;padding:0 38px}.crumb{font-size:12px;color:#999a92}.crumb strong{color:#363731;font-weight:600}.top-actions{display:flex;align-items:center;gap:10px}.icon-button{height:36px;width:36px;border:1px solid #e8e8e3;border-radius:10px;background:#fff;color:#777;display:grid;place-items:center}.user-pill{display:flex;align-items:center;gap:9px;margin-left:8px;font-size:12px;font-weight:700}.user-pill .avatar-small{width:32px;height:32px}
.content{max-width:1440px;padding:36px 38px 54px;margin:0 auto}.heading-row{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:27px}.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:1.7px;color:#8e8f86;font-weight:700;margin-bottom:9px}.page-title{font:800 clamp(26px,3vw,34px) Manrope,sans-serif;letter-spacing:-1.5px;margin:0 0 8px}.subtitle{font-size:13px;color:#85867e;margin:0}.heading-actions{display:flex;gap:9px;align-items:center}.button-secondary,.button-primary{border-radius:10px;padding:11px 15px;font-size:12px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:8px}.button-secondary{background:#fff;border:1px solid #e5e5df;color:#3b3c36}.button-primary{background:#c8f169;border:1px solid #c8f169;color:#27301b}.button-primary:hover{background:#b9e65a}.button-secondary:hover{background:#fafaf7}
.profile-banner{display:flex;align-items:center;gap:15px;padding:17px 19px;background:#fff;border:1px solid #e8e8e3;border-radius:14px;margin-bottom:18px}.profile-photo{width:52px;height:52px;border-radius:50%;background:linear-gradient(140deg,#eed0ba,#d9a98a);display:grid;place-items:center;color:#694733;font:800 19px Manrope;flex-shrink:0}.profile-info{min-width:0}.profile-name{font:700 14px Manrope;margin-bottom:5px}.profile-url{font-size:12px;color:#8a8b83}.profile-url span{color:#688b37;font-weight:700}.banner-actions{margin-left:auto;display:flex;align-items:center;gap:12px}.live-status{display:flex;align-items:center;gap:6px;font-size:11px;color:#65863b;font-weight:700}.live-dot{height:6px;width:6px;border-radius:50%;background:#8ac344}
.stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:26px}.stat-card{background:#fff;border:1px solid #e8e8e3;border-radius:14px;padding:18px 19px;min-width:0}.stat-top{display:flex;align-items:center;justify-content:space-between;color:#81827b;font-size:12px}.stat-icon{width:31px;height:31px;border-radius:9px;background:#f4f5ef;display:grid;place-items:center;color:#5c6d40;font-size:15px}.stat-value{font:800 27px Manrope;letter-spacing:-1px;margin:13px 0 6px}.stat-foot{font-size:11px;color:#96978f}.positive{color:#608e2b;font-weight:700}
.section-row{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:13px}.section-title{font:800 17px Manrope;letter-spacing:-.5px;margin:0}.section-caption{font-size:11px;color:#989991;margin-top:5px}.links-layout{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(265px,.9fr);gap:18px;align-items:start}.links-card,.preview-card{background:#fff;border:1px solid #e8e8e3;border-radius:14px;overflow:hidden}.links-card-head{padding:17px 19px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f0f0ec}.links-card-head strong{font:700 13px Manrope}.muted-small{font-size:11px;color:#96978f}.link-row{padding:15px 18px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #f1f1ed}.link-row:last-child{border-bottom:0}.drag{color:#c4c5bd;letter-spacing:-3px;font-size:16px}.link-symbol{width:39px;height:39px;border-radius:11px;display:grid;place-items:center;background:#f4f4ef;font-size:17px;flex-shrink:0}.link-details{min-width:0;flex:1}.link-title{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:5px}.link-url{font-size:11px;color:#9a9b93;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.link-metrics{min-width:52px;text-align:right}.link-clicks{font-size:12px;font-weight:700}.link-click-label{font-size:10px;color:#a1a29b;margin-top:3px}.toggle{border:0;border-radius:20px;width:34px;height:20px;padding:3px;background:#e1e2dc;flex-shrink:0;transition:background .15s}.toggle span{width:14px;height:14px;background:#fff;display:block;border-radius:50%;transition:transform .15s;box-shadow:0 1px 2px #0002}.toggle.on{background:#a8d957}.toggle.on span{transform:translateX(14px)}.link-row.off .link-details,.link-row.off .link-metrics{opacity:.45}.empty-state{padding:35px;text-align:center;color:#8b8c84;font-size:12px}
.preview-wrap{padding:16px}.preview-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}.preview-top strong{font:700 13px Manrope}.preview-live{font-size:10px;color:#628b34;background:#f1f7e8;border-radius:5px;padding:5px 7px;font-weight:700}.phone{border:5px solid #252624;border-radius:27px;background:#fafaf7;overflow:hidden;max-width:270px;margin:0 auto;box-shadow:0 8px 22px #1d24110d}.phone-notch{height:18px;background:#252624;display:flex;justify-content:center;align-items:center}.phone-notch span{width:42px;height:5px;border-radius:8px;background:#555650}.phone-body{padding:19px 15px 17px;text-align:center}.phone-avatar{width:59px;height:59px;border-radius:50%;margin:0 auto 11px;background:linear-gradient(145deg,#e7c2a8,#bd8e70);display:grid;place-items:center;color:#64412e;font:800 19px Manrope;border:3px solid white;box-shadow:0 2px 8px #00000012}.phone-name{font:800 15px Manrope;margin-bottom:5px}.phone-handle{font-size:10px;color:#85867e;margin-bottom:9px}.phone-bio{font-size:10px;line-height:1.6;color:#73746d;margin:0 auto 17px;max-width:195px}.phone-link{display:flex;align-items:center;gap:9px;text-align:left;background:#fff;border:1px solid #e9e9e3;border-radius:10px;padding:10px;margin-bottom:8px;font-size:10px;font-weight:700;box-shadow:0 2px 4px #00000004}.phone-link-icon{width:25px;height:25px;border-radius:7px;background:#f2f4eb;display:grid;place-items:center;font-size:12px}.phone-link span:nth-child(2){flex:1}.phone-link .arrow{color:#a2a39a}.phone-footer{font:800 10px Manrope;letter-spacing:-.3px;color:#77786f;margin-top:16px}.phone-footer span{color:#7ca632}.preview-foot{font-size:10px;color:#999a92;text-align:center;margin:14px 0 1px}
.activity{margin-top:18px;background:#fff;border:1px solid #e8e8e3;border-radius:14px;padding:18px 19px}.activity-head{display:flex;justify-content:space-between;align-items:center}.activity-title{font:700 13px Manrope}.period{border:1px solid #e8e8e3;background:#fff;border-radius:8px;padding:7px 9px;font-size:10px;color:#777}.chart{height:112px;margin-top:20px;display:flex;align-items:end;gap:9px;padding:0 3px;border-bottom:1px solid #eeeeea;background:repeating-linear-gradient(to bottom,transparent 0,transparent 27px,#f1f1ed 28px)}.bar-group{height:100%;flex:1;display:flex;align-items:end;gap:3px;justify-content:center}.bar{width:min(13px,40%);border-radius:4px 4px 0 0;background:#dce8c5}.bar.strong{background:#b5dc79}.chart-labels{display:flex;justify-content:space-between;color:#a2a39b;font-size:10px;margin-top:9px}
.toast{position:fixed;right:22px;bottom:22px;background:#252624;color:#fff;padding:13px 17px;border-radius:11px;font-size:12px;box-shadow:0 10px 35px #0002;z-index:5}
@media(max-width:1100px){.shell{grid-template-columns:210px minmax(0,1fr)}.content{padding:28px 24px}.topbar{padding:0 24px}.links-layout{grid-template-columns:minmax(0,1.4fr) minmax(240px,.9fr)}.link-metrics{display:none}}
@media(max-width:820px){.shell{grid-template-columns:1fr}.sidebar{display:none}.topbar{height:62px;padding:0 18px}.content{padding:25px 18px 40px}.links-layout{grid-template-columns:1fr}.preview-card{max-width:none}.phone{max-width:300px}.heading-row{align-items:flex-start}.stats{gap:9px}.stat-card{padding:14px}.stat-value{font-size:23px}.banner-actions .live-status{display:none}}
@media(max-width:520px){.heading-row{display:block}.heading-actions{margin-top:18px}.heading-actions button{flex:1}.profile-banner{padding:13px;gap:11px}.profile-photo{width:44px;height:44px}.banner-actions{gap:0}.banner-actions .button-secondary{padding:9px;font-size:11px}.stats{grid-template-columns:1fr;gap:9px}.stat-card{display:grid;grid-template-columns:1fr auto;align-items:center;gap:0 10px}.stat-top{grid-column:1/-1}.stat-value{margin:8px 0 0}.stat-foot{align-self:end;text-align:right}.stat-icon{grid-column:2;grid-row:1}.stat-top>span:first-child{padding-right:40px}.section-row{align-items:flex-start}.section-title{font-size:16px}.link-row{gap:9px;padding:13px 11px}.link-symbol{width:34px;height:34px}.drag{display:none}.topbar{padding:0 14px}.user-pill{font-size:0}.crumb{font-size:11px}.content{padding-left:13px;padding-right:13px}.page-title{font-size:28px}.subtitle{font-size:12px}}
`;

const icons: Record<string, string> = {
  Portfolio: "↗",
  Social: "◎",
  Project: "⌘",
  Contact: "✉",
};

export function meta() {
  return [
    { title: "Link — Your online home, all in one link" },
    { name: "description", content: "Create a beautiful home for everything you make and share it with one simple link." },
    { name: "theme-color", content: "#f7f7f5" },
  ];
}

export default function Home() {
  const [links, setLinks] = useState(initialLinks);
  const [toast, setToast] = useState("");
  const enabledLinks = useMemo(() => links.filter((link) => link.enabled), [links]);
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function toggleLink(id: number) {
    setLinks((current) => current.map((link) => link.id === id ? { ...link, enabled: !link.enabled } : link));
  }

  function addLink() {
    const nextId = Math.max(0, ...links.map((link) => link.id)) + 1;
    setLinks((current) => [...current, { id: nextId, title: "New link", url: "yourwebsite.com", kind: "Link", clicks: 0, enabled: true }]);
    notify("New link added to your draft.");
  }

  return (
    <div className="link-app">
      <style>{styles}</style>
      <div className="shell">
        <aside className="sidebar">
          <div className="brand"><span className="brand-mark">↗</span>link.</div>
          <div className="workspace">
            <div className="avatar-small">H</div>
            <div><div className="workspace-label">WORKSPACE</div><div className="workspace-name">Harsh's space</div></div>
            <span className="chevron">⌄</span>
          </div>
          <div>
            <div className="nav-label">WORKSPACE</div>
            <nav className="nav" aria-label="Main navigation">
              <button className="nav-item active" onClick={() => notify("You're already on your overview.")}><span className="nav-icon">▦</span> Overview</button>
              <button className="nav-item" onClick={() => notify("Link manager is open below.")}><span className="nav-icon">↗</span> My links <span className="nav-count">{links.length}</span></button>
              <button className="nav-item" onClick={() => notify("Analytics preview is shown below.")}><span className="nav-icon">▥</span> Analytics</button>
              <button className="nav-item" onClick={() => notify("Appearance settings are coming soon.")}><span className="nav-icon">◐</span> Appearance</button>
            </nav>
          </div>
          <div>
            <div className="nav-label">PREFERENCES</div>
            <nav className="nav" aria-label="Preferences">
              <button className="nav-item" onClick={() => notify("Settings are coming soon.")}><span className="nav-icon">⚙</span> Settings</button>
              <button className="nav-item" onClick={() => notify("Help center is coming soon.")}><span className="nav-icon">？</span> Help & support</button>
            </nav>
          </div>
          <div className="sidebar-bottom">
            <div className="upgrade"><div className="upgrade-title">Make it yours ✦</div><p>Unlock custom themes, deeper insights and your own domain.</p><button onClick={() => notify("You're on the early-access list.")}>Explore Link Pro ↗</button></div>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="crumb">Workspace <span style={{ margin: "0 8px", color: "#c4c5bd" }}>/</span> <strong>Overview</strong></div>
            <div className="top-actions">
              <button className="icon-button" aria-label="Notifications" onClick={() => notify("You're all caught up.")}>♧</button>
              <button className="icon-button" aria-label="Help" onClick={() => notify("Help center is coming soon.")}>?</button>
              <div className="user-pill"><div className="avatar-small">H</div> Harsh <span className="chevron">⌄</span></div>
            </div>
          </header>

          <div className="content">
            <div className="heading-row">
              <div><div className="eyebrow">MONDAY, OCTOBER 26</div><h1 className="page-title">Your little corner of the internet.</h1><p className="subtitle">Everything you share, all in one place. Here's how you're doing.</p></div>
              <div className="heading-actions"><button className="button-secondary" onClick={() => notify("Your public page preview is on the right.")}>◉ Preview page</button><button className="button-primary" onClick={addLink}>＋ Add a link</button></div>
            </div>

            <section className="profile-banner" aria-label="Public profile">
              <div className="profile-photo">H</div>
              <div className="profile-info"><div className="profile-name">Harsh Kumar</div><div className="profile-url">link.to/<span>harshkumar</span> · Public profile</div></div>
              <div className="banner-actions"><div className="live-status"><span className="live-dot" /> Live</div><button className="button-secondary" onClick={() => notify("Profile editor is coming soon.")}>Edit profile ↗</button></div>
            </section>

            <section className="stats" aria-label="Performance overview">
              <div className="stat-card"><div className="stat-top"><span>Total profile views</span><span className="stat-icon">◉</span></div><div className="stat-value">8,492</div><div className="stat-foot"><span className="positive">↗ 12.8%</span> <span>vs. last month</span></div></div>
              <div className="stat-card"><div className="stat-top"><span>Link clicks</span><span className="stat-icon">↗</span></div><div className="stat-value">{totalClicks.toLocaleString("en-US")}</div><div className="stat-foot"><span className="positive">↗ 8.2%</span> <span>vs. last month</span></div></div>
              <div className="stat-card"><div className="stat-top"><span>Click-through rate</span><span className="stat-icon">％</span></div><div className="stat-value">24.6%</div><div className="stat-foot"><span className="positive">↗ 2.4%</span> <span>vs. last month</span></div></div>
            </section>

            <div className="links-layout">
              <section>
                <div className="section-row"><div><h2 className="section-title">Your links <span style={{ color: "#a2a39b", fontWeight: 500 }}>({links.length})</span></h2><div className="section-caption">Make it easy for people to find your best stuff.</div></div><button className="button-secondary" onClick={addLink}>＋ Add new</button></div>
                <div className="links-card">
                  <div className="links-card-head"><strong>All links</strong><span className="muted-small">{enabledLinks.length} active · Drag to reorder</span></div>
                  {links.map((link) => (
                    <div className={`link-row ${link.enabled ? "" : "off"}`} key={link.id}>
                      <span className="drag" aria-hidden="true">⠿</span>
                      <div className="link-symbol">{icons[link.kind] ?? "↗"}</div>
                      <div className="link-details"><div className="link-title">{link.title}</div><div className="link-url">{link.url}</div></div>
                      <div className="link-metrics"><div className="link-clicks">{link.clicks.toLocaleString("en-US")}</div><div className="link-click-label">clicks</div></div>
                      <button className={`toggle ${link.enabled ? "on" : ""}`} aria-label={`${link.enabled ? "Disable" : "Enable"} ${link.title}`} aria-pressed={link.enabled} onClick={() => toggleLink(link.id)}><span /></button>
                    </div>
                  ))}
                  {links.length === 0 && <div className="empty-state">Your links will show up here. Add your first one to get started.</div>}
                </div>

                <section className="activity">
                  <div className="activity-head"><div><div className="activity-title">Your audience is finding you</div><div className="section-caption">Profile views over the last 7 days</div></div><button className="period" onClick={() => notify("Showing the last 7 days.")}>Last 7 days⌄</button></div>
                  <div className="chart" role="img" aria-label="Bar chart showing profile views increasing through the week">
                    {[35,48,41,65,54,82,69,96,72,88,61,100,77,91,58,72,86,66,97,76,84].map((height, index) => <div className="bar-group" key={index}><span className={index % 3 === 1 ? "bar strong" : "bar"} style={{ height: `${height}%` }} /></div>)}
                  </div>
                  <div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                </section>
              </section>

              <aside className="preview-card">
                <div className="preview-wrap">
                  <div className="preview-top"><strong>Live preview</strong><span className="preview-live">● PUBLISHED</span></div>
                  <div className="phone">
                    <div className="phone-notch"><span /></div>
                    <div className="phone-body">
                      <div className="phone-avatar">H</div>
                      <div className="phone-name">Harsh Kumar</div>
                      <div className="phone-handle">@harshkumar</div>
                      <p className="phone-bio">Developer, builder & curious mind. Making useful things for the internet ✦</p>
                      {enabledLinks.slice(0, 5).map((link) => <div className="phone-link" key={link.id}><span className="phone-link-icon">{icons[link.kind] ?? "↗"}</span><span>{link.title}</span><span className="arrow">↗</span></div>)}
                      {enabledLinks.length === 0 && <div className="phone-bio">Turn on a link to show it on your page.</div>}
                      <div className="phone-footer">Made with <span>link.</span></div>
                    </div>
                  </div>
                  <div className="preview-foot">Changes to active links appear in this preview.</div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
