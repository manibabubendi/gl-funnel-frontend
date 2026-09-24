import React, { useState, useEffect, useCallback } from "react";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";

const T = {
  ink: "#12181B", paper: "#F7F4EC", paperCard: "#FFFFFF",
  line: "rgba(18,24,27,0.10)", lineSoft: "rgba(18,24,27,0.06)",
  teal: "#0E6E56", tealDeep: "#0A4F3E", tealTint: "#E4F2ED",
  coral: "#C2571D", coralTint: "#FBE9DD",
  gold: "#B78A2E", goldTint: "#F7EFDD",
  ink70: "rgba(18,24,27,0.68)", ink50: "rgba(18,24,27,0.48)",
};
const F = { serif: "Fraunces, serif", sans: "Inter, sans-serif", mono: "'JetBrains Mono', monospace" };

const ROLES = [
  { id: "admin", label: "Manibabu", desc: "Full system access", icon: "shield-star" },
  { id: "manager", label: "Manager", desc: "Teams, sales, projects, reports", icon: "chart-infographic" },
  { id: "sales", label: "Sales user", desc: "Leads, contacts, deals", icon: "target-arrow" },
  { id: "hr", label: "HR user", desc: "Employees, attendance, leave", icon: "id-badge-2" },
  { id: "finance", label: "Finance / payroll user", desc: "Payroll and expenses", icon: "receipt-2" },
  { id: "employee", label: "Employee", desc: "Tasks, documents, collaboration", icon: "user-circle" },
];

const MODULES = [
  { id: "dashboard", label: "Dashboard", icon: "layout-dashboard", roles: "all", level: 1 },
  { id: "crm", label: "CRM & sales", icon: "target-arrow", roles: ["admin", "manager", "sales"], level: 2 },
  { id: "projects", label: "Projects & tasks", icon: "checklist", roles: ["admin", "manager", "sales", "employee"], level: 3 },
  { id: "hr", label: "HR", icon: "id-badge-2", roles: ["admin", "hr"], level: 4 },
  { id: "payroll", label: "Payroll & expenses", icon: "receipt-2", roles: ["admin", "finance"], level: 5 },
  { id: "documents", label: "Documents", icon: "folder", roles: "all", level: 6 },
  { id: "reports", label: "Reports", icon: "chart-bar", roles: ["admin", "manager", "hr", "finance"], level: 7 },
];

const STAGES = [
  { id: "new", label: "New", tint: T.lineSoft, tx: T.ink70 },
  { id: "qualified", label: "Qualified", tint: T.tealTint, tx: T.tealDeep },
  { id: "proposal", label: "Proposal", tint: T.goldTint, tx: "#7A5A1C" },
  { id: "negotiation", label: "Negotiation", tint: T.coralTint, tx: "#8A3E13" },
  { id: "won", label: "Won", tint: T.ink, tx: T.paper },
];

const canSee = (mod, role) => mod.roles === "all" || mod.roles.includes(role);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const money = (n) => `$${(Number(n) || 0).toLocaleString()}`;

// ---------- tiny shared building blocks ----------

function Icon({ name, size = 16, color, style }) {
  return <i className={`ti ti-${name}`} style={{ fontSize: size, color, ...style }} aria-hidden="true" />;
}

function Pill({ children, bg, color }) {
  return <span style={{ ...S.levelPill, background: bg, color }}>{children}</span>;
}

function TinyBtn({ icon, onClick, disabled, label, size = 13 }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...S.tinyBtn, opacity: disabled ? 0.3 : 1 }} aria-label={label}>
      <Icon name={icon} size={size} />
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginTop: 12 }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function FunnelMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill={T.teal} />
      <path d="M10 12H30L23 22.5V29L17 27V22.5L10 12Z" fill={T.paper} />
    </svg>
  );
}

function FunnelHero() {
  const stages = [
    { w: 220, label: "Leads", n: "1,240", c: T.tealTint, tx: T.tealDeep },
    { w: 170, label: "Qualified", n: "560", c: T.goldTint, tx: "#7A5A1C" },
    { w: 120, label: "Proposal", n: "214", c: T.coralTint, tx: "#8A3E13" },
    { w: 74, label: "Won", n: "96", c: T.ink, tx: T.paper },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {stages.map((s, i) => (
        <div key={s.label} style={{
          width: s.w, height: 34, background: s.c, color: s.tx, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 14px", fontSize: 12, fontFamily: F.sans,
          clipPath: i === stages.length - 1 ? "none" : "polygon(0 0,100% 0,92% 100%,8% 100%)",
          borderRadius: i === stages.length - 1 ? 6 : 0,
        }}>
          <span style={{ fontWeight: 500 }}>{s.label}</span>
          <span style={{ fontFamily: F.mono, opacity: 0.85 }}>{s.n}</span>
        </div>
      ))}
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      @import url('${FONT_LINK}');
      .gf-fade { animation: gf-fade .3s ease; }
      @keyframes gf-fade { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
      .gf-navitem { cursor:pointer; transition:background .15s,color .15s; }
      .gf-navitem:hover { background:${T.lineSoft}; }
      .gf-rolecard { cursor:pointer; transition:border-color .15s,transform .1s; }
      .gf-rolecard:hover { transform:translateY(-1px); }
      .gf-btn-primary { cursor:pointer; transition:opacity .15s,transform .1s; }
      .gf-btn-primary:hover { opacity:.92; }
      .gf-btn-primary:active { transform:scale(.98); }
      .gf-scope * { box-sizing:border-box; font-family:${F.sans}; }
    `}</style>
  );
}

// ---------- app shell ----------

export default function App() {
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("session", false);
        if (res?.value) setSession(JSON.parse(res.value));
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

const login = useCallback(async () => {
  if (!email.trim() || !password) return;

  try {
    const response = await fetch("https://gl-funnel-backend.onrender.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Login failed");
      return;
    }

    const s = {
      token: data.token,
      user: data.user,
    };

    setSession(s);

    try {
      await window.storage.set(
        "session",
        JSON.stringify(s),
        false
      );
    } catch (e) {}

  } catch (error) {
    console.error(error);
    alert("Cannot connect to server");
  }
}, [email, password]);
  const logout = useCallback(async () => {
    setSession(null);
    setActiveModule("dashboard");
    try { await window.storage.delete("session", false); } catch (e) {}
  }, []);

  if (loading) {
    return (
      <div className="gf-scope" style={{ ...S.centerScreen, background: T.paper }}>
        <GlobalStyle /><FunnelMark size={28} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="gf-scope">
        <GlobalStyle />
        <LoginScreen
  name={name}
  setName={setName}
  selectedRole={selectedRole}
  setSelectedRole={setSelectedRole}
  email={email}
  setEmail={setEmail}
  password={password}
  setPassword={setPassword}
  login={login}
/>
      </div>
    );
  }

  const roleInfo = ROLES.find((r) => r.id === session.role);
  const visibleModules = MODULES.filter((m) => canSee(m, session.role));

  return (
    <div className="gf-scope" style={S.shell}>
      <GlobalStyle />
      <aside style={S.sidebar}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px" }}>
          <FunnelMark />
          <div>
            <div style={{ fontFamily: F.serif, fontSize: 16, fontWeight: 500, color: T.paper }}>GL Funnel</div>
            <div style={{ fontSize: 11, color: "rgba(247,244,236,.55)" }}>Business platform</div>
          </div>
        </div>

        <nav style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 2 }}>
          {visibleModules.map((mod) => {
            const active = activeModule === mod.id;
            return (
              <div key={mod.id} className="gf-navitem" onClick={() => setActiveModule(mod.id)} style={{
                ...S.navItem,
                background: active ? "rgba(247,244,236,.10)" : "transparent",
                color: active ? T.paper : "rgba(247,244,236,.68)",
                borderLeft: active ? `2px solid ${T.gold}` : "2px solid transparent",
              }}>
                <Icon name={mod.icon} size={17} />
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: active ? 500 : 400 }}>{mod.label}</span>
              </div>
            );
          })}
        </nav>

        <div style={S.sidebarFooter}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px" }}>
            <div style={S.avatar}>{session.name.slice(0, 2).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: T.paper, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {session.name}
              </div>
              <div style={{ fontSize: 11, color: "rgba(247,244,236,.5)" }}>{roleInfo?.label}</div>
            </div>
            <button onClick={logout} style={S.iconBtn} aria-label="Log out"><Icon name="logout" size={15} /></button>
          </div>
        </div>
      </aside>

      <main style={S.main} className="gf-fade" key={activeModule}>
        {activeModule === "dashboard" && <Dashboard session={session} roleInfo={roleInfo} modules={MODULES} />}
        {activeModule === "crm" && <CRM session={session} />}
        {activeModule === "projects" && <Projects session={session} />}
        {activeModule === "hr" && <HR session={session} />}
        {activeModule === "payroll" && <Payroll session={session} />}
        {activeModule === "documents" && <Documents session={session} />}
        {activeModule === "reports" && <Reports session={session} />}
        {!["dashboard", "crm", "projects", "hr", "payroll", "documents", "reports"].includes(activeModule) && (
          <ComingSoon module={MODULES.find((m) => m.id === activeModule)} />
        )}
      </main>
    </div>
  );
}

function LoginScreen({
  name,
  setName,
  selectedRole,
  setSelectedRole,
  email,
  setEmail,
  password,
  setPassword,
  login,
}) {
  return (
    <div style={S.loginWrap}>
      <div style={S.loginGrid}>
        <div style={S.loginHeroPanel}>
          <FunnelMark size={30} />
          <div style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 500, color: T.paper, marginTop: 14, lineHeight: 1.25 }}>
            Every lead has a<br />shape to become.
          </div>
          <p style={{ fontSize: 13, color: "rgba(247,244,236,.6)", marginTop: 10, lineHeight: 1.6 }}>
            CRM, projects, HR, payroll and reporting, in one funnel-shaped view of the business.
          </p>
          <div style={{ marginTop: 32 }}><FunnelHero /></div>
        </div>

        <div style={S.loginFormPanel}>
          <div style={{ fontSize: 12, letterSpacing: ".04em", color: T.ink50, textTransform: "uppercase", marginBottom: 6 }}>
            Workspace sign in
          </div>
          <h1 style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 500, margin: "0 0 6px", color: T.ink }}>Welcome to GL Funnel</h1>
          <p style={{ fontSize: 13, color: T.ink70, margin: "0 0 22px" }}>Demo login, no password required at this stage.</p>

          <Field label="Your email">
            <input
  type="email"
  value={email}
  onChange={e => setEmail(e.target.value)}
  placeholder="Enter your email"
  style={s.textInput}
/>
</Field>
<input
  type="password"
  value={password}
  onChange={e => setPassword(e.target.value)}
  placeholder="Enter your password"
  style={{ ...s.textInput, marginTop: 12 }}
/>

          <Field label="Role">
            <div style={S.roleGrid}>
              {ROLES.map((r) => {
                const active = selectedRole === r.id;
                return (
                  <div key={r.id} className="gf-rolecard" onClick={() => setSelectedRole(r.id)} style={{
                    ...S.roleCard,
                    borderColor: active ? T.teal : T.line,
                    borderWidth: active ? 1.5 : 1,
                    background: active ? T.tealTint : T.paperCard,
                  }}>
                    <Icon name={r.icon} size={16} color={active ? T.tealDeep : T.ink50} />
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: active ? T.tealDeep : T.ink, marginTop: 6 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: active ? T.tealDeep : T.ink50, marginTop: 2, opacity: active ? 0.75 : 1 }}>{r.desc}</div>
                  </div>
                );
              })}
            </div>
          </Field>

          <button className="gf-btn-primary" onClick={login} disabled={!name.trim() || !selectedRole}
            style={{ ...S.primaryBtn, opacity: !name.trim() || !selectedRole ? 0.4 : 1 }}>
            Enter workspace <Icon name="arrow-right" size={15} style={{ marginLeft: 6 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ session, roleInfo, modules }) {
  const firstName = session.name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const stats = [
    { label: "Open leads", icon: "target-arrow", tint: T.tealTint, tx: T.tealDeep },
    { label: "Active deals", icon: "briefcase", tint: T.goldTint, tx: "#7A5A1C" },
    { label: "Tasks due", icon: "checklist", tint: T.coralTint, tx: "#8A3E13" },
    { label: "Pending approvals", icon: "clock", tint: T.lineSoft, tx: T.ink70 },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, letterSpacing: ".04em", color: T.ink50, textTransform: "uppercase", marginBottom: 4 }}>{roleInfo?.label}</div>
        <h1 style={{ fontFamily: F.serif, fontSize: 26, fontWeight: 500, margin: 0, color: T.ink }}>{greeting}, {firstName}</h1>
        <p style={{ color: T.ink70, marginTop: 6, fontSize: 14 }}>Here's your workspace overview.</p>
      </div>

      <div style={S.statGrid}>
        {stats.map((s) => (
          <div key={s.label} style={{ ...S.statCard, background: s.tint }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, color: s.tx, opacity: 0.85 }}>{s.label}</span>
              <Icon name={s.icon} size={16} color={s.tx} />
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 24, fontWeight: 500, marginTop: 10, color: s.tx }}>—</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 34 }}>
        <h3 style={{ fontFamily: F.serif, fontWeight: 500, marginBottom: 4, color: T.ink }}>Modules</h3>
        <p style={{ fontSize: 13, color: T.ink70, marginBottom: 14 }}>Everything below is live and shares one workspace.</p>
        <div style={{ border: `1px solid ${T.line}`, borderRadius: 10, overflow: "hidden" }}>
          {modules.map((m, i) => (
            <div key={m.id} style={{ ...S.roadmapRow, borderTop: i === 0 ? "none" : `1px solid ${T.lineSoft}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name={m.icon} size={16} color={T.ink50} />
                <span style={{ fontSize: 13.5, color: T.ink }}>{m.label}</span>
              </div>
              <Pill bg={T.tealTint} color={T.tealDeep}>Live</Pill>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- CRM module ----------

function CRM({ session }) {
  const [tab, setTab] = useState("pipeline");
  const [leads, setLeads] = useState(null);
  const [contacts, setContacts] = useState(null);
  const [deals, setDeals] = useState(null);
  const [modal, setModal] = useState(null); // "deal" | "lead" | "contact" | null

  useEffect(() => {
    (async () => {
      const load = async (key, setter) => {
        try {
          const r = await window.storage.get(key, true);
          setter(r?.value ? JSON.parse(r.value) : []);
        } catch (e) { setter([]); }
      };
      await Promise.all([load("crm:leads", setLeads), load("crm:contacts", setContacts), load("crm:deals", setDeals)]);
    })();
  }, []);

  const persist = useCallback(async (key, value) => {
    try { await window.storage.set(key, JSON.stringify(value), true); } catch (e) {}
  }, []);

  const addItem = useCallback((list, setter, key, extra) => (data) => {
    const next = [...(list || []), { id: uid(), ...extra, ...data }];
    setter(next); persist(key, next);
  }, [persist]);

  const deleteItem = useCallback((list, setter, key, id) => {
    const next = (list || []).filter((x) => x.id !== id);
    setter(next); persist(key, next);
  }, [persist]);

  const moveDeal = useCallback((id, stage) => {
    const next = (deals || []).map((d) => (d.id === id ? { ...d, stage } : d));
    setDeals(next); persist("crm:deals", next);
  }, [deals, persist]);

  if (leads === null || contacts === null || deals === null) {
    return <div style={S.comingSoon}><span style={{ fontSize: 13, color: T.ink50 }}>Loading CRM data...</span></div>;
  }

  const pipelineValue = deals.filter((d) => d.stage !== "won").reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const wonValue = deals.filter((d) => d.stage === "won").reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  const TABS = [
    { id: "pipeline", label: "Pipeline", icon: "chart-dots-3" },
    { id: "leads", label: "Leads", icon: "target-arrow" },
    { id: "contacts", label: "Contacts", icon: "address-book" },
  ];
  const addBtnFor = { pipeline: ["deal", "New deal"], leads: ["lead", "New lead"], contacts: ["contact", "New contact"] };
  const [modalKey, modalLabel] = addBtnFor[tab];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: ".04em", color: T.ink50, textTransform: "uppercase", marginBottom: 4 }}>CRM and sales</div>
          <h1 style={{ fontFamily: F.serif, fontSize: 24, fontWeight: 500, margin: 0, color: T.ink }}>Pipeline overview</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={S.moneyChip}><span style={{ color: T.ink50 }}>In pipeline</span> <span style={{ fontFamily: F.mono }}>{money(pipelineValue)}</span></span>
          <span style={{ ...S.moneyChip, background: T.tealTint, color: T.tealDeep }}><span style={{ opacity: 0.8 }}>Won</span> <span style={{ fontFamily: F.mono }}>{money(wonValue)}</span></span>
        </div>
      </div>

      <div style={S.tabRow}>
        {TABS.map((t) => (
          <div key={t.id} className="gf-navitem" onClick={() => setTab(t.id)}
            style={{ ...S.tabItem, borderBottom: tab === t.id ? `2px solid ${T.teal}` : "2px solid transparent", color: tab === t.id ? T.ink : T.ink50 }}>
            <Icon name={t.icon} size={15} />{t.label}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", margin: "12px 0" }}>
        <button className="gf-btn-primary" onClick={() => setModal(modalKey)} style={S.smallPrimaryBtn}>
          <Icon name="plus" size={14} style={{ marginRight: 4 }} />{modalLabel}
        </button>
      </div>

      {tab === "pipeline" && (
        <div style={S.kanban}>
          {STAGES.map((stage, si) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            return (
              <div key={stage.id}>
                <div style={{ ...S.kanbanHead, background: stage.tint, color: stage.tx }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{stage.label}</span>
                  <span style={{ fontSize: 11, fontFamily: F.mono, opacity: 0.8 }}>{stageDeals.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, minHeight: 40 }}>
                  {stageDeals.map((d) => (
                    <div key={d.id} style={S.dealCard}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: T.ink }}>{d.title}</div>
                      <div style={{ fontSize: 11, color: T.ink50, marginTop: 2 }}>{d.customer}</div>
                      <div style={{ fontFamily: F.mono, fontSize: 12, color: T.tealDeep, marginTop: 6 }}>{money(d.value)}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                        <TinyBtn icon="chevron-left" label="Move back" disabled={si === 0} onClick={() => moveDeal(d.id, STAGES[si - 1].id)} />
                        <TinyBtn icon="trash" size={12} label="Delete deal" onClick={() => deleteItem(deals, setDeals, "crm:deals", d.id)} />
                        <TinyBtn icon="chevron-right" label="Move forward" disabled={si === STAGES.length - 1} onClick={() => moveDeal(d.id, STAGES[si + 1].id)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "leads" && (
        leads.length === 0 ? <EmptyState icon="target-arrow" title="No leads yet" body="Add your first lead to start tracking it through the pipeline." /> : (
          <div style={S.listWrap}>
            {leads.map((l, i) => (
              <div key={l.id} style={{ ...S.listRow, borderTop: i === 0 ? "none" : `1px solid ${T.lineSoft}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.ink }}>{l.name}</div>
                  <div style={{ fontSize: 11.5, color: T.ink50, marginTop: 2 }}>{l.company} · {l.source}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Pill bg={T.tealTint} color={T.tealDeep}>{l.status}</Pill>
                  <TinyBtn icon="trash" label="Delete lead" onClick={() => deleteItem(leads, setLeads, "crm:leads", l.id)} />
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "contacts" && (
        contacts.length === 0 ? <EmptyState icon="address-book" title="No contacts yet" body="Add people you work with at your customer accounts." /> : (
          <div style={S.cardGrid}>
            {contacts.map((c) => (
              <div key={c.id} style={S.contactCard}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ ...S.avatar, background: T.tealTint, color: T.tealDeep }}>{c.name.slice(0, 2).toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.ink }}>{c.name}</div>
                    <div style={{ fontSize: 11.5, color: T.ink50 }}>{c.company}</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 11.5, color: T.ink70 }}>{c.email}</div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <TinyBtn icon="trash" label="Delete contact" onClick={() => deleteItem(contacts, setContacts, "crm:contacts", c.id)} />
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {modal === "deal" && (
        <FormModal title="New deal" onClose={() => setModal(null)}
          fields={[
            { key: "title", label: "Deal title", placeholder: "Annual license renewal", required: true },
            { key: "customer", label: "Customer", placeholder: "Acme Corp", required: true },
            { key: "value", label: "Expected value ($)", placeholder: "15000", type: "number" },
          ]}
          onSave={addItem(deals, setDeals, "crm:deals", { stage: "new", owner: session.name })}
          submitLabel="Create deal" />
      )}
      {modal === "lead" && (
        <FormModal title="New lead" onClose={() => setModal(null)}
          fields={[
            { key: "name", label: "Name", placeholder: "Jordan Lee", required: true },
            { key: "company", label: "Company", placeholder: "Northwind Traders" },
            { key: "source", label: "Source", type: "select", options: ["Website", "Referral", "Cold outreach", "Event", "Other"] },
          ]}
          onSave={addItem(leads, setLeads, "crm:leads", { status: "New", createdBy: session.name })}
          submitLabel="Add lead" />
      )}
      {modal === "contact" && (
        <FormModal title="New contact" onClose={() => setModal(null)}
          fields={[
            { key: "name", label: "Name", placeholder: "Sam Patel", required: true },
            { key: "company", label: "Company", placeholder: "Acme Corp" },
            { key: "email", label: "Email", placeholder: "sam@acme.com", type: "email", required: true },
          ]}
          onSave={addItem(contacts, setContacts, "crm:contacts", {})}
          submitLabel="Add contact" />
      )}
    </div>
  );
}

function EmptyState({ icon, title, body }) {
  return (
    <div style={{ ...S.comingSoon, minHeight: 220 }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.lineSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={20} color={T.ink50} />
      </div>
      <h3 style={{ fontFamily: F.serif, fontWeight: 500, margin: "14px 0 4px", color: T.ink }}>{title}</h3>
      <p style={{ color: T.ink70, fontSize: 13, maxWidth: 320 }}>{body}</p>
    </div>
  );
}

// Generic add-record modal driven by a field schema, replaces the three
// near-identical Deal/Lead/Contact forms.
function FormModal({ title, fields, onClose, onSave, submitLabel }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.type === "select" ? f.options[0] : ""]))
  );
  const [error, setError] = useState("");

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const missing = fields.find((f) => f.required && !String(values[f.key]).trim());
    if (missing) { setError(`Enter ${missing.label.toLowerCase()}.`); return; }
    onSave(values);
    onClose();
  };

  return (
    <div style={S.modalOverlay}>
      <div style={S.modalCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontFamily: F.serif, fontWeight: 500, margin: 0, fontSize: 17, color: T.ink }}>{title}</h3>
          <TinyBtn icon="x" size={15} label="Close" onClick={onClose} />
        </div>
        <form onSubmit={submit}>
          {fields.map((f) => (
            <Field key={f.key} label={f.label}>
              {f.type === "select" ? (
                <select value={values[f.key]} onChange={set(f.key)} style={S.textInput}>
                  {f.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type || "text"} value={values[f.key]} onChange={set(f.key)} placeholder={f.placeholder} style={S.textInput} />
              )}
            </Field>
          ))}
          {error && <div style={{ color: T.coral, fontSize: 12, marginTop: 8 }}>{error}</div>}
          <button type="submit" className="gf-btn-primary" style={{ ...S.primaryBtn, marginTop: 18 }}>{submitLabel}</button>
        </form>
      </div>
    </div>
  );
}

// ---------- shared data-loading helpers for the modules below ----------

async function persistKV(key, value) {
  try { await window.storage.set(key, JSON.stringify(value), true); } catch (e) {}
}

// Loads several storage keys at once into one state object, keyed by short name.
// pairs: [["projects","proj:projects"], ["tasks","proj:tasks"], ...]
function useStorage(pairs) {
  const [state, setState] = useState(null);
  useEffect(() => {
    (async () => {
      const entries = await Promise.all(pairs.map(async ([name, key]) => {
        try {
          const r = await window.storage.get(key, true);
          return [name, r?.value ? JSON.parse(r.value) : []];
        } catch (e) { return [name, []]; }
      }));
      setState(Object.fromEntries(entries));
    })();
  }, []);

  // returns an updater(name, key) => (nextValueOrFn) that updates local state and persists
  const field = (name, key) => (updater) => {
    setState((prev) => {
      const nextVal = typeof updater === "function" ? updater(prev[name]) : updater;
      persistKV(key, nextVal);
      return { ...prev, [name]: nextVal };
    });
  };
  return [state, field];
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={S.tabRow}>
      {tabs.map((t) => (
        <div key={t.id} className="gf-navitem" onClick={() => onChange(t.id)}
          style={{ ...S.tabItem, borderBottom: active === t.id ? `2px solid ${T.teal}` : "2px solid transparent", color: active === t.id ? T.ink : T.ink50 }}>
          <Icon name={t.icon} size={15} />{t.label}
        </div>
      ))}
    </div>
  );
}

function AddBtn({ label, onClick }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", margin: "12px 0" }}>
      <button className="gf-btn-primary" onClick={onClick} style={S.smallPrimaryBtn}>
        <Icon name="plus" size={14} style={{ marginRight: 4 }} />{label}
      </button>
    </div>
  );
}

function ModuleHeader({ eyebrow, title, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
      <div>
        <div style={{ fontSize: 12, letterSpacing: ".04em", color: T.ink50, textTransform: "uppercase", marginBottom: 4 }}>{eyebrow}</div>
        <h1 style={{ fontFamily: F.serif, fontSize: 24, fontWeight: 500, margin: 0, color: T.ink }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

const APPROVAL_COLORS = {
  Pending: [T.goldTint, "#7A5A1C"],
  Approved: [T.tealTint, T.tealDeep],
  Rejected: [T.coralTint, "#8A3E13"],
};
function ApprovalPill({ status }) {
  const [bg, tx] = APPROVAL_COLORS[status] || [T.lineSoft, T.ink50];
  return <Pill bg={bg} color={tx}>{status}</Pill>;
}

// ---------- Level 3: Projects & tasks ----------

const PROJECT_STATUSES = ["Planning", "Active", "On hold", "Completed"];
const TASK_STAGES = [
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In progress" },
  { id: "completed", label: "Completed" },
];

function Projects({ session }) {
  const [data, field] = useStorage([["projects", "proj:projects"], ["tasks", "proj:tasks"]]);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);

  if (!data) return <div style={S.comingSoon}><span style={{ fontSize: 13, color: T.ink50 }}>Loading projects...</span></div>;

  const setProjects = field("projects", "proj:projects");
  const setTasks = field("tasks", "proj:tasks");
  const { projects, tasks } = data;

  const addProject = (v) => setProjects((prev) => [...prev, { id: uid(), status: "Planning", ...v }]);
  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) => prev.filter((t) => t.projectId !== id));
    if (selected === id) setSelected(null);
  };
  const addTask = (projectId) => (v) => setTasks((prev) => [...prev, { id: uid(), projectId, status: "pending", ...v }]);
  const moveTask = (id, status) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  const deleteTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  if (selected) {
    const project = projects.find((p) => p.id === selected);
    const projectTasks = tasks.filter((t) => t.projectId === selected);
    const today = new Date().toISOString().slice(0, 10);

    return (
      <div>
        <div className="gf-navitem" onClick={() => setSelected(null)} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: T.ink50, borderRadius: 6, padding: "4px 6px", marginBottom: 12 }}>
          <Icon name="arrow-left" size={14} /> Back to projects
        </div>
        <ModuleHeader eyebrow={project.status} title={project.name}
          right={<Pill bg={T.tealTint} color={T.tealDeep}>{projectTasks.filter((t) => t.status === "completed").length}/{projectTasks.length} done</Pill>} />
        <p style={{ fontSize: 13, color: T.ink70, marginTop: -12, marginBottom: 20 }}>
          Manager: {project.manager || "—"} · Members: {project.members || "—"}
        </p>

        <AddBtn label="New task" onClick={() => setModal("task")} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {TASK_STAGES.map((stage, si) => (
            <div key={stage.id}>
              <div style={{ ...S.kanbanHead, background: T.lineSoft, color: T.ink70 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{stage.label}</span>
                <span style={{ fontSize: 11, fontFamily: F.mono, opacity: 0.8 }}>{projectTasks.filter((t) => t.status === stage.id).length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, minHeight: 40 }}>
                {projectTasks.filter((t) => t.status === stage.id).map((t) => {
                  const overdue = t.dueDate && t.dueDate < today && stage.id !== "completed";
                  return (
                    <div key={t.id} style={S.dealCard}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: T.ink }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: T.ink50, marginTop: 2 }}>{t.assignee || "Unassigned"} · {t.priority}</div>
                      {t.dueDate && <div style={{ fontSize: 11, marginTop: 4, color: overdue ? T.coral : T.ink50 }}>{overdue ? "Overdue · " : "Due "}{t.dueDate}</div>}
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                        <TinyBtn icon="chevron-left" label="Move back" disabled={si === 0} onClick={() => moveTask(t.id, TASK_STAGES[si - 1].id)} />
                        <TinyBtn icon="trash" size={12} label="Delete task" onClick={() => deleteTask(t.id)} />
                        <TinyBtn icon="chevron-right" label="Move forward" disabled={si === TASK_STAGES.length - 1} onClick={() => moveTask(t.id, TASK_STAGES[si + 1].id)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {modal === "task" && (
          <FormModal title="New task" onClose={() => setModal(null)}
            fields={[
              { key: "title", label: "Task title", placeholder: "Design landing page", required: true },
              { key: "assignee", label: "Assignee", placeholder: session.name },
              { key: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High"] },
              { key: "dueDate", label: "Due date", type: "date" },
            ]}
            onSave={addTask(selected)} submitLabel="Add task" />
        )}
      </div>
    );
  }

  return (
    <div>
      <ModuleHeader eyebrow="Projects & tasks" title="All projects" />
      <AddBtn label="New project" onClick={() => setModal("project")} />
      {projects.length === 0 ? (
        <EmptyState icon="checklist" title="No projects yet" body="Create a project to start assigning tasks and tracking progress." />
      ) : (
        <div style={S.cardGrid}>
          {projects.map((p) => {
            const pTasks = tasks.filter((t) => t.projectId === p.id);
            const pct = pTasks.length ? Math.round((pTasks.filter((t) => t.status === "completed").length / pTasks.length) * 100) : 0;
            return (
              <div key={p.id} style={{ ...S.contactCard, cursor: "pointer" }} onClick={() => setSelected(p.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: T.ink }}>{p.name}</div>
                  <TinyBtn icon="trash" label="Delete project" onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} />
                </div>
                <div style={{ fontSize: 11.5, color: T.ink50, marginTop: 4 }}>{p.manager || "No manager set"}</div>
                <Pill bg={T.lineSoft} color={T.ink70}>{p.status}</Pill>
                <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: T.lineSoft, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: T.teal }} />
                </div>
                <div style={{ fontSize: 11, color: T.ink50, marginTop: 6 }}>{pct}% complete · {pTasks.length} tasks</div>
              </div>
            );
          })}
        </div>
      )}
      {modal === "project" && (
        <FormModal title="New project" onClose={() => setModal(null)}
          fields={[
            { key: "name", label: "Project name", placeholder: "Website relaunch", required: true },
            { key: "manager", label: "Manager", placeholder: session.name },
            { key: "members", label: "Members", placeholder: "e.g. Asha, Ravi, Meera" },
            { key: "status", label: "Status", type: "select", options: PROJECT_STATUSES },
          ]}
          onSave={addProject} submitLabel="Create project" />
      )}
    </div>
  );
}

// ---------- Level 4: HR ----------

function HR({ session }) {
  const [tab, setTab] = useState("employees");
  const [data, field] = useStorage([["employees", "hr:employees"], ["attendance", "hr:attendance"], ["leave", "hr:leave"]]);
  const [modal, setModal] = useState(null);

  if (!data) return <div style={S.comingSoon}><span style={{ fontSize: 13, color: T.ink50 }}>Loading HR data...</span></div>;

  const setEmployees = field("employees", "hr:employees");
  const setAttendance = field("attendance", "hr:attendance");
  const setLeave = field("leave", "hr:leave");
  const { employees, attendance, leave } = data;
  const empOptions = employees.length ? employees.map((e) => e.name) : ["No employees yet"];

  const addEmployee = (v) => setEmployees((prev) => [...prev, { id: uid(), ...v }]);
  const delEmployee = (id) => setEmployees((prev) => prev.filter((e) => e.id !== id));
  const addAttendance = (v) => setAttendance((prev) => [...prev, { id: uid(), ...v }]);
  const delAttendance = (id) => setAttendance((prev) => prev.filter((a) => a.id !== id));
  const addLeave = (v) => setLeave((prev) => [...prev, { id: uid(), status: "Pending", ...v }]);
  const setLeaveStatus = (id, status) => setLeave((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));

  const TABS = [
    { id: "employees", label: "Employees", icon: "id-badge-2" },
    { id: "attendance", label: "Attendance", icon: "calendar-check" },
    { id: "leave", label: "Leave", icon: "calendar-time" },
  ];
  const addFor = { employees: ["employee", "Add employee"], attendance: ["attendance", "Log attendance"], leave: ["leave", "Request leave"] };
  const [modalKey, modalLabel] = addFor[tab];

  return (
    <div>
      <ModuleHeader eyebrow="Human resources" title="Employees & workforce" />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <AddBtn label={modalLabel} onClick={() => setModal(modalKey)} />

      {tab === "employees" && (
        employees.length === 0 ? <EmptyState icon="id-badge-2" title="No employees yet" body="Add employees to build out attendance and leave records." /> : (
          <div style={S.listWrap}>
            {employees.map((e, i) => (
              <div key={e.id} style={{ ...S.listRow, borderTop: i === 0 ? "none" : `1px solid ${T.lineSoft}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.ink }}>{e.name}</div>
                  <div style={{ fontSize: 11.5, color: T.ink50, marginTop: 2 }}>{e.designation} · {e.department}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11.5, color: T.ink50, fontFamily: F.mono }}>{e.joiningDate}</span>
                  <TinyBtn icon="trash" label="Remove employee" onClick={() => delEmployee(e.id)} />
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "attendance" && (
        attendance.length === 0 ? <EmptyState icon="calendar-check" title="No attendance logged" body="Log daily attendance status for employees." /> : (
          <div style={S.listWrap}>
            {attendance.map((a, i) => (
              <div key={a.id} style={{ ...S.listRow, borderTop: i === 0 ? "none" : `1px solid ${T.lineSoft}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.ink }}>{a.employee}</div>
                  <div style={{ fontSize: 11.5, color: T.ink50, marginTop: 2, fontFamily: F.mono }}>{a.date}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Pill bg={a.status === "Present" ? T.tealTint : a.status === "Absent" ? T.coralTint : T.goldTint}
                    color={a.status === "Present" ? T.tealDeep : a.status === "Absent" ? "#8A3E13" : "#7A5A1C"}>{a.status}</Pill>
                  <TinyBtn icon="trash" label="Remove record" onClick={() => delAttendance(a.id)} />
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "leave" && (
        leave.length === 0 ? <EmptyState icon="calendar-time" title="No leave requests" body="Submit a leave request to see it tracked here." /> : (
          <div style={S.listWrap}>
            {leave.map((l, i) => (
              <div key={l.id} style={{ ...S.listRow, borderTop: i === 0 ? "none" : `1px solid ${T.lineSoft}`, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.ink }}>{l.employee} · {l.leaveType}</div>
                  <div style={{ fontSize: 11.5, color: T.ink50, marginTop: 2 }}>{l.fromDate} → {l.toDate}</div>
                  {l.reason && <div style={{ fontSize: 11.5, color: T.ink70, marginTop: 4 }}>{l.reason}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ApprovalPill status={l.status} />
                  {l.status === "Pending" && (
                    <>
                      <TinyBtn icon="check" label="Approve" onClick={() => setLeaveStatus(l.id, "Approved")} />
                      <TinyBtn icon="x" label="Reject" onClick={() => setLeaveStatus(l.id, "Rejected")} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {modal === "employee" && (
        <FormModal title="Add employee" onClose={() => setModal(null)}
          fields={[
            { key: "name", label: "Name", placeholder: "Asha Rao", required: true },
            { key: "department", label: "Department", placeholder: "Engineering" },
            { key: "designation", label: "Designation", placeholder: "Software Engineer" },
            { key: "joiningDate", label: "Joining date", type: "date" },
          ]}
          onSave={addEmployee} submitLabel="Add employee" />
      )}
      {modal === "attendance" && (
        <FormModal title="Log attendance" onClose={() => setModal(null)}
          fields={[
            { key: "employee", label: "Employee", type: "select", options: empOptions },
            { key: "date", label: "Date", type: "date" },
            { key: "status", label: "Status", type: "select", options: ["Present", "Absent", "Half day"] },
          ]}
          onSave={addAttendance} submitLabel="Save record" />
      )}
      {modal === "leave" && (
        <FormModal title="Request leave" onClose={() => setModal(null)}
          fields={[
            { key: "employee", label: "Employee", type: "select", options: empOptions },
            { key: "leaveType", label: "Leave type", type: "select", options: ["Sick", "Casual", "Annual", "Unpaid"] },
            { key: "fromDate", label: "From", type: "date" },
            { key: "toDate", label: "To", type: "date" },
            { key: "reason", label: "Reason", placeholder: "Optional" },
          ]}
          onSave={addLeave} submitLabel="Submit request" />
      )}
    </div>
  );
}

// ---------- Level 5: Payroll & expenses ----------

function Payroll({ session }) {
  const [tab, setTab] = useState("payroll");
  const [data, field] = useStorage([["employees", "hr:employees"], ["payroll", "fin:payroll"], ["expenses", "fin:expenses"]]);
  const [modal, setModal] = useState(null);

  if (!data) return <div style={S.comingSoon}><span style={{ fontSize: 13, color: T.ink50 }}>Loading payroll data...</span></div>;

  const setPayroll = field("payroll", "fin:payroll");
  const setExpenses = field("expenses", "fin:expenses");
  const { employees, payroll, expenses } = data;
  const empOptions = employees.length ? employees.map((e) => e.name) : [session.name];

  const addPayroll = (v) => setPayroll((prev) => [...prev, { id: uid(), ...v }]);
  const delPayroll = (id) => setPayroll((prev) => prev.filter((p) => p.id !== id));
  const addExpense = (v) => setExpenses((prev) => [...prev, { id: uid(), submittedBy: session.name, status: "Pending", ...v }]);
  const setExpenseStatus = (id, status) => setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));

  const TABS = [
    { id: "payroll", label: "Payroll", icon: "receipt-2" },
    { id: "expenses", label: "Expenses", icon: "wallet" },
  ];

  return (
    <div>
      <ModuleHeader eyebrow="Finance" title="Payroll & expenses" />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <AddBtn label={tab === "payroll" ? "Add payroll entry" : "Submit expense"} onClick={() => setModal(tab === "payroll" ? "payroll" : "expense")} />

      {tab === "payroll" && (
        payroll.length === 0 ? <EmptyState icon="receipt-2" title="No payroll entries" body="Record salary payouts per pay period." /> : (
          <div style={S.listWrap}>
            {payroll.map((p, i) => (
              <div key={p.id} style={{ ...S.listRow, borderTop: i === 0 ? "none" : `1px solid ${T.lineSoft}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.ink }}>{p.employee}</div>
                  <div style={{ fontSize: 11.5, color: T.ink50, marginTop: 2 }}>{p.payPeriod}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: F.mono, fontSize: 13, color: T.tealDeep }}>{money(p.amount)}</span>
                  <TinyBtn icon="trash" label="Delete entry" onClick={() => delPayroll(p.id)} />
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "expenses" && (
        expenses.length === 0 ? <EmptyState icon="wallet" title="No expenses submitted" body="Submit a business expense for review." /> : (
          <div style={S.listWrap}>
            {expenses.map((e, i) => (
              <div key={e.id} style={{ ...S.listRow, borderTop: i === 0 ? "none" : `1px solid ${T.lineSoft}`, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.ink }}>{e.category} · {money(e.amount)}</div>
                  <div style={{ fontSize: 11.5, color: T.ink50, marginTop: 2 }}>{e.date} · {e.submittedBy}</div>
                  {e.description && <div style={{ fontSize: 11.5, color: T.ink70, marginTop: 4 }}>{e.description}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ApprovalPill status={e.status} />
                  {e.status === "Pending" && (
                    <>
                      <TinyBtn icon="check" label="Approve" onClick={() => setExpenseStatus(e.id, "Approved")} />
                      <TinyBtn icon="x" label="Reject" onClick={() => setExpenseStatus(e.id, "Rejected")} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {modal === "payroll" && (
        <FormModal title="Add payroll entry" onClose={() => setModal(null)}
          fields={[
            { key: "employee", label: "Employee", type: "select", options: empOptions },
            { key: "payPeriod", label: "Pay period", placeholder: "August 2026" },
            { key: "amount", label: "Amount ($)", type: "number", placeholder: "4200", required: true },
          ]}
          onSave={addPayroll} submitLabel="Save entry" />
      )}
      {modal === "expense" && (
        <FormModal title="Submit expense" onClose={() => setModal(null)}
          fields={[
            { key: "category", label: "Category", type: "select", options: ["Travel", "Meals", "Software", "Office supplies", "Other"] },
            { key: "amount", label: "Amount ($)", type: "number", placeholder: "120", required: true },
            { key: "date", label: "Date", type: "date" },
            { key: "description", label: "Description", placeholder: "Optional" },
          ]}
          onSave={addExpense} submitLabel="Submit for approval" />
      )}
    </div>
  );
}

// ---------- Level 6: Documents ----------

function Documents({ session }) {
  const [data, field] = useStorage([["documents", "docs:documents"]]);
  const [modal, setModal] = useState(false);

  if (!data) return <div style={S.comingSoon}><span style={{ fontSize: 13, color: T.ink50 }}>Loading documents...</span></div>;

  const setDocuments = field("documents", "docs:documents");
  const { documents } = data;
  const addDoc = (v) => setDocuments((prev) => [...prev, { id: uid(), owner: session.name, uploadDate: new Date().toISOString().slice(0, 10), ...v }]);
  const delDoc = (id) => setDocuments((prev) => prev.filter((d) => d.id !== id));
  const typeIcon = { Contract: "file-text", Invoice: "receipt", Report: "report", Policy: "shield-check", Other: "file" };

  return (
    <div>
      <ModuleHeader eyebrow="Document management" title="Shared documents" />
      <AddBtn label="Add document" onClick={() => setModal(true)} />
      {documents.length === 0 ? (
        <EmptyState icon="folder" title="No documents yet" body="Add document records to keep track of what's stored where." />
      ) : (
        <div style={S.cardGrid}>
          {documents.map((d) => (
            <div key={d.id} style={S.contactCard}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ ...S.avatar, background: T.goldTint, color: "#7A5A1C" }}><Icon name={typeIcon[d.type] || "file"} size={15} /></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                  <div style={{ fontSize: 11.5, color: T.ink50 }}>{d.type}</div>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 11.5, color: T.ink70 }}>{d.owner} · {d.uploadDate}</div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <TinyBtn icon="trash" label="Delete document" onClick={() => delDoc(d.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <FormModal title="Add document" onClose={() => setModal(false)}
          fields={[
            { key: "name", label: "Document name", placeholder: "Vendor agreement.pdf", required: true },
            { key: "type", label: "Type", type: "select", options: ["Contract", "Invoice", "Report", "Policy", "Other"] },
          ]}
          onSave={addDoc} submitLabel="Add document" />
      )}
    </div>
  );
}

// ---------- Level 7: Reports ----------

function Reports() {
  const [data] = useStorage([
    ["leads", "crm:leads"], ["deals", "crm:deals"], ["contacts", "crm:contacts"],
    ["projects", "proj:projects"], ["tasks", "proj:tasks"],
    ["employees", "hr:employees"], ["leave", "hr:leave"],
    ["payroll", "fin:payroll"], ["expenses", "fin:expenses"],
    ["documents", "docs:documents"],
  ]);

  if (!data) return <div style={S.comingSoon}><span style={{ fontSize: 13, color: T.ink50 }}>Building report...</span></div>;

  const pipelineValue = data.deals.filter((d) => d.stage !== "won").reduce((s, d) => s + (Number(d.value) || 0), 0);
  const wonValue = data.deals.filter((d) => d.stage === "won").reduce((s, d) => s + (Number(d.value) || 0), 0);
  const payrollTotal = data.payroll.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const expensesTotal = data.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const pendingExpenses = data.expenses.filter((e) => e.status === "Pending").length;
  const pendingLeave = data.leave.filter((l) => l.status === "Pending").length;
  const tasksDone = data.tasks.filter((t) => t.status === "completed").length;

  const sections = [
    { title: "CRM & sales", icon: "target-arrow", rows: [
      ["Leads", data.leads.length], ["Contacts", data.contacts.length],
      ["Deals in pipeline", `${data.deals.filter((d) => d.stage !== "won").length} · ${money(pipelineValue)}`],
      ["Deals won", `${data.deals.filter((d) => d.stage === "won").length} · ${money(wonValue)}`],
    ]},
    { title: "Projects & tasks", icon: "checklist", rows: [
      ["Projects", data.projects.length], ["Tasks", data.tasks.length], ["Tasks completed", `${tasksDone}/${data.tasks.length}`],
    ]},
    { title: "HR", icon: "id-badge-2", rows: [
      ["Employees", data.employees.length], ["Leave requests", data.leave.length], ["Pending approval", pendingLeave],
    ]},
    { title: "Payroll & expenses", icon: "receipt-2", rows: [
      ["Payroll entries", data.payroll.length], ["Payroll total", money(payrollTotal)],
      ["Expenses submitted", `${data.expenses.length} · ${money(expensesTotal)}`], ["Pending approval", pendingExpenses],
    ]},
    { title: "Documents", icon: "folder", rows: [["Documents on file", data.documents.length]] },
  ];

  return (
    <div>
      <ModuleHeader eyebrow="Reports & analytics" title="Business overview" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 12 }}>
        {sections.map((sec) => (
          <div key={sec.title} style={{ background: T.paperCard, border: `1px solid ${T.line}`, borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon name={sec.icon} size={16} color={T.tealDeep} />
              <span style={{ fontSize: 13, fontWeight: 500, color: T.ink }}>{sec.title}</span>
            </div>
            {sec.rows.map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12.5 }}>
                <span style={{ color: T.ink70 }}>{label}</span>
                <span style={{ fontFamily: F.mono, color: T.ink }}>{value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComingSoon({ module }) {
  if (!module) return null;
  return (
    <div style={S.comingSoon}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.tealTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={module.icon} size={24} color={T.tealDeep} />
      </div>
      <h2 style={{ fontFamily: F.serif, fontWeight: 500, margin: "18px 0 4px", color: T.ink }}>{module.label}</h2>
      <p style={{ color: T.ink70, maxWidth: 360, fontSize: 13.5 }}>
        This module is part of level {module.level} of the build and isn't wired up yet. We'll add it next.
      </p>
    </div>
  );
}

const S = {
  centerScreen: { minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12 },
  shell: { display: "flex", minHeight: 580, background: T.paper, borderRadius: 14, overflow: "hidden", border: `1px solid ${T.line}` },
  sidebar: { width: 240, flexShrink: 0, background: T.ink, padding: "22px 14px", display: "flex", flexDirection: "column" },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 6 },
  levelBadge: { fontSize: 9.5, color: "rgba(247,244,236,.4)", border: "1px solid rgba(247,244,236,.18)", borderRadius: 4, padding: "1px 5px", fontFamily: F.mono },
  sidebarFooter: { marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(247,244,236,.10)" },
  avatar: { width: 30, height: 30, borderRadius: "50%", background: T.tealDeep, color: T.paper, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, fontWeight: 500, flexShrink: 0 },
  iconBtn: { background: "transparent", border: "none", width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(247,244,236,.6)" },
  main: { flex: 1, padding: "30px 34px", overflow: "auto", background: T.paper },
  loginWrap: { minHeight: 580, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem 0", background: T.paper, borderRadius: 14 },
  loginGrid: { width: 620, maxWidth: "100%", display: "grid", gridTemplateColumns: "220px 1fr", borderRadius: 14, overflow: "hidden", border: `1px solid ${T.line}` },
  loginHeroPanel: { background: T.ink, padding: "26px 22px", display: "flex", flexDirection: "column" },
  loginFormPanel: { background: T.paperCard, padding: "26px 26px 24px" },
  label: { display: "block", fontSize: 11.5, color: T.ink50, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".03em" },
  textInput: { width: "100%", height: 38, borderRadius: 8, border: `1px solid ${T.line}`, padding: "0 12px", fontSize: 13.5, background: T.paperCard, color: T.ink, outline: "none" },
  roleGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 2 },
  roleCard: { border: "1px solid", borderRadius: 8, padding: 10 },
  primaryBtn: { width: "100%", background: T.teal, color: T.paper, border: "none", borderRadius: 8, height: 40, fontSize: 13.5, fontWeight: 500, marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 10 },
  statCard: { borderRadius: 10, padding: "1rem" },
  roadmapRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", background: T.paperCard },
  levelPill: { fontSize: 10.5, fontWeight: 500, borderRadius: 6, padding: "3px 8px", fontFamily: F.mono },
  comingSoon: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 420 },
  moneyChip: { fontSize: 12, background: T.paperCard, border: `1px solid ${T.line}`, borderRadius: 8, padding: "7px 12px", color: T.ink },
  tabRow: { display: "flex", gap: 20, borderBottom: `1px solid ${T.line}` },
  tabItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "0 2px 10px", fontWeight: 500 },
  smallPrimaryBtn: { background: T.teal, color: T.paper, border: "none", borderRadius: 7, height: 32, fontSize: 12.5, fontWeight: 500, padding: "0 12px", display: "flex", alignItems: "center" },
  kanban: { display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 10 },
  kanbanHead: { display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 6, padding: "6px 10px" },
  dealCard: { background: T.paperCard, border: `1px solid ${T.line}`, borderRadius: 8, padding: 10 },
  tinyBtn: { background: "transparent", border: "none", cursor: "pointer", color: T.ink50, display: "flex", alignItems: "center", justifyContent: "center", padding: 2 },
  listWrap: { border: `1px solid ${T.line}`, borderRadius: 10, overflow: "hidden" },
  listRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: T.paperCard },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 10 },
  contactCard: { background: T.paperCard, border: `1px solid ${T.line}`, borderRadius: 10, padding: "12px 14px" },
  modalOverlay: { minHeight: 400, background: "rgba(18,24,27,.45)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 0" },
  modalCard: { width: 360, maxWidth: "90%", background: T.paperCard, borderRadius: 12, padding: "22px 22px 20px", border: `1px solid ${T.line}` },
};
