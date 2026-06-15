import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../assets/logo.png'

import heroImg    from '../assets/images/hero.jpg'
import walletImg  from '../assets/images/wallet.jpg'
import hospitalImg from '../assets/images/hospital.jpg'
import claimsImg  from '../assets/images/claims.jpg'
import secureImg  from '../assets/images/secure.jpg'
import trustedImg from '../assets/images/trusted.jpg'
import mobileImg  from '../assets/images/mobile.jpg'

/* ─── CSS variables injected once at root ─────────────────────────────────── */
const ROOT_VARS = `
  :root {
    --s0:  #0D1117;
    --s1:  #161B22;
    --s2:  #21262D;
    --t4:  #2DD4BF;
    --t6:  #0D9488;
    --t8:  #065F56;
    --tg:  rgba(45,212,191,0.13);
    --ink: #F0F6FC;
    --ink-muted: #8B949E;
    --border: #30363D;
    --orange: #F97316;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--s0); color: var(--ink); }
`

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }

const insuranceTypes = [
  { icon: '🏥', label: 'Health' },
  { icon: '🚗', label: 'Auto' },
  { icon: '🏠', label: 'Home' },
  { icon: '✈️', label: 'Travel' },
  { icon: '💼', label: 'Business' },
  { icon: '❤️', label: 'Life' },
]

/* ─── Shared style helpers ─────────────────────────────────────────────────── */
const S = {
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'var(--s2)', border: '1px solid var(--border)',
    borderRadius: 999, padding: '6px 14px',
    fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)',
  },
  card: {
    background: 'var(--s1)', border: '1px solid var(--border)',
    borderRadius: 20, overflow: 'hidden',
  },
  tealBtn: {
    background: 'linear-gradient(135deg, var(--t4), var(--t6))',
    color: '#0D1117', fontWeight: 800,
    border: 'none', borderRadius: 14, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8,
  },
  ghostBtn: {
    background: 'transparent', color: 'var(--ink)',
    border: '1px solid var(--border)',
    fontWeight: 600, borderRadius: 14, cursor: 'pointer',
  },
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--s0)', color: 'var(--ink)', fontSize: 16 }}>
      <style>{ROOT_VARS}</style>

      {/* NAV */}
      <header style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--t4), var(--t6))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="icon" style={{ color: '#0D1117', fontSize: 18 }}>shield</span>
            </div>
            <span style={{ fontWeight: 900, fontSize: 20, color: 'var(--t4)', letterSpacing: -0.5 }}>PAYG</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/auth" style={{ color: 'var(--ink-muted)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
            <button onClick={() => navigate('/auth')} style={{
              ...S.tealBtn, padding: '10px 20px', fontSize: 14,
            }}>
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main style={{ paddingTop: 64 }}>

        {/* HERO */}
        <section style={{ padding: '96px 24px 80px', position: 'relative', overflow: 'hidden' }}>
          {/* ambient glow */}
          <div style={{
            position: 'absolute', top: -160, left: '50%', transform: 'translateX(-50%)',
            width: 700, height: 700,
            background: 'radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 56, alignItems: 'center', position: 'relative' }}>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              <motion.span variants={fadeUp} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)',
                color: 'var(--t4)', borderRadius: 999, padding: '5px 14px',
                fontSize: 12, fontWeight: 700, letterSpacing: 0.5, marginBottom: 20,
              }}>
                📱 Pay for Insurance with Airtime
              </motion.span>

              <motion.h1 variants={fadeUp} style={{
                fontSize: 'clamp(38px,6vw,64px)', fontWeight: 900, lineHeight: 1.08,
                marginBottom: 20, letterSpacing: -2,
              }}>
                PAYG<br />
                <span style={{ background: 'linear-gradient(90deg, var(--t4), var(--t6))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Paid with Airtime.
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} style={{
                color: 'var(--ink-muted)', fontSize: 18, lineHeight: 1.6,
                marginBottom: 28, maxWidth: 440,
              }}>
                Buy health, auto, home, travel, and more — using the airtime already on your phone. No bank account needed.
              </motion.p>

              <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                {insuranceTypes.map(t => (
                  <span key={t.label} style={S.pill}>{t.icon} {t.label}</span>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/auth')} style={{
                  ...S.tealBtn, padding: '14px 28px', fontSize: 15,
                }}>
                  <span className="icon-o">bolt</span>
                  Start with Airtime
                </button>
                <button onClick={() => navigate('/auth')} style={{
                  ...S.ghostBtn, padding: '14px 28px', fontSize: 15,
                }}>
                  Sign In
                </button>
              </motion.div>
            </motion.div>

            {/* HERO IMAGE */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              style={{ position: 'relative' }}
            >
              <div style={{
                position: 'absolute', inset: -2,
                borderRadius: 28, border: '1px solid rgba(45,212,191,0.2)',
                background: 'linear-gradient(135deg, rgba(45,212,191,0.07), transparent)',
              }} />
              <img src={heroImg} alt="" style={{
                borderRadius: 24, width: '100%', height: 460, objectFit: 'cover', display: 'block',
              }} />
              {/* Floating badge */}
              <div style={{
                position: 'absolute', bottom: 20, left: 20,
                background: 'var(--s0)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '12px 18px',
                display: 'flex', alignItems: 'center', gap: 12,
                backdropFilter: 'blur(12px)',
              }}>
                <span style={{ fontSize: 28 }}>📱</span>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 2 }}>Paid with airtime</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>MTN · Airtel · Glo · 9mobile</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ padding: '80px 24px', background: 'var(--s1)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, marginBottom: 10, letterSpacing: -1 }}>
              How PAYG Works
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--ink-muted)', fontSize: 17, marginBottom: 48 }}>
              Three steps to coverage — no paperwork, no bank visits.
            </motion.p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 24, textAlign: 'left' }}>
              {[
                { title: 'Choose Your Coverage', desc: 'Pick from health, auto, home, travel, life insurance, and more — all in one place.' },
                { title: 'Pay with Airtime',      desc: 'Deduct your premium directly from your airtime balance. Works on all major Nigerian networks.' },
                { title: 'Stay Protected',         desc: 'Your policy activates instantly. File claims, track coverage, and renew — all from your phone.' },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} style={{
                  background: 'var(--s2)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: 28,
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* subtle teal corner */}
                  <div style={{
                    position: 'absolute', top: -30, right: -30, width: 100, height: 100,
                    background: 'radial-gradient(circle, var(--tg) 0%, transparent 70%)',
                  }} />
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36, borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--t4), var(--t6))',
                    color: '#0D1117', fontWeight: 900, fontSize: 14, marginBottom: 16,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 8, color: 'var(--ink)' }}>{item.title}</h3>
                  <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.65 }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* FEATURES */}
        <section style={{ padding: '96px 24px' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            style={{ maxWidth: 1100, margin: '0 auto' }}>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
              <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, marginBottom: 10, letterSpacing: -1 }}>Everything You Need</h2>
              <p style={{ color: 'var(--ink-muted)', fontSize: 17 }}>Built for Nigerians who want real coverage without the complexity.</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
              {[
                { img: walletImg,   title: 'Airtime Wallet',     desc: 'Top up anytime using your phone credit. No bank card, no stress — just your SIM.' },
                { img: hospitalImg, title: 'All Insurance Types', desc: 'One app for health, motor, home, travel, and life insurance from trusted providers.' },
                { img: claimsImg,   title: 'Instant Claims',     desc: 'Submit and track claims from your phone. Get updates in real time.' },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} style={{
                  ...S.card, transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(45,212,191,0.35)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <img src={item.img} alt="" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                  <div style={{ padding: '20px 22px 24px' }}>
                    <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>{item.title}</h3>
                    <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.65 }}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* TRUST */}
        <section style={{ padding: '80px 24px', background: 'var(--s1)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {[
              { img: secureImg,  title: 'Secure Transactions', desc: 'Every airtime payment is encrypted and verified before your policy is issued.' },
              { img: trustedImg, title: 'Licensed Providers',  desc: 'All insurance plans are from NAICOM-licensed Nigerian insurers you can trust.' },
              { img: mobileImg,  title: '100% Mobile',         desc: 'Buy, manage, and claim your insurance entirely from your phone — anytime, anywhere.' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} style={{ ...S.card }}>
                <img src={item.img} alt="" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                <div style={{ padding: '18px 22px 22px' }}>
                  <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{item.title}</h3>
                  <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* NETWORK LOGOS */}
        <section style={{ padding: '52px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 24 }}>
              Works with all Nigerian networks
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 36 }}>
              {['MTN', 'Airtel', 'Glo', '9mobile'].map(n => (
                <span key={n} style={{ fontSize: 22, fontWeight: 900, color: 'var(--border)', letterSpacing: -0.5 }}>{n}</span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '96px 24px' }}>
          <div style={{
            maxWidth: 900, margin: '0 auto', textAlign: 'center',
            background: 'var(--s1)',
            border: '1px solid rgba(45,212,191,0.25)',
            borderRadius: 28, padding: '72px 40px',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* glow bloom */}
            <div style={{
              position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
              width: 500, height: 300,
              background: 'radial-gradient(ellipse, rgba(45,212,191,0.14) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <span style={{ fontSize: 48, display: 'block', marginBottom: 20 }}>📱</span>
            <h2 style={{
              fontSize: 'clamp(30px,5vw,52px)', fontWeight: 900, lineHeight: 1.1,
              marginBottom: 16, letterSpacing: -1.5,
            }}>
              Protected in minutes.<br />
              <span style={{ background: 'linear-gradient(90deg,var(--t4),var(--t6))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Paid with airtime.
              </span>
            </h2>
            <p style={{ color: 'var(--ink-muted)', fontSize: 17, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
              Join thousands of Nigerians who already cover themselves — no bank account, no paperwork, just your phone.
            </p>
            <button onClick={() => navigate('/auth')} style={{
              ...S.tealBtn, padding: '16px 36px', fontSize: 16,
            }}>
              Get Covered with Airtime →
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <img src={logo} style={{ width: 18, height: 18, objectFit: 'contain' }} alt="" />
          <span style={{ fontWeight: 800, color: 'var(--ink)', fontSize: 14 }}>PAYG</span>
        </div>
        <p style={{ color: 'var(--ink-muted)', fontSize: 13 }}>
          © {new Date().getFullYear()} PAYG. Pay-as-you-go insurance, powered by airtime.
        </p>
      </footer>
    </div>
  )
}