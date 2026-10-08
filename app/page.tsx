/* Native images keep the supplied, pre-sized challenge photos without an image optimizer. */
/* eslint-disable @next/next/no-img-element */
import { DownloadButton } from "./download-button";
import { siteName } from "./site";

const photos = [
  { src: "/images/desktop/image-woman-in-videocall.jpg", alt: "A woman smiling at her laptop during a video call." },
  { src: "/images/desktop/image-women-videochatting.jpg", alt: "Three women laughing together at a video chat on a phone." },
  { src: "/images/desktop/image-men-in-meeting.jpg", alt: "A man in a video meeting with a colleague on his laptop." },
  { src: "/images/desktop/image-man-texting.jpg", alt: "A man smiling as he texts on his phone." },
];

function SectionNumber({ value }: { value: string }) {
  return (
    <div className="section-number" aria-hidden="true">
      <span>{value}</span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <header className="site-header">
        <img src="/images/logo.svg" width="118" height="28" alt="meet" />
      </header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-inner">
            <div className="faces faces-left" aria-hidden="true" />
            <div className="hero-copy">
              <h1 id="hero-title">Group Chat <span className="line">for Everyone</span></h1>
              <p>Meet makes it easy to connect with others face-to-face virtually and collaborate across any device.</p>
              <div className="actions">
                <DownloadButton variant="blue" />
                <a className="button button-purple" href="#what-is-it">What is it?</a>
              </div>
            </div>
            <div className="faces faces-right" aria-hidden="true" />
          </div>
        </section>

        <section id="what-is-it" className="features" aria-labelledby="features-title" tabIndex={-1}>
          <SectionNumber value="01" />
          <ul className="collage" aria-label="People using Meet">
            {photos.map(photo => (
              <li key={photo.src}><img src={photo.src} width="510" height="484" alt={photo.alt} loading="lazy" /></li>
            ))}
          </ul>
          <div className="features-copy">
            <p className="eyebrow">Built for modern use</p>
            <h2 id="features-title">Smarter meetings, all in one place</h2>
            <p>Send messages, share files, show your screen, and record your meetings — all in one workspace. Control who can join with invite-only team access, data encryption, and data export.</p>
          </div>
        </section>

        <section className="cta" aria-labelledby="cta-title">
          <SectionNumber value="02" />
          <div className="cta-band">
            <div className="cta-inner">
              <h2 id="cta-title">Experience more together</h2>
              <p>Stay connected with reliable HD meetings and unlimited one-on-one and group video sessions.</p>
              <div className="cta-action"><DownloadButton variant="purple" /></div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span className="site-name">{siteName}</span>.{" "}
        <span className="footer-part">Challenge by <a href="https://www.frontendmentor.io/challenges/meet-landing-page-rbTDS6OUR">Frontend Mentor</a>.</span>{" "}
        <span className="footer-part">Built by <a href="https://royeradames.com">Royer Adames</a>.</span>
      </footer>
    </>
  );
}
