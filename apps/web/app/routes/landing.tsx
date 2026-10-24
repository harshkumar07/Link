import { Link } from "react-router";
import { Brand, Button } from "../components/ui";
import "../styles.css";

export function meta() {
  return [
    { title: "Link — Everything you share, in one simple page" },
    { name: "description", content: "Bring your portfolio, social profiles, projects and contact details together in one beautiful, shareable page." },
  ];
}

export default function LandingPage() {
  return <main className="landing-page">
    <header className="landing-nav"><Brand /><nav><a href="#how-it-works">How it works</a><a href="#features">Features</a><Link to="/login">Sign in</Link><Link className="landing-nav-cta" to="/login?mode=register">Get started <span>↗</span></Link></nav></header>
    <section className="landing-hero">
      <div className="landing-copy"><div className="landing-eyebrow"><span /> YOUR WHOLE WORLD, ONE LINK</div><h1>Everything you share.<br/><em>One simple page.</em></h1><p>Give people one place to find your work, social profiles, projects, videos and ways to contact you. Make it yours in minutes.</p><div className="landing-actions"><Link className="landing-primary" to="/login?mode=register">Create your free page <span>↗</span></Link><a className="landing-secondary" href="#how-it-works">See how it works ↓</a></div><div className="landing-proof"><span className="landing-avatar-stack"><i>H</i><i>A</i><i>M</i></span><span>One link. All the things that make you, you.</span></div></div>
      <div className="landing-showcase" aria-label="Example creator profile preview"><div className="showcase-orbit orbit-one"/><div className="showcase-orbit orbit-two"/><div className="showcase-card"><div className="showcase-top"><span className="showcase-dot"/><span>YOUR PAGE</span><span className="showcase-more">•••</span></div><div className="showcase-avatar">A</div><h2>Alex Morgan</h2><div className="showcase-handle">@alexmorgan</div><p>Designer, maker and collector of curious ideas.</p><div className="showcase-link"><span className="showcase-icon purple">✳</span><span><b>Selected work</b><small>alexmorgan.design</small></span><span>↗</span></div><div className="showcase-link"><span className="showcase-icon green">⌘</span><span><b>GitHub projects</b><small>Things I’m building</small></span><span>↗</span></div><div className="showcase-link"><span className="showcase-icon peach">◎</span><span><b>Instagram</b><small>Bits of everyday life</small></span><span>↗</span></div><div className="showcase-link"><span className="showcase-icon blue">✉</span><span><b>Get in touch</b><small>Let's make something</small></span><span>↗</span></div><div className="showcase-brand">Made with <strong>link.</strong></div></div><div className="showcase-note"><span>✦</span> Your style, your space</div></div>
    </section>
    <section className="landing-benefits" id="features"><div><span className="benefit-icon">↗</span><h3>All your links, together</h3><p>Portfolio, socials, projects and contact details in one easy-to-share place.</p></div><div><span className="benefit-icon">◐</span><h3>Make it feel like you</h3><p>Choose a clean layout and a soft color palette that fits your style.</p></div><div><span className="benefit-icon">⌁</span><h3>Easy to keep updated</h3><p>Add, edit and reorder your links whenever something new is worth sharing.</p></div></section>
    <section className="landing-how" id="how-it-works"><div><div className="landing-eyebrow">GET STARTED IN MINUTES</div><h2>Your corner of the internet,<br/>without the busywork.</h2></div><div className="landing-steps"><div><span>01</span><section><b>Create your page</b><p>Choose a username and add a little about yourself.</p></section></div><div><span>02</span><section><b>Add what matters</b><p>Bring your favorite links together and pick a look you love.</p></section></div><div><span>03</span><section><b>Share it everywhere</b><p>Put your Link page in your bio, portfolio, resume or email signature.</p></section></div></div></section>
    <section className="landing-final"><div><div className="landing-eyebrow">READY WHEN YOU ARE</div><h2>Make one link go further.</h2><p>All the places people can find you, in one thoughtful page.</p></div><Link className="landing-primary" to="/login?mode=register">Build your page <span>↗</span></Link></section>
    <footer className="landing-footer"><Brand/><span>Your online presence, in one place.</span><Link to="/login">Sign in</Link></footer>
  </main>;
}
