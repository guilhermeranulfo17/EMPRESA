// Servidor de inscrições (função outside-api no Supabase). VITE_BACKEND_URL troca o endereço.
const BACKEND = import.meta.env.VITE_BACKEND_URL || "https://bowffbnelsjurbhmgxlg.supabase.co/functions/v1/outside-api";

export const API = `${BACKEND.replace(/\/$/, "")}/api`;
