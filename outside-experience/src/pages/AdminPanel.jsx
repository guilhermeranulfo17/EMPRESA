import { useState, useEffect, useCallback, useMemo } from "react";
import { Lock, Users, UserCheck, Church, AlertTriangle, Search, Download, CheckCircle, XCircle, ArrowLeft, BarChart3, Plus, Star, QrCode, LayoutGrid, GraduationCap } from "lucide-react";
import LeitorQR from "@/pages/admin/LeitorQR";
import Equipes from "@/pages/admin/Equipes";
import Origens from "@/pages/admin/Origens";
import SchoolCandidaturas from "@/pages/admin/School";
import axios from "axios";
import { Toaster, toast } from "@/components/ui/sonner";

import { API } from "@/lib/api";

// a senha vai no cabeçalho, nunca no endereço
const adminApi = (password) => axios.create({ baseURL: `${API}/admin`, headers: { "x-admin-password": password } });

function EditionBar({ editions, selected, onSelect, onCreate, onMakeCurrent }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [dateLabel, setDateLabel] = useState("Em breve");
  const sel = editions.find((e) => e.slug === selected);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreate({ name: name.trim(), date_label: dateLabel.trim() || "Em breve", make_current: true });
    setName("");
    setDateLabel("Em breve");
    setCreating(false);
  };

  return (
    <div className="no-print border-b border-white/10 bg-[#0a0a0a] px-6 md:px-12 py-3 flex flex-wrap items-center gap-3" data-testid="edition-bar">
      <span className="text-[9px] tracking-[0.25em] uppercase text-neutral-500">Edição</span>
      <select
        value={selected || ""}
        onChange={(e) => onSelect(e.target.value)}
        data-testid="edition-select"
        className="bg-[#050505] border border-white/15 text-white text-xs px-3 py-2 outline-none focus:border-orange-500"
      >
        {editions.map((ed) => (
          <option key={ed.slug} value={ed.slug}>
            {ed.name} · {ed.date_label} ({ed.total_enrollments}){ed.is_current ? " · ATUAL" : ""}
          </option>
        ))}
      </select>
      {sel && !sel.is_current && (
        <button onClick={() => onMakeCurrent(sel.id)} data-testid="edition-make-current-btn" className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-orange-400 hover:text-orange-300 border border-orange-500/30 px-3 py-2">
          <Star size={11} /> Tornar atual
        </button>
      )}
      {sel?.is_current && (
        <span className="text-[9px] uppercase tracking-widest text-green-400 border border-green-500/30 px-2 py-1" data-testid="edition-current-badge">
          Recebendo inscrições
        </span>
      )}
      <div className="ml-auto">
        {creating ? (
          <form onSubmit={submit} className="flex flex-wrap items-center gap-2" data-testid="edition-create-form">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da edição" data-testid="edition-name-input" className="bg-[#050505] border border-white/15 text-white text-xs px-3 py-2 outline-none focus:border-orange-500 w-44" />
            <input value={dateLabel} onChange={(e) => setDateLabel(e.target.value)} placeholder="Data (ex.: 15 de agosto)" data-testid="edition-date-input" className="bg-[#050505] border border-white/15 text-white text-xs px-3 py-2 outline-none focus:border-orange-500 w-40" />
            <button type="submit" data-testid="edition-create-submit" className="bg-orange-500 text-black text-[10px] font-bold uppercase tracking-widest px-3 py-2">Criar</button>
            <button type="button" onClick={() => setCreating(false)} data-testid="edition-create-cancel" className="text-[10px] uppercase tracking-widest text-neutral-500 px-2">Cancelar</button>
          </form>
        ) : (
          <button onClick={() => setCreating(true)} data-testid="edition-new-btn" className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-neutral-300 hover:text-white border border-white/15 px-3 py-2">
            <Plus size={11} /> Nova edição
          </button>
        )}
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi(password).post("/login");
      onLogin(password);
    } catch {
      toast.error("Senha incorreta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <Lock size={24} className="text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>PAINEL ADMIN</h1>
          <p className="text-neutral-500 text-xs mt-2 tracking-wider">OUTSIDE EXPERIENCE</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha de acesso"
            data-testid="admin-password-input"
            className="w-full bg-transparent border-b-2 border-white/20 focus:border-orange-500 text-white px-0 py-3 outline-none text-base placeholder:text-neutral-600 transition-colors"
          />
          <button type="submit" disabled={loading} data-testid="admin-login-btn" className="w-full bg-orange-500 text-black font-bold uppercase tracking-widest text-xs py-4 hover:bg-orange-400 transition-colors disabled:opacity-50">
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </form>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/8 p-5 hover:border-white/15 transition-all">
      <Icon size={16} className={accent ? "text-orange-400 mb-3" : "text-neutral-500 mb-3"} />
      <span className="block text-2xl font-black" style={{ fontFamily: "Outfit, sans-serif" }}>{value}</span>
      <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-500">{label}</span>
    </div>
  );
}

export default function AdminPanel() {
  const [password, setPassword] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [editions, setEditions] = useState([]);
  const [edition, setEdition] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkinQuery, setCheckinQuery] = useState("");
  const [checkinResult, setCheckinResult] = useState(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const schoolApi = useMemo(() => adminApi(password), [password]);

  const loadEditions = useCallback(async () => {
    const { data } = await adminApi(password).get("/editions");
    setEditions(data);
    return data;
  }, [password]);

  const loadData = useCallback(async () => {
    if (!edition) return;
    try {
      const [statsRes, enrollRes] = await Promise.all([
        adminApi(password).get("/stats", { params: { edition } }),
        adminApi(password).get("/enrollments", { params: { edition } }),
      ]);
      setStats(statsRes.data);
      setEnrollments(enrollRes.data);
    } catch {
      toast.error("Erro ao carregar dados");
    }
  }, [password, edition]);

  useEffect(() => {
    if (!password) return;
    loadEditions()
      .then((list) => setEdition((cur) => cur || list.find((e) => e.is_current)?.slug || list[0]?.slug || null))
      .catch(() => toast.error("Erro ao carregar edições"));
  }, [password, loadEditions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createEdition = async (payload) => {
    try {
      const { data } = await adminApi(password).post("/editions", payload);
      await loadEditions();
      setEdition(data.slug);
      setCheckinResult(null);
      toast.success("Edição criada e definida como atual");
    } catch {
      toast.error("Erro ao criar edição");
    }
  };

  const makeCurrent = async (id) => {
    try {
      await adminApi(password).put(`/editions/${id}/current`);
      await loadEditions();
      toast.success("Edição atual atualizada");
    } catch {
      toast.error("Erro ao atualizar edição");
    }
  };

  const [camera, setCamera] = useState(false);

  const fazerCheckin = async (query) => {
    if (!query.trim()) return;
    setCheckinLoading(true);
    setCheckinResult(null);
    try {
      const res = await adminApi(password).post("/checkin", { query }, { params: { edition } });
      setCheckinResult(res.data);
      if (res.data.status === "checked_in") {
        toast.success("Check-in realizado!");
        loadData();
        loadEditions();
      } else if (res.data.status === "already_checked_in") {
        toast.info("Já fez check-in anteriormente");
      } else if (res.data.status === "multiple") {
        toast.info("Mais de uma inscrição com esse nome");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setCheckinResult({ status: "not_found" });
        toast.error("Inscrição não encontrada");
      } else {
        toast.error("Erro no check-in");
      }
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleCheckin = (e) => {
    e.preventDefault();
    fazerCheckin(checkinQuery);
  };

  const lerCodigo = useCallback(
    (codigo) => {
      setCheckinQuery(codigo);
      fazerCheckin(codigo);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [password, edition],
  );

  const exportCSV = async () => {
    try {
      const { data } = await adminApi(password).get("/export-csv", { params: { edition }, responseType: "blob" });
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inscritos-${edition}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error("Erro ao gerar o CSV");
    }
  };

  const filtered = enrollments.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return e.name?.toLowerCase().includes(q) || e.whatsapp?.includes(q) || e.church?.toLowerCase().includes(q) || e.ticket_code?.toLowerCase().includes(q);
  });

  if (!password) return <LoginScreen onLogin={setPassword} />;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Toaster theme="dark" position="top-right" />
      {/* Header */}
      <div className="no-print border-b border-white/10 px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" data-testid="admin-back-btn" className="text-neutral-500 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </a>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "Outfit, sans-serif" }}>PAINEL ADMIN</h1>
            <span className="text-[9px] text-neutral-600 tracking-wider">OUTSIDE EXPERIENCE • INSCRIÇÕES</span>
          </div>
        </div>
        <button onClick={exportCSV} data-testid="export-csv-btn" className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs uppercase tracking-widest px-4 py-2 transition-colors">
          <Download size={12} /> CSV
        </button>
      </div>

      <EditionBar editions={editions} selected={edition} onSelect={(s) => { setEdition(s); setCheckinResult(null); }} onCreate={createEdition} onMakeCurrent={makeCurrent} />

      {/* Tabs */}
      <div className="no-print border-b border-white/5 px-6 md:px-12 flex gap-0 overflow-x-auto">
        {[
          { id: "dashboard", label: "DASHBOARD", icon: BarChart3 },
          { id: "enrollments", label: "INSCRITOS", icon: Users },
          { id: "checkin", label: "CHECK-IN", icon: UserCheck },
          { id: "equipes", label: "EQUIPES", icon: LayoutGrid },
          { id: "school", label: "SCHOOL", icon: GraduationCap },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            data-testid={`tab-${t.id}`}
            className={`flex items-center gap-2 px-5 py-3 text-[10px] uppercase tracking-widest border-b-2 transition-colors ${
              tab === t.id ? "border-orange-500 text-white" : "border-transparent text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-6 md:px-12 py-8 max-w-6xl">
        {/* Dashboard */}
        {tab === "dashboard" && stats && (
          <div className="space-y-8" data-testid="dashboard-tab">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Inscritos" value={stats.total_enrollments} accent />
              <StatCard icon={UserCheck} label="Check-ins" value={stats.checked_in} />
              <StatCard icon={AlertTriangle} label="Menores" value={stats.minors} />
              <StatCard icon={Church} label="Igrejas" value={stats.unique_churches} />
            </div>

            {stats.pending_checkin > 0 && (
              <div className="bg-orange-500/5 border border-orange-500/20 p-5">
                <span className="text-sm text-orange-300"><strong>{stats.pending_checkin}</strong> pessoas ainda não fizeram check-in</span>
              </div>
            )}

            <div>
              <span className="text-[11px] tracking-[0.15em] uppercase text-neutral-400 block mb-3">DE ONDE VIERAM AS INSCRIÇÕES</span>
              <Origens inscritos={enrollments} />
            </div>

            {stats.churches_list?.length > 0 && (
              <div className="bg-[#0a0a0a] border border-white/8 p-6">
                <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 block mb-4">IGREJAS REPRESENTADAS</span>
                <div className="flex flex-wrap gap-2">
                  {stats.churches_list.map((c) => (
                    <span key={c} className="text-xs bg-white/5 border border-white/8 px-3 py-1 text-neutral-300">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enrollments list */}
        {tab === "enrollments" && (
          <div className="space-y-4" data-testid="enrollments-tab">
            <div className="flex items-center gap-3">
              <Search size={14} className="text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, WhatsApp, igreja ou código..."
                data-testid="search-enrollments-input"
                className="bg-transparent border-b border-white/15 focus:border-orange-500 text-white text-sm px-0 py-2 flex-1 outline-none placeholder:text-neutral-600 transition-colors"
              />
              <span className="text-xs text-neutral-600">{filtered.length} resultados</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left" data-testid="enrollments-table">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Nome", "WhatsApp", "Idade", "Igreja", "Menor", "Check-in", "Código"].map((h) => (
                      <th key={h} className="text-[9px] tracking-[0.2em] uppercase text-neutral-500 py-3 px-3 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 text-sm font-medium">{e.name}</td>
                      <td className="py-3 px-3 text-sm text-neutral-400">{e.whatsapp}</td>
                      <td className="py-3 px-3 text-sm text-neutral-400">{e.age}</td>
                      <td className="py-3 px-3 text-sm text-neutral-400">{e.church}</td>
                      <td className="py-3 px-3">{e.is_minor ? <AlertTriangle size={14} className="text-orange-400" /> : <span className="text-neutral-600">—</span>}</td>
                      <td className="py-3 px-3">{e.checked_in ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-neutral-600" />}</td>
                      <td className="py-3 px-3 text-[10px] font-mono text-neutral-500">{e.ticket_code || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "equipes" && <Equipes inscritos={enrollments} />}
        {tab === "school" && <SchoolCandidaturas api={schoolApi} />}

        {/* Check-in */}
        {tab === "checkin" && (
          <div className="max-w-lg space-y-8" data-testid="checkin-tab">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>CHECK-IN DIGITAL</h2>
              <p className="text-neutral-500 text-sm">Busque pelo nome ou código da inscrição — apenas na edição selecionada</p>
            </div>

            {camera ? (
              <LeitorQR onCodigo={lerCodigo} onFechar={() => setCamera(false)} />
            ) : (
              <button
                type="button"
                onClick={() => setCamera(true)}
                data-testid="checkin-camera-btn"
                className="w-full flex items-center justify-center gap-3 bg-orange-500 text-black font-bold uppercase tracking-widest text-xs py-4 hover:bg-orange-400"
              >
                <QrCode size={16} /> Ler QR code do ingresso
              </button>
            )}

            <form onSubmit={handleCheckin} className="flex gap-3">
              <input
                type="text"
                value={checkinQuery}
                onChange={(e) => setCheckinQuery(e.target.value)}
                placeholder="Nome ou código OE-XXXXXXXX"
                data-testid="checkin-search-input"
                className="bg-transparent border-b-2 border-white/20 focus:border-orange-500 text-white text-lg px-0 py-3 flex-1 outline-none placeholder:text-neutral-600 transition-colors"
              />
              <button type="submit" disabled={checkinLoading} data-testid="checkin-btn" className="bg-orange-500 text-black font-bold uppercase tracking-widest text-xs px-6 py-3 hover:bg-orange-400 transition-colors disabled:opacity-50">
                {checkinLoading ? "..." : "CHECK-IN"}
              </button>
            </form>

            {/* Result */}
            {checkinResult && (
              <div data-testid="checkin-result" className={`border p-6 space-y-4 ${
                checkinResult.status === "checked_in" ? "border-green-500/30 bg-green-500/5" :
                checkinResult.status === "already_checked_in" || checkinResult.status === "multiple" ? "border-orange-500/30 bg-orange-500/5" :
                "border-red-500/30 bg-red-500/5"
              }`}>
                {checkinResult.status === "not_found" ? (
                  <div className="flex items-center gap-3">
                    <XCircle size={20} className="text-red-400" />
                    <span className="text-red-300 font-medium">Inscrição não encontrada</span>
                  </div>
                ) : checkinResult.status === "multiple" ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={20} className="text-orange-400" />
                      <span className="text-orange-300 font-medium">Mais de uma inscrição encontrada: busque pelo código</span>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {checkinResult.matches?.map((m) => (
                        <li key={m.ticket_code} className="flex justify-between gap-4">
                          <span>{m.name}</span>
                          <span className="font-mono text-neutral-500">OE-{m.ticket_code}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      {checkinResult.status === "checked_in" ? (
                        <><CheckCircle size={20} className="text-green-400" /><span className="text-green-300 font-medium">Check-in realizado!</span></>
                      ) : (
                        <><AlertTriangle size={20} className="text-orange-400" /><span className="text-orange-300 font-medium">Já fez check-in</span></>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-[9px] tracking-[0.2em] uppercase text-neutral-600 block mb-1">NOME</span>
                        <span className="text-sm font-semibold">{checkinResult.enrollment?.name}</span>
                      </div>
                      <div>
                        <span className="text-[9px] tracking-[0.2em] uppercase text-neutral-600 block mb-1">IDADE</span>
                        <span className="text-sm">{checkinResult.enrollment?.age} anos</span>
                      </div>
                      <div>
                        <span className="text-[9px] tracking-[0.2em] uppercase text-neutral-600 block mb-1">IGREJA</span>
                        <span className="text-sm">{checkinResult.enrollment?.church}</span>
                      </div>
                      <div>
                        <span className="text-[9px] tracking-[0.2em] uppercase text-neutral-600 block mb-1">WHATSAPP</span>
                        <span className="text-sm">{checkinResult.enrollment?.whatsapp}</span>
                      </div>
                    </div>
                    {checkinResult.enrollment?.is_minor && (
                      <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-2 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-orange-400" />
                        <span className="text-[10px] text-orange-400 uppercase tracking-wider">Menor de idade — verificar autorização</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
