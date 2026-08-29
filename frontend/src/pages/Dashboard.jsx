import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
} from 'chart.js';
import { useAuth } from '../context/AuthContext.jsx';
import { api, redirectToLogout } from '../api/client.js';
import PixelCoin from '../components/PixelCoin.jsx';
import AdvisorChat from '../components/AdvisorChat.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import './Dashboard.css';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

// Same five categories shown in the Homepage sample quest log — keep
// these in sync with whatever the backend's expense record shape uses.
const CATEGORIES = [
  { key: 'rent', label: 'Rent / House bills', icon: '🏠' },
  { key: 'groceries', label: 'Grocery / Toiletries', icon: '🛒' },
  { key: 'travel', label: 'Regular travel', icon: '🚌' },
  { key: 'food', label: 'Eating out / Orders', icon: '🍔' },
  { key: 'misc', label: 'Misc / Trips', icon: '🎒' }
];

/*
 * Assumed backend contract (adjust to match ExpenseTrackerController):
 *   GET /api/expenses
 *     -> [{ month: 'YYYY-MM', rent, groceries, travel, food, misc }, ...]
 *        one record per month the user has saved, any order.
 *   PUT /api/expenses/{month}
 *     body: { rent, groceries, travel, food, misc }
 *     -> the saved record, same shape as above (upsert).
 */

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatMonthLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
}

function formatRupees(n) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function zeroForm() {
  return CATEGORIES.reduce((acc, c) => ({ ...acc, [c.key]: '' }), {});
}

function monthTotalOf(record) {
  return CATEGORIES.reduce((sum, c) => sum + (Number(record[c.key]) || 0), 0);
}

export default function Dashboard() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState(zeroForm);
  const [status, setStatus] = useState('loading'); // loading | ready | saving | error
  const [error, setError] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const canvasRef = useRef(null);

  const loadHistory = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await api.get('/api/expenses');
      setHistory(Array.isArray(data) ? data : []);
      setStatus('ready');
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Whenever the selected month or the fetched history changes, load
  // whatever's already saved for that month into the form (or clear it).
  useEffect(() => {
    const existing = history.find((h) => h.month === month);
    setForm(
      existing
        ? CATEGORIES.reduce((acc, c) => ({ ...acc, [c.key]: String(existing[c.key] ?? '') }), {})
        : zeroForm()
    );
  }, [month, history]);

  const monthTotal = useMemo(
    () => CATEGORIES.reduce((sum, c) => sum + (Number(form[c.key]) || 0), 0),
    [form]
  );

  const runningAverage = useMemo(() => {
    if (history.length === 0) return null;
    const sum = history.reduce((acc, h) => acc + monthTotalOf(h), 0);
    return sum / history.length;
  }, [history]);

  const delta = runningAverage == null ? null : monthTotal - runningAverage;

  async function handleSave(e) {
    e.preventDefault();
    setStatus('saving');
    try {
      const payload = CATEGORIES.reduce((acc, c) => ({ ...acc, [c.key]: Number(form[c.key]) || 0 }), {});
      const saved = await api.put(`/api/expenses/${month}`, payload);
      setHistory((prev) => {
        const next = prev.filter((h) => h.month !== month);
        next.push(saved ?? { month, ...payload });
        return next.sort((a, b) => a.month.localeCompare(b.month));
      });
      setStatus('ready');
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }

  // Recreates the chart whenever history changes. Cleanup destroys the
  // exact instance this run created (via the `chart` closure, not a
  // shared ref) — that's what keeps this safe under Strict Mode's
  // mount→cleanup→mount double-invoke in dev, which otherwise leaves a
  // destroyed instance behind for the next run to call .update() on.
  useEffect(() => {
    if (!canvasRef.current) return;

    const sorted = [...history].sort((a, b) => a.month.localeCompare(b.month));
    const labels = sorted.map((h) => formatMonthLabel(h.month));
    const totals = sorted.map((h) => monthTotalOf(h));

    const chart = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total spent',
            data: totals,
            borderColor: '#7B7FE0',
            backgroundColor: 'rgba(123, 127, 224, 0.18)',
            borderWidth: 3,
            pointBackgroundColor: '#2B2A4C',
            pointBorderColor: '#FFD166',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 6,
            tension: 0,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#2B2A4C',
            titleFont: { family: 'Space Mono' },
            bodyFont: { family: 'Space Mono' },
            callbacks: { label: (ctx) => formatRupees(ctx.parsed.y) }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Space Mono', size: 11 } }
          },
          y: {
            grid: { color: '#E9F2FF' },
            ticks: {
              font: { family: 'Space Mono', size: 11 },
              callback: (v) => `₹${v}`
            }
          }
        }
      }
    });

    return () => {
      chart.destroy();
    };
  }, [history]);

  return (
    <>
      <header className="dash-header">
        <div className="wrap dash-header-row">
          <div className="brand">
            <PixelCoin className="coin" />
            Coin Quest
          </div>
          <div className="user-chip">
            {user?.picture ? (
              <img className="avatar" src={user.picture} alt="" />
            ) : (
              <span className="avatar avatar-fallback">{user?.name?.[0] ?? '?'}</span>
            )}
            <span className="user-name">{user?.name ?? 'Adventurer'}</span>
            <button className="btn ghost" onClick={() => setShowLogoutConfirm(true)}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="wrap dash-main">
        <div className="dash-toolbar">
          <div className="eyebrow">◆ Quest log</div>
          <label className="month-picker">
            <span>Month</span>
            <input
              type="month"
              value={month}
              max={currentMonth()}
              onChange={(e) => setMonth(e.target.value)}
            />
          </label>
        </div>

        {status === 'error' && (
          <div className="pixel-frame banner-error">
            Couldn't reach the ledger. {error?.message || 'Try again in a moment.'}
          </div>
        )}

        <div className="dash-grid">
          <form className="pixel-frame entry-card" onSubmit={handleSave}>
            <div className="quest-title">
              <span className="dot"></span>
              {formatMonthLabel(month)} — ENTRY
            </div>

            {CATEGORIES.map((c) => (
              <label key={c.key} className="entry-row">
                <span className="quest-cat">
                  {c.icon} {c.label}
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  placeholder="0"
                  value={form[c.key]}
                  onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))}
                />
              </label>
            ))}

            <div className="quest-total">
              <span>Total</span>
              <span className="amt">{formatRupees(monthTotal)}</span>
            </div>

            <button className="btn" type="submit" disabled={status === 'saving'}>
              {status === 'saving' ? 'Saving…' : 'Save entry'}
            </button>
          </form>

          <div className="dash-side">
            <div className="pixel-frame stat-card">
              <div className="section-label">Running average</div>
              <div className="stat-value">{runningAverage == null ? '—' : formatRupees(runningAverage)}</div>
              {delta != null && (
                <div className={`tag ${delta <= 0 ? 'down' : 'up'}`}>
                  {delta <= 0
                    ? `${formatRupees(Math.abs(delta))} under average`
                    : `${formatRupees(delta)} over average`}
                </div>
              )}
              {runningAverage == null && (
                <p className="stat-hint">Save a second month to unlock this.</p>
              )}
            </div>

            <div className="pixel-frame chart-card">
              <div className="section-label">Month over month</div>
              <div className="chart-wrap">
                <canvas ref={canvasRef} role="img" aria-label="Total spend by month" />
              </div>
              {history.length === 0 && status !== 'loading' && (
                <p className="stat-hint">No entries yet — save one to start the trend line.</p>
              )}
            </div>
          </div>
        </div>

        <AdvisorChat />
      </main>

      <ConfirmModal
        open={showLogoutConfirm}
        title="Log out?"
        message="You'll need to sign back in with Google to see your quest log again."
        confirmLabel="Log out"
        cancelLabel="Stay logged in"
        onConfirm={redirectToLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
