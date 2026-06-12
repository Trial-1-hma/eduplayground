// Use the hostname the page was opened with, so the app also works when a
// friend opens it from another device on the same network (http://<your-ip>:3000).
const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

export const API_URL = `http://${host}:5000`;
export const WS_URL = `ws://${host}:5000/ws/battle`;
