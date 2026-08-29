import { Link } from 'react-router-dom';
import { redirectToGoogleLogin } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import PixelCoin from '../components/PixelCoin.jsx';
import './Homepage.css';

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.02l7.73 6c4.51-4.18 7.09-10.36 7.09-17.49z"/>
      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24 24 0 000 21.56l7.98-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.9l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function Homepage() {
  const { user, isAuthenticated } = useAuth();

  function handleSignIn(e) {
    e.preventDefault();
    redirectToGoogleLogin();
  }

  return (
    <>
      <header>
        <div className="wrap header-row">
          <div className="brand">
            <PixelCoin className="coin" />
            Coin Quest
          </div>
          <nav>
            <a href="#features">How it works</a>
            {/* Client-side route now — no full reload, ProtectedRoute
                handles sending an unauthenticated visitor to Google login */}
            {isAuthenticated ? (
              <Link to="/dashboard" className="nav-profile">
                {user.picture ? (
                  <img className="nav-avatar" src={user.picture} alt="" />
                ) : (
                  <span className="nav-avatar nav-avatar-fallback">{user.name?.[0] ?? '?'}</span>
                )}
                {user.name}
              </Link>
            ) : (
              <Link to="/dashboard">AI Advisor</Link>
            )}
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <div>
            <div className="eyebrow">◆ Level up your savings</div>
            <h1>Track your gold.<br />Know where it <span className="hi">went.</span></h1>
            <p className="hero-sub">
              Log rent, groceries, travel, food and the odd trip — Coin Quest sorts every
              expense into categories, charts your progress month over month, and tells
              you straight: saving, or overspending.
            </p>
            <div className="hero-cta">
              {isAuthenticated ? (
                <Link className="btn" to="/dashboard">Continue to dashboard →</Link>
              ) : (
                <a className="btn" href="/oauth2/authorization/google" onClick={handleSignIn}>
                  <GoogleLogo />
                  Sign in with Google
                </a>
              )}
              <span className="hero-note">
                {isAuthenticated ? `Signed in as ${user.name}` : 'No card. No spreadsheet. Just entries.'}
              </span>
            </div>
          </div>

          <div className="pixel-frame quest-card">
            <div className="quest-title"><span className="dot"></span>JUNE — SAMPLE QUEST LOG</div>
            <div className="quest-row"><span className="quest-cat">🏠 Rent / House bills</span><span className="quest-amt">₹18,200</span></div>
            <div className="quest-row"><span className="quest-cat">🛒 Grocery / Toiletries</span><span className="quest-amt">₹6,450</span></div>
            <div className="quest-row"><span className="quest-cat">🚌 Regular travel</span><span className="quest-amt">₹2,180</span></div>
            <div className="quest-row"><span className="quest-cat">🍔 Eating out / Orders</span><span className="quest-amt">₹4,760</span></div>
            <div className="quest-row"><span className="quest-cat">🎒 Misc / Trips</span><span className="quest-amt">₹3,000</span></div>
            <div className="quest-total">
              <span>TOTAL SPENT</span>
              <span className="amt">₹34,590<span className="tag down">-4.2%</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="wrap">
          <div className="section-label">WHAT IT DOES</div>
          <div className="section-heading">Four categories in, a full financial picture out.</div>

          <div className="feature-grid">
            <div className="pixel-frame feature">
              <svg className="feature-icon" viewBox="0 0 8 8" width="36" height="36">
                <rect x="1" y="3" width="6" height="4" fill="#B79CFF" stroke="#2B2A4C" />
                <rect x="3" y="0" width="2" height="4" fill="#7B7FE0" />
                <rect x="0" y="2" width="8" height="1" fill="#2B2A4C" />
              </svg>
              <h3>Category entries</h3>
              <p>Log rent, groceries, travel, eating out and misc spends each month in seconds.</p>
            </div>
            <div className="pixel-frame feature">
              <svg className="feature-icon" viewBox="0 0 8 8" width="36" height="36">
                <rect x="0" y="5" width="1" height="3" fill="#7B7FE0" />
                <rect x="2" y="3" width="1" height="5" fill="#7B7FE0" />
                <rect x="4" y="4" width="1" height="4" fill="#B79CFF" />
                <rect x="6" y="1" width="1" height="7" fill="#FFD166" />
              </svg>
              <h3>Month-over-month charts</h3>
              <p>See spending trend lines by month, and isolate any single category for a closer look.</p>
            </div>
            <div className="pixel-frame feature">
              <svg className="feature-icon" viewBox="0 0 8 8" width="36" height="36">
                <rect x="1" y="1" width="6" height="6" fill="#E9F2FF" stroke="#2B2A4C" />
                <rect x="3" y="3" width="2" height="2" fill="#7B7FE0" />
              </svg>
              <h3>Your running average</h3>
              <p>A plain average across every month you've tracked, so no single month skews the picture.</p>
            </div>
            <div className="pixel-frame feature">
              <svg className="feature-icon" viewBox="0 0 8 8" width="36" height="36">
                <rect x="3" y="0" width="2" height="8" fill="#63D2A6" />
                <rect x="0" y="3" width="8" height="2" fill="#63D2A6" />
              </svg>
              <h3>Savings, or overspend</h3>
              <p>A clear number: how far under, or over, your average you landed this month.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="closing" id="advisor">
        <div className="wrap">
          <h2>Ask before you buy.<br /><span className="hi">Not after.</span></h2>
          {isAuthenticated ? (
            <Link className="btn light" to="/dashboard">Go to your dashboard →</Link>
          ) : (
            <a className="btn light" href="/oauth2/authorization/google" onClick={handleSignIn}>Sign in with Google →</a>
          )}
        </div>
      </section>

      <footer>
        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <span>COIN QUEST — EXPENSE TRACKER</span>
          <span>BUILT FOR MONTHLY CLARITY</span>
        </div>
      </footer>
    </>
  );
}
