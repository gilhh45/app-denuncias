import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const COOLDOWN_MS = 60 * 1000;

export function AppProvider({ children }) {
  const [user, setUser] = useState({
    email: '',
    credPoints: 0,
    reportTimestamps: [],
    reportedUrls: [],
  });
  const [reports, setReports] = useState([]);

  function login(email) {
    setUser(u => ({ ...u, email }));
  }

  function logout() {
    setUser({ email: '', credPoints: 0, reportTimestamps: [], reportedUrls: [] });
    setReports([]);
  }

  function addReport(report) {
    const earned = Math.round(report.credScore * 0.3);
    setReports(prev => [report, ...prev]);
    setUser(u => ({
      ...u,
      credPoints: u.credPoints + earned,
      reportTimestamps: [...u.reportTimestamps, Date.now()],
      reportedUrls: [...u.reportedUrls, report.url.trim()],
    }));
    return earned;
  }

  function getRateLimitStatus() {
    const now = Date.now();
    const recentCount = user.reportTimestamps.filter(ts => now - ts < RATE_WINDOW_MS).length;
    const lastTs = user.reportTimestamps[user.reportTimestamps.length - 1] ?? 0;
    const cooldownMs = Math.max(0, lastTs + COOLDOWN_MS - now);
    return {
      isRateLimited: recentCount >= RATE_LIMIT,
      cooldownSec: Math.ceil(cooldownMs / 1000),
      inCooldown: cooldownMs > 0,
    };
  }

  function isDuplicateUrl(url) {
    return user.reportedUrls.includes(url.trim());
  }

  return (
    <AppContext.Provider value={{ user, reports, login, logout, addReport, getRateLimitStatus, isDuplicateUrl }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
