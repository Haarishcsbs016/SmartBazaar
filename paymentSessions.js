const STORAGE_KEY = 'market-sphere-payment-sessions';

const readSessions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeSessions = (sessions) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const createPaymentSession = (payload) => {
  const id = `PS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const sessions = readSessions();
  sessions[id] = { id, status: 'pending', createdAt: Date.now(), ...payload };
  writeSessions(sessions);
  return sessions[id];
};

export const getPaymentSession = (id) => {
  const sessions = readSessions();
  return sessions[id] || null;
};

export const updatePaymentSession = (id, patch) => {
  const sessions = readSessions();
  if (!sessions[id]) {
    return null;
  }

  sessions[id] = { ...sessions[id], ...patch, updatedAt: Date.now() };
  writeSessions(sessions);
  return sessions[id];
};