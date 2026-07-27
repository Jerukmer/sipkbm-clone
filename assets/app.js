/* ============================================================
   SIPKBM CLONE — full interactive app engine
   ============================================================ */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- toast (stack) ---------- */
  function ensureStack() {
    var s = $("#toastStack");
    if (!s) { s = document.createElement("div"); s.id = "toastStack"; s.className = "toast-stack"; document.body.appendChild(s); }
    return s;
  }
  function toast(msg, kind) {
    var s = ensureStack();
    var t = document.createElement("div");
    t.className = "toast" + (kind ? " " + kind : "");
    t.textContent = msg;
    s.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () { t.classList.remove("show"); setTimeout(function () { t.remove(); }, 350); }, 2600);
  }

  /* ---------- modal helper ---------- */
  function openModal(html) {
    var ov = $("#modalOverlay");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "modalOverlay"; ov.className = "overlay";
      document.body.appendChild(ov);
      ov.addEventListener("click", function (e) { if (e.target === ov) closeModal(); });
    }
    ov.innerHTML = html;
    requestAnimationFrame(function () { ov.classList.add("show"); });
    var closeBtn = $("#modalOverlay .modal-close");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    return ov;
  }
  function closeModal() { var ov = $("#modalOverlay"); if (ov) ov.classList.remove("show"); }
  function confirmDialog(title, msg, onYes, danger) {
    var ic = danger ? "⚠️" : "❓";
    var bg = danger ? "background:rgba(212,102,96,.14);color:#d46660" : "background:rgba(85,136,221,.14);color:#5588dd";
    openModal(
      '<div class="modal confirm">' +
      '<div class="modal-body">' +
      '<div class="confirm-icon" style="' + bg + '">' + ic + '</div>' +
      '<div class="modal-title" style="text-align:center">' + title + '</div>' +
      '<p style="color:#64748b;font-size:.9rem;margin-top:.5rem">' + msg + '</p>' +
      '<div style="display:flex;gap:.6rem;justify-content:center;margin-top:1.4rem">' +
      '<button class="btn btn-ghost" onclick="SIPKBM.closeModal()">Batal</button>' +
      '<button class="btn ' + (danger ? "btn-cta" : "btn-primary") + '" id="confirmYes">Ya, lanjut</button>' +
      '</div></div></div>'
    );
    var yes = $("#confirmYes");
    if (yes) yes.addEventListener("click", function () { closeModal(); onYes(); });
  }

  /* ---------- localStorage state ---------- */
  var KEY = "sipkbm_state_v1";
  var ICONS = {
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>',
    money: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    grad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };

  function seed() {
    return {
      siswa: [
        { id: "S001", nama: "Budi Santoso", program: "Paket C", kelas: "XII", status: "Aktif" },
        { id: "S002", nama: "Siti Aminah", program: "Paket B", kelas: "IX", status: "Aktif" },
        { id: "S003", nama: "Andi Wijaya", program: "Paket C", kelas: "XI", status: "Aktif" },
        { id: "S004", nama: "Dewi Lestari", program: "Paket A", kelas: "VI", status: "Cuti" },
        { id: "S005", nama: "Rizki Pratama", program: "Paket C", kelas: "X", status: "Nonaktif" },
        { id: "S006", nama: "Maya Sari", program: "Paket B", kelas: "VIII", status: "Aktif" }
      ],
      keuangan: [
        { id: "INV-0726", ket: "SPP Juli — Siti Aminah", tipe: "Pemasukan", nominal: 150000, status: "Lunas" },
        { id: "INV-0725", ket: "SPP Juli — Budi Santoso", tipe: "Pemasukan", nominal: 150000, status: "Lunas" },
        { id: "OUT-014", ket: "Alat Tulis Kantor", tipe: "Pengeluaran", nominal: 320000, status: "Lunas" },
        { id: "INV-0724", ket: "SPP Juli — Andi Wijaya", tipe: "Pemasukan", nominal: 150000, status: "Pending" },
        { id: "OUT-013", ket: "Listrik Bulanan", tipe: "Pengeluaran", nominal: 450000, status: "Lunas" }
      ],
      ppdb: [
        { id: "PPDB-031", nama: "Joko Susilo", program: "Paket C", status: "Menunggu" },
        { id: "PPDB-030", nama: "Nina Fatimah", program: "Paket B", status: "Diverifikasi" },
        { id: "PPDB-029", nama: "Hendra Kusuma", program: "Paket A", status: "Ditolak" },
        { id: "PPDB-028", nama: "Sela Marlina", program: "Paket C", status: "Diverifikasi" }
      ],
      absensi: {},
      raport: {},
      perpus: [
        { id: "B001", judul: "Matematika Dasar", pengarang: "Dr. Suharto", stok: 12, dipinjam: 3 },
        { id: "B002", judul: "Bahasa Indonesia Kreatif", pengarang: "Rina M.", stok: 8, dipinjam: 1 },
        { id: "B003", judul: "Sejarah Nusantara", pengarang: "Prof. Wijaya", stok: 5, dipinjam: 5 },
        { id: "B004", judul: "Fisika Terapan", pengarang: "A. Santoso", stok: 10, dipinjam: 0 }
      ],
      mapel: [
        { id: "MP001", nama: "Matematika", kelompok: "Wajib", kkm: 75 },
        { id: "MP002", nama: "Bahasa Indonesia", kelompok: "Wajib", kkm: 70 },
        { id: "MP003", nama: "Bahasa Inggris", kelompok: "Wajib", kkm: 70 },
        { id: "MP004", nama: "Ilmu Pengetahuan Alam", kelompok: "Wajib", kkm: 72 },
        { id: "MP005", nama: "Pendidikan Kewarganegaraan", kelompok: "Wajib", kkm: 70 },
        { id: "MP006", nama: "Seni Budaya", kelompok: "Peminatan", kkm: 65 }
      ],
      settings: {
        namaPKBM: "PKBM Cerdas", npsn: "12345678", kecamatan: "Lowokwaru", kota: "Malang",
        kepala: "Heni S.", kontak: "08123456789", tema: "emerald"
      }
    };
  }
  var state = null;
  var WEB_APP_URL = (window.SIPKBM_CONFIG && window.SIPKBM_CONFIG.WEB_APP_URL) ? window.SIPKBM_CONFIG.WEB_APP_URL : "";

  function sheetPull(tabel) {
    return fetch(WEB_APP_URL + "?action=read&tabel=" + tabel, { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j.ok) throw new Error(j.error || "read gagal"); return j.data || []; });
  }
  function sheetPush(tabel, rows) {
    return fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "write", tabel: tabel, data: rows })
    }).then(function (r) { return r.json(); })
      .then(function (j) { if (!j.ok) throw new Error(j.error || "write gagal"); return true; });
  }
  function load() {
    if (WEB_APP_URL) {
      try {
        return Promise.all([
          sheetPull("siswa"), sheetPull("keuangan"), sheetPull("ppdb"),
          sheetPull("perpus"), sheetPull("mapel"), sheetPull("settings")
        ]).then(function (r) {
          var s = {
            siswa: r[0], keuangan: r[1], ppdb: r[2], perpus: r[3], mapel: r[4],
            absensi: {}, raport: {},
            settings: (r[5] && r[5].length) ? r[5].reduce(function (a, x) { a[x.k] = x.v; return a; }, {}) : seed().settings
          };
          var base = seed();
          ["siswa", "keuangan", "ppdb", "perpus", "mapel", "settings", "absensi", "raport"].forEach(function (k) {
            if (!s[k] || (Array.isArray(s[k]) && !s[k].length)) s[k] = base[k];
          });
          try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
          return s;
        }).catch(function () {
          try { var raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
          return seed();
        });
      } catch (e) {
        try { var raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e2) {}
        return seed();
      }
    }
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        var base = seed();
        ["perpus", "mapel", "settings"].forEach(function (k) { if (!s[k]) s[k] = base[k]; });
        return s;
      }
    } catch (e) {}
    return seed();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    if (WEB_APP_URL) {
      var tasks = [
        ["siswa", state.siswa], ["keuangan", state.keuangan], ["ppdb", state.ppdb],
        ["perpus", state.perpus], ["mapel", state.mapel],
        ["settings", Object.keys(state.settings || {}).map(function (k) { return { k: k, v: state.settings[k] }; })]
      ];
      Promise.all(tasks.map(function (t) { return sheetPush(t[0], t[1]).catch(function () { return false; }); }))
        .then(function () {});
    }
  }

  /* expose API for inline handlers + other modules */
  window.SIPKBM = {
    state: null,
    toast: toast, openModal: openModal, closeModal: closeModal, confirmDialog: confirmDialog,
    save: save, ICONS: ICONS, $: $, $$: $$,
    fmt: function (n) { return "Rp " + Number(n).toLocaleString("id-ID"); },
    nextId: function (prefix) {
      var arr = prefix === "S" ? state.siswa
        : (prefix === "INV" || prefix === "OUT") ? state.keuangan
        : prefix === "PPDB" ? state.ppdb
        : prefix === "B" ? state.perpus
        : prefix === "MP" ? state.mapel : [];
      var max = 0;
      arr.forEach(function (x) {
        var m = String(x.id).match(/(\d+)/); if (m) max = Math.max(max, parseInt(m[1], 10));
      });
      return prefix + String(max + 1).padStart(3, "0");
    }
  };

  /* ============================================================
     LANDING / AUTH (runs on every page)
     ============================================================ */
  var nav = $("#nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 20); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  $$(".faq-item").forEach(function (item) {
    item.addEventListener("click", function () {
      var open = item.classList.toggle("open");
      var panel = item.querySelector(".faq-panel");
      var icon = item.querySelector(".faq-icon");
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
      if (icon) icon.style.transform = open ? "rotate(45deg)" : "rotate(0deg)";
    });
  });

  /* login */
  var togglePw = $("#togglePw");
  if (togglePw) {
    var pw = $("#password");
    togglePw.addEventListener("click", function () { pw.type = pw.type === "password" ? "text" : "password"; });
  }
  var loginForm = $("#loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!$("#email").value.trim() || !$("#password").value) { toast("Email dan password wajib diisi", "err"); return; }
      toast("Login berhasil — mengarahkan ke dashboard…", "ok");
      setTimeout(function () { window.location.href = "dashboard.html"; }, 900);
    });
  }

  /* register */
  function bindRegToggle() {
    $$("[data-toggle]").forEach(function (ic) {
      ic.addEventListener("click", function () {
        var el = document.getElementById(ic.getAttribute("data-toggle"));
        if (el) el.type = el.type === "password" ? "text" : "password";
      });
    });
  }
  bindRegToggle();
  var regForm = $("#regForm");
  if (regForm) {
    var rN = $("#name"), rE = $("#email"), rW = $("#wa"), rP = $("#password"), rC = $("#confirm"), rT = $("#terms"), rB = $("#submitBtn");
    function valid() {
      var ok = rN.value.trim() && /\S+@\S+\.\S+/.test(rE.value) && rW.value.trim().length >= 8 &&
               rP.value.length >= 8 && rP.value === rC.value && rT.checked;
      rB.disabled = !ok; rB.style.opacity = ok ? "1" : ".6"; rB.style.cursor = ok ? "pointer" : "not-allowed";
      return ok;
    }
    [rN, rE, rW, rP, rC, rT].forEach(function (el) { el.addEventListener("input", valid); el.addEventListener("change", valid); });
    regForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!valid()) { toast("Periksa kembali data pendaftaran", "err"); return; }
      toast("PKBM berhasil didaftarkan — trial 14 hari aktif!", "ok");
      setTimeout(function () { window.location.href = "dashboard.html"; }, 1000);
    });
  }

  /* dashboard init */
  var content = $("#content");
  if (content) {
    state = load();
    if (state && typeof state.then === "function") {
      state.then(function (s) { window.SIPKBM.state = s; initDashboard(); });
    } else {
      window.SIPKBM.state = state; initDashboard();
    }
  }

  /* ============================================================
     DASHBOARD ENGINE
     ============================================================ */
  function initDashboard() {
    var sideNav = $("#sideNav");
    var content = $("#content");
    var pageTitle = $("#pageTitle");
    var crumb = $("#crumb");

    var VIEWS = {
      overview: viewOverview, siswa: viewSiswa, absensi: viewAbsensi,
      raport: viewRaport, keuangan: viewKeuangan, ppdb: viewPPDB,
      perpus: viewPerpus, kurikulum: viewKurikulum, pengaturan: viewPengaturan
    };
    var TITLES = { overview: "Dashboard", siswa: "Siswa", absensi: "Absensi", raport: "Raport", keuangan: "Keuangan", ppdb: "PPDB Online", perpus: "Perpustakaan", kurikulum: "Kurikulum", pengaturan: "Pengaturan" };

    function render(view) {
      if (!VIEWS[view]) view = "overview";
      content.innerHTML = VIEWS[view]();
      if (pageTitle) pageTitle.textContent = TITLES[view];
      if (crumb) crumb.textContent = "PKBM Cerdas / " + TITLES[view];
      $$(".nav-item[data-view]").forEach(function (n) { n.classList.toggle("active", n.getAttribute("data-view") === view); });
      if (window.SIPKBM["after_" + view]) window.SIPKBM["after_" + view]();
    }
    window.SIPKBM.__nav = render;

    if (sideNav) {
      sideNav.addEventListener("click", function (e) {
        var item = e.target.closest(".nav-item[data-view]");
        if (item) render(item.getAttribute("data-view"));
      });
    }
    render("overview");
  }

  /* ---------- shared render helpers ---------- */
  function stat(icClass, icon, val, label, delta, up) {
    return '<div class="stat"><div class="ic ' + icClass + '">' + icon + '</div>' +
      '<div><div class="v">' + val + '</div><div class="l">' + label + '</div>' +
      (delta ? '<div class="delta ' + (up ? "up" : "down") + '">' + (up ? "▲ " : "▼ ") + delta + '</div>' : '') + '</div></div>';
  }
  function tableHead(cols) { return '<thead><tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join("") + '</tr></thead>'; }
  function av(name) { return '<span class="av-sm">' + String(name).slice(0, 2).toUpperCase() + '</span>'; }
  function progRow(label, pct, c) {
    var bar = c === "amber" ? "amber" : c === "blue" ? "blue" : "";
    return '<div style="margin-bottom:.9rem"><div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:.35rem"><span>' + label + '</span><span style="color:#64748b">' + pct + '%</span></div>' +
      '<div class="bar ' + bar + '"><span style="width:' + pct + '%"></span></div></div>';
  }
  function sectionHead(title, sub) {
    return '<div style="margin-bottom:1.3rem"><h2 class="font-display" style="font-size:1.4rem;font-weight:800;color:#1a2b4a">' + title + '</h2>' +
      (sub ? '<p style="color:#64748b;font-size:.9rem;margin-top:.2rem">' + sub + '</p>' : '') + '</div>';
  }
  function emptyState(icon, text) {
    return '<div class="empty"><div class="em-ic">' + icon + '</div><p>' + text + '</p></div>';
  }
  function money(n) { return "Rp " + Number(n).toLocaleString("id-ID"); }

  /* ============================================================
     VIEW: OVERVIEW
     ============================================================ */
  function viewOverview() {
    var s = state.siswa, k = state.keuangan;
    var aktif = s.filter(function (x) { return x.status === "Aktif"; }).length;
    var masuk = k.filter(function (x) { return x.tipe === "Pemasukan" && x.status === "Lunas"; }).reduce(function (a, x) { return a + x.nominal; }, 0);
    var keluar = k.filter(function (x) { return x.tipe === "Pengeluaran" && x.status === "Lunas"; }).reduce(function (a, x) { return a + x.nominal; }, 0);
    var hadir = Object.values(state.absensi).filter(function (v) { return v === "Hadir"; }).length;
    var totalAbs = Object.keys(state.absensi).length || 1;
    var persen = Math.round((hadir / totalAbs) * 100);
    var prog = { "Paket C": 0, "Paket B": 0, "Paket A": 0, "PAUD": 0 };
    s.forEach(function (x) { if (prog[x.program] != null) prog[x.program]++; });
    var tot = s.length || 1;
    var pct = function (n) { return Math.round((n / tot) * 100); };

    return '' +
      '<div class="stat-grid">' +
        stat("ic-emerald", ICONS.users, aktif, "Siswa Aktif", "12 bulan ini", true) +
        stat("ic-blue", ICONS.grad, "18", "Tutor Aktif", "2 baru", true) +
        stat("ic-amber", ICONS.cal, persen + "%", "Kehadiran", "3% minggu lalu", false) +
        stat("ic-red", ICONS.money, money(masuk), "Pemasukan", "8% vs bulan lalu", true) +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="panel">' +
          '<div class="panel-head"><div class="panel-title">Aktivitas Terbaru</div><span class="badge badge-slate">7 hari</span></div>' +
          '<table class="tbl"><tbody>' +
            actRow("Pendaftaran baru", (s[0] ? s[0].nama : "—") + " — " + (s[0] ? s[0].program : ""), "2 jam lalu", "emerald") +
            actRow("Pembayaran SPP", "Siti Aminah — " + money(150000), "5 jam lalu", "blue") +
            actRow("Absensi hari ini", hadir + " hadir / " + totalAbs + " siswa", "Hari ini", "amber") +
            actRow("Transaksi", "Saldo " + money(masuk - keluar), "Update", "emerald") +
            actRow("Pengeluaran", "Alat tulis " + money(320000), "3 hari lalu", "red") +
          '</tbody></table>' +
        '</div>' +
        '<div class="panel">' +
          '<div class="panel-head"><div class="panel-title">Distribusi Program</div></div>' +
          progRow("Paket C (Kesetaraan)", pct(prog["Paket C"]), "emerald") +
          progRow("Paket B (Kesetaraan)", pct(prog["Paket B"]), "blue") +
          progRow("Paket A (Kesetaraan)", pct(prog["Paket A"]), "emerald") +
          progRow("PAUD", pct(prog["PAUD"]), "red") +
          '<div style="margin-top:1.2rem"><button class="btn btn-primary btn-block" onclick="SIPKBM.__nav(\'siswa\')">Kelola Siswa →</button></div>' +
        '</div>' +
      '</div>';
  }
  function actRow(t, d, time, c) {
    return '<tr><td><span class="badge badge-' + c + '" style="margin-right:.6rem">●</span><span class="name">' + t + '</span><div style="font-size:.78rem;color:#94a3b8">' + d + '</div></td><td style="text-align:right;color:#94a3b8;font-size:.82rem">' + time + '</td></tr>';
  }

  /* ============================================================
     VIEW: SISWA  (CRUD + filter + search)
     ============================================================ */
  var siswaFilter = "Semua", siswaQ = "";
  function viewSiswa() {
    var rows = state.siswa.slice();
    if (siswaFilter !== "Semua") rows = rows.filter(function (x) { return x.status === siswaFilter; });
    if (siswaQ) { var q = siswaQ.toLowerCase(); rows = rows.filter(function (x) { return x.nama.toLowerCase().indexOf(q) >= 0 || x.id.toLowerCase().indexOf(q) >= 0; }); }
    var aktif = state.siswa.filter(function (x) { return x.status === "Aktif"; }).length;

    var chips = ["Semua", "Aktif", "Cuti", "Nonaktif"].map(function (f) {
      return '<span class="chip ' + (siswaFilter === f ? "active" : "") + '" data-f="' + f + '">' + f + '</span>';
    }).join("");
    chips += '<span class="chip" data-act="add" style="margin-left:auto;background:var(--a-emerald);color:#fff;border-color:var(--a-emerald)">+ Tambah Siswa</span>';

    var body = rows.length ? '<table class="tbl">' + tableHead(["", "NIS", "Nama", "Program", "Kelas", "Status", ""]) +
      '<tbody>' + rows.map(function (r) {
        var sc = r.status === "Aktif" ? "emerald" : r.status === "Cuti" ? "amber" : "red";
        return '<tr><td></td><td>' + r.id + '</td>' +
          '<td>' + av(r.nama) + '<span class="name">' + r.nama + '</span></td>' +
          '<td>' + r.program + '</td><td>' + r.kelas + '</td>' +
          '<td><span class="badge badge-' + sc + '">' + r.status + '</span></td>' +
          '<td><div class="row-actions">' +
            '<button class="mini-btn edit" title="Edit" data-edit="' + r.id + '">' + editIc() + '</button>' +
            '<button class="mini-btn danger" title="Hapus" data-del="' + r.id + '">' + delIc() + '</button>' +
          '</div></td></tr>';
      }).join("") + '</tbody></table>'
      : emptyState(ICONS.users, "Tidak ada siswa dengan filter ini.");

    return sectionHead("Manajemen Siswa", aktif + " aktif dari " + state.siswa.length + " siswa") +
      '<div class="filters">' + chips + '</div>' +
      '<div class="panel" id="siswaPanel">' + body + '</div>';
  }
  function editIc() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>'; }
  function delIc() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'; }

  function siswaForm(rec) {
    var r = rec || {};
    openModal(
      '<div class="modal"><div class="modal-head"><div class="modal-title">' + (rec ? "Edit Siswa" : "Tambah Siswa") + '</div>' +
      '<button class="modal-close" onclick="SIPKBM.closeModal()">×</button></div>' +
      '<div class="modal-body">' +
        '<div class="field"><label class="label">Nama Lengkap</label><input class="input" id="f_nama" value="' + (r.nama || "") + '" placeholder="Nama siswa"></div>' +
        '<div class="row-2">' +
          '<div class="field"><label class="label">Program</label><select class="sel" id="f_prog"><option ' + (r.program === "Paket A" ? "selected" : "") + '>Paket A</option><option ' + (r.program === "Paket B" ? "selected" : "") + '>Paket B</option><option ' + (r.program === "Paket C" || !r.program ? "selected" : "") + '>Paket C</option><option ' + (r.program === "PAUD" ? "selected" : "") + '>PAUD</option></select></div>' +
          '<div class="field"><label class="label">Kelas</label><input class="input" id="f_kelas" value="' + (r.kelas || "") + '" placeholder="Mis. XII"></div>' +
        '</div>' +
        '<div class="field"><label class="label">Status</label><select class="sel" id="f_status"><option ' + (r.status === "Aktif" || !r.status ? "selected" : "") + '>Aktif</option><option ' + (r.status === "Cuti" ? "selected" : "") + '>Cuti</option><option ' + (r.status === "Nonaktif" ? "selected" : "") + '>Nonaktif</option></select></div>' +
      '</div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" onclick="SIPKBM.closeModal()">Batal</button>' +
      '<button class="btn btn-primary" id="f_save">' + (rec ? "Simpan" : "Tambah") + '</button></div></div>'
    );
    $("#f_save").addEventListener("click", function () {
      var nama = $("#f_nama").value.trim();
      if (!nama) { toast("Nama wajib diisi", "err"); return; }
      if (rec) { rec.nama = nama; rec.program = $("#f_prog").value; rec.kelas = $("#f_kelas").value; rec.status = $("#f_status").value; }
      else { state.siswa.push({ id: SIPKBM.nextId("S"), nama: nama, program: $("#f_prog").value, kelas: $("#f_kelas").value, status: $("#f_status").value }); }
      save(); closeModal(); SIPKBM.__nav("siswa"); toast("Data siswa tersimpan", "ok");
    });
  }

  window.SIPKBM.after_siswa = function () {
    $$(".filters .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        if (c.getAttribute("data-act") === "add") { siswaForm(null); return; }
        if (c.getAttribute("data-f")) { siswaFilter = c.getAttribute("data-f"); SIPKBM.__nav("siswa"); }
      });
    });
    var sb = $("#siswaSearch");
    if (sb) sb.addEventListener("input", function () { siswaQ = sb.value; SIPKBM.__nav("siswa"); });
    $$("#siswaPanel [data-edit]").forEach(function (b) {
      b.addEventListener("click", function () { var id = b.getAttribute("data-edit"); siswaForm(state.siswa.find(function (x) { return x.id === id; })); });
    });
    $$("#siswaPanel [data-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-del"); var rec = state.siswa.find(function (x) { return x.id === id; });
        confirmDialog("Hapus Siswa", "Yakin hapus " + (rec ? rec.nama : id) + "?", function () {
          state.siswa = state.siswa.filter(function (x) { return x.id !== id; });
          delete state.absensi[id]; delete state.raport[id]; save(); SIPKBM.__nav("siswa"); toast("Siswa dihapus", "ok");
        }, true);
      });
    });
  };

  /* ============================================================
     VIEW: ABSENSI  (input per siswa + rekap live)
     ============================================================ */
  function viewAbsensi() {
    var aktif = state.siswa.filter(function (x) { return x.status === "Aktif"; });
    var hadir = aktif.filter(function (x) { return state.absensi[x.id] === "Hadir"; }).length;
    var izin = aktif.filter(function (x) { return state.absensi[x.id] === "Izin"; }).length;
    var alpha = aktif.filter(function (x) { return !state.absensi[x.id] || state.absensi[x.id] === "Alpha"; }).length;
    var total = aktif.length || 1;
    var pctH = Math.round((hadir / total) * 100);

    var rows = aktif.map(function (r) {
      var v = state.absensi[r.id] || "Alpha";
      var seg = ["Hadir", "Izin", "Alpha"].map(function (o) {
        return '<button data-abs="' + r.id + '" data-val="' + o + '" class="' + (v === o ? "active" : "") + '" style="padding:.35rem .7rem;font-size:.78rem;font-weight:600;color:' + (v === o ? "#1a2b4a" : "#64748b") + ';border-radius:7px;background:' + (v === o ? (o === "Hadir" ? "rgba(85,180,139,.18)" : o === "Izin" ? "rgba(225,168,98,.18)" : "rgba(212,102,96,.18)") : "transparent") + '">' + o + '</button>';
      }).join("");
      return '<tr><td>' + av(r.nama) + '<span class="name">' + r.nama + '</span><div style="font-size:.74rem;color:#94a3b8">' + r.kelas + ' · ' + r.program + '</div></td>' +
        '<td style="width:240px"><div class="seg">' + seg + '</div></td>' +
        '<td style="text-align:right"><span class="badge badge-' + (v === "Hadir" ? "emerald" : v === "Izin" ? "amber" : "red") + '">' + v + '</span></td></tr>';
    }).join("");

    return sectionHead("Absensi Digital", "Hari ini · klik status tiap siswa") +
      '<div class="stat-grid">' +
        stat("ic-emerald", ICONS.cal, hadir, "Hadir") +
        stat("ic-amber", ICONS.alert, izin, "Izin / Sakit") +
        stat("ic-red", ICONS.alert, alpha, "Tanpa Keterangan") +
        stat("ic-blue", ICONS.users, pctH + "%", "Rata-rata Hadir") +
      '</div>' +
      '<div class="panel"><div class="panel-head"><div class="panel-title">Input Kehadiran</div>' +
      '<button class="btn btn-ghost" style="padding:.5rem 1rem;font-size:.85rem" onclick="SIPKBM.resetAbsen()">Reset</button></div>' +
      '<table class="tbl">' + tableHead(["Siswa", "Status", ""]) + '<tbody>' + (rows || emptyState(ICONS.users, "Tidak ada siswa aktif.")) + '</tbody></table></div>';
  }
  window.SIPKBM.resetAbsen = function () {
    confirmDialog("Reset Absensi", "Kosongkan semua input absensi hari ini?", function () {
      state.absensi = {}; save(); SIPKBM.__nav("absensi"); toast("Absensi direset", "ok");
    });
  };
  window.SIPKBM.after_absensi = function () {
    $$("[data-abs]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.absensi[b.getAttribute("data-abs")] = b.getAttribute("data-val");
        save(); SIPKBM.__nav("absensi");
      });
    });
  };

  /* ============================================================
     VIEW: RAPORT  (input nilai + predikat + cetak)
     ============================================================ */
  function predikat(n) { return n >= 90 ? "A" : n >= 80 ? "B" : n >= 70 ? "C" : n >= 60 ? "D" : "E"; }
  function viewRaport() {
    var rows = state.siswa.filter(function (x) { return x.status !== "Nonaktif"; }).map(function (r) {
      var rp = state.raport[r.id];
      var rata = rp ? rp.rata : "";
      var pred = rp ? rp.predikat : "—";
      var pc = rp ? (pred === "A" ? "emerald" : pred === "B" ? "blue" : pred === "C" ? "amber" : "red") : "slate";
      return '<tr><td>' + av(r.nama) + '<span class="name">' + r.nama + '</span><div style="font-size:.74rem;color:#94a3b8">' + r.program + '</div></td>' +
        '<td style="width:130px"><input class="input" data-nilai="' + r.id + '" value="' + (rata === "" ? "" : rata) + '" placeholder="0-100" style="padding:.5rem .7rem;font-size:.85rem;width:90px"></td>' +
        '<td><span class="badge badge-' + pc + '" data-pred="' + r.id + '">' + pred + '</span></td>' +
        '<td style="text-align:right"><button class="mini-btn edit" title="Simpan" data-savenilai="' + r.id + '">' + saveIc() + '</button></td></tr>';
    }).join("");

    return sectionHead("Raport Digital", "Isi nilai rata-rata, predikat otomatis") +
      '<div class="filters"><span class="chip active">Semua</span><span class="chip" onclick="SIPKBM.printRaport()">🖨 Cetak Semua</span></div>' +
      '<div class="panel"><table class="tbl">' + tableHead(["Nama", "Nilai Rata-rata", "Predikat", ""]) + '<tbody>' + rows + '</tbody></table></div>';
  }
  function saveIc() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>'; }
  window.SIPKBM.after_raport = function () {
    $$("[data-savenilai]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-savenilai");
        var inp = $('[data-nilai="' + id + '"]');
        var n = parseFloat(inp.value);
        if (isNaN(n) || n < 0 || n > 100) { toast("Nilai 0-100", "err"); return; }
        state.raport[id] = { rata: n, predikat: predikat(n) };
        save(); SIPKBM.__nav("raport"); toast("Nilai tersimpan", "ok");
      });
    });
  };
  window.SIPKBM.printRaport = function () { window.print(); };

  /* ============================================================
     VIEW: KEUANGAN  (CRUD transaksi + saldo live)
     ============================================================ */
  function viewKeuangan() {
    var k = state.keuangan;
    var masuk = k.filter(function (x) { return x.tipe === "Pemasukan" && x.status === "Lunas"; }).reduce(function (a, x) { return a + x.nominal; }, 0);
    var keluar = k.filter(function (x) { return x.tipe === "Pengeluaran" && x.status === "Lunas"; }).reduce(function (a, x) { return a + x.nominal; }, 0);
    var pending = k.filter(function (x) { return x.status === "Pending"; }).length;
    var saldo = masuk - keluar;

    var rows = k.map(function (r) {
      var sc = r.status === "Lunas" ? "emerald" : r.status === "Pending" ? "amber" : "red";
      return '<tr><td class="name">' + r.id + '</td><td>' + r.ket + '</td><td>' + r.tipe + '</td>' +
        '<td class="name">' + money(r.nominal) + '</td>' +
        '<td><span class="badge badge-' + sc + '">' + r.status + '</span></td>' +
        '<td><div class="row-actions">' +
          (r.status === "Pending" ? '<button class="mini-btn edit" title="Tandai Lunas" data-lunas="' + r.id + '">' + checkIc() + '</button>' : '') +
          '<button class="mini-btn danger" title="Hapus" data-delk="' + r.id + '">' + delIc() + '</button>' +
        '</div></td></tr>';
    }).join("");

    return sectionHead("Keuangan & SPP", "Saldo saat ini: " + money(saldo)) +
      '<div class="stat-grid">' +
        stat("ic-emerald", ICONS.money, money(masuk), "Pemasukan") +
        stat("ic-red", ICONS.money, money(keluar), "Pengeluaran") +
        stat("ic-blue", ICONS.money, money(saldo), "Saldo") +
        stat("ic-amber", ICONS.alert, pending, "Pending") +
      '</div>' +
      '<div class="panel"><div class="panel-head"><div class="panel-title">Transaksi</div>' +
      '<button class="btn btn-primary" style="padding:.5rem 1rem;font-size:.85rem" data-act="addk">+ Catat</button></div>' +
      '<table class="tbl">' + tableHead(["No.", "Keterangan", "Tipe", "Nominal", "Status", ""]) + '<tbody>' + rows + '</tbody></table></div>';
  }
  function checkIc() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'; }

  function keuForm() {
    openModal(
      '<div class="modal"><div class="modal-head"><div class="modal-title">Catat Transaksi</div>' +
      '<button class="modal-close" onclick="SIPKBM.closeModal()">×</button></div>' +
      '<div class="modal-body">' +
        '<div class="field"><label class="label">Keterangan</label><input class="input" id="k_ket" placeholder="Mis. SPP Agustus — Budi"></div>' +
        '<div class="row-2">' +
          '<div class="field"><label class="label">Tipe</label><select class="sel" id="k_tipe"><option>Pemasukan</option><option>Pengeluaran</option></select></div>' +
          '<div class="field"><label class="label">Nominal (Rp)</label><input class="input" id="k_nom" type="number" placeholder="150000"></div>' +
        '</div>' +
        '<div class="field"><label class="label">Status</label><select class="sel" id="k_status"><option>Lunas</option><option>Pending</option></select></div>' +
      '</div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" onclick="SIPKBM.closeModal()">Batal</button>' +
      '<button class="btn btn-primary" id="k_save">Simpan</button></div></div>'
    );
    $("#k_save").addEventListener("click", function () {
      var ket = $("#k_ket").value.trim(), nom = parseFloat($("#k_nom").value);
      if (!ket || isNaN(nom) || nom <= 0) { toast("Isi keterangan & nominal", "err"); return; }
      var prefix = $("#k_tipe").value === "Pemasukan" ? "INV" : "OUT";
      state.keuangan.unshift({ id: SIPKBM.nextId(prefix), ket: ket, tipe: $("#k_tipe").value, nominal: nom, status: $("#k_status").value });
      save(); closeModal(); SIPKBM.__nav("keuangan"); toast("Transaksi dicatat", "ok");
    });
  }
  window.SIPKBM.after_keuangan = function () {
    var add = $('[data-act="addk"]');
    if (add) add.addEventListener("click", keuForm);
    $$("[data-lunas]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = state.keuangan.find(function (x) { return x.id === b.getAttribute("data-lunas"); });
        if (r) { r.status = "Lunas"; save(); SIPKBM.__nav("keuangan"); toast("Ditandai lunas", "ok"); }
      });
    });
    $$("[data-delk]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-delk");
        confirmDialog("Hapus Transaksi", "Yakin hapus " + id + "?", function () {
          state.keuangan = state.keuangan.filter(function (x) { return x.id !== id; });
          save(); SIPKBM.__nav("keuangan"); toast("Transaksi dihapus", "ok");
        }, true);
      });
    });
  };

  /* ============================================================
     VIEW: PPDB  (verifikasi / tolak + form pendaftaran)
     ============================================================ */
  var ppdbFilter = "Semua";
  function viewPPDB() {
    var rows = state.ppdb.slice();
    if (ppdbFilter !== "Semua") rows = rows.filter(function (x) { return x.status === ppdbFilter; });
    var baru = state.ppdb.filter(function (x) { return x.status === "Menunggu"; }).length;
    var diterima = state.ppdb.filter(function (x) { return x.status === "Diverifikasi"; }).length;
    var ditolak = state.ppdb.filter(function (x) { return x.status === "Ditolak"; }).length;

    var chips = ["Semua", "Menunggu", "Diverifikasi", "Ditolak"].map(function (f) {
      return '<span class="chip ' + (ppdbFilter === f ? "active" : "") + '" data-pf="' + f + '">' + f + '</span>';
    }).join("");
    chips += '<span class="chip" data-act="addp" style="margin-left:auto;background:var(--a-emerald);color:#fff;border-color:var(--a-emerald)">+ Buka Form</span>';

    var body = rows.length ? '<table class="tbl">' + tableHead(["ID", "Nama", "Program", "Status", ""]) +
      '<tbody>' + rows.map(function (r) {
        var sc = r.status === "Diverifikasi" ? "emerald" : r.status === "Menunggu" ? "amber" : "red";
        var acts = r.status === "Menunggu"
          ? '<button class="mini-btn edit" title="Verifikasi" data-verif="' + r.id + '">' + checkIc() + '</button><button class="mini-btn danger" title="Tolak" data-tolak="' + r.id + '">' + delIc() + '</button>'
          : '<span style="color:#94a3b8;font-size:.8rem">' + (r.status === "Diverifikasi" ? "✓ Diterima" : "✕ Ditolak") + '</span>';
        return '<tr><td class="name">' + r.id + '</td><td>' + av(r.nama) + '<span class="name">' + r.nama + '</span></td><td>' + r.program + '</td>' +
          '<td><span class="badge badge-' + sc + '">' + r.status + '</span></td><td><div class="row-actions">' + acts + '</div></td></tr>';
      }).join("") + '</tbody></table>'
      : emptyState(ICONS.grad, "Tidak ada pendaftar.");

    return sectionHead("PPDB Online", baru + " menunggu verifikasi") +
      '<div class="stat-grid">' +
        stat("ic-blue", ICONS.grad, state.ppdb.length, "Total Pendaftar") +
        stat("ic-amber", ICONS.alert, baru, "Menunggu") +
        stat("ic-emerald", ICONS.users, diterima, "Diverifikasi") +
        stat("ic-red", ICONS.alert, ditolak, "Ditolak") +
      '</div>' +
      '<div class="filters">' + chips + '</div>' +
      '<div class="panel" id="ppdbPanel">' + body + '</div>';
  }
  function ppdbForm() {
    openModal(
      '<div class="modal"><div class="modal-head"><div class="modal-title">Formulir PPDB</div>' +
      '<button class="modal-close" onclick="SIPKBM.closeModal()">×</button></div>' +
      '<div class="modal-body">' +
        '<div class="field"><label class="label">Nama Calon Siswa</label><input class="input" id="p_nama" placeholder="Nama lengkap"></div>' +
        '<div class="field"><label class="label">Program</label><select class="sel" id="p_prog"><option>Paket A</option><option>Paket B</option><option>Paket C</option><option>PAUD</option></select></div>' +
      '</div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" onclick="SIPKBM.closeModal()">Batal</button>' +
      '<button class="btn btn-primary" id="p_save">Daftarkan</button></div></div>'
    );
    $("#p_save").addEventListener("click", function () {
      var nama = $("#p_nama").value.trim();
      if (!nama) { toast("Nama wajib diisi", "err"); return; }
      state.ppdb.unshift({ id: SIPKBM.nextId("PPDB"), nama: nama, program: $("#p_prog").value, status: "Menunggu" });
      save(); closeModal(); SIPKBM.__nav("ppdb"); toast("Pendaftar masuk antrean", "ok");
    });
  }
  window.SIPKBM.after_ppdb = function () {
    $$(".filters .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        if (c.getAttribute("data-act") === "addp") { ppdbForm(); return; }
        if (c.getAttribute("data-pf")) { ppdbFilter = c.getAttribute("data-pf"); SIPKBM.__nav("ppdb"); }
      });
    });
    $$("[data-verif]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = state.ppdb.find(function (x) { return x.id === b.getAttribute("data-verif"); });
        if (r) { r.status = "Diverifikasi"; save(); SIPKBM.__nav("ppdb"); toast(r.nama + " diterima", "ok"); }
      });
    });
    $$("[data-tolak]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = state.ppdb.find(function (x) { return x.id === b.getAttribute("data-tolak"); });
        if (r) { r.status = "Ditolak"; save(); SIPKBM.__nav("ppdb"); toast(r.nama + " ditolak", "ok"); }
      });
    });
  };

  /* ============================================================
     VIEW: PERPUSTAKAAN  (CRUD buku + pinjam/kembali)
     ============================================================ */
  function viewPerpus() {
    var p = state.perpus;
    var total = p.reduce(function (a, x) { return a + x.stok + x.dipinjam; }, 0);
    var dipinjam = p.reduce(function (a, x) { return a + x.dipinjam; }, 0);
    var tersedia = total - dipinjam;

    var rows = p.map(function (r) {
      var sc = r.stok > 0 ? "emerald" : "red";
      return '<tr><td class="name">' + r.id + '</td>' +
        '<td>' + av(r.judul) + '<span class="name">' + r.judul + '</span><div style="font-size:.74rem;color:#94a3b8">' + r.pengarang + '</div></td>' +
        '<td>' + r.stok + '</td><td>' + r.dipinjam + '</td>' +
        '<td><span class="badge badge-' + sc + '">' + (r.stok > 0 ? "Tersedia" : "Habis") + '</span></td>' +
        '<td><div class="row-actions">' +
          (r.stok > 0 ? '<button class="mini-btn edit" title="Pinjam" data-pinjam="' + r.id + '">' + borrowIc() + '</button>' : '') +
          (r.dipinjam > 0 ? '<button class="mini-btn" title="Kembali" data-kembali="' + r.id + '" style="color:var(--a-blue)">' + backIc() + '</button>' : '') +
          '<button class="mini-btn edit" title="Edit" data-editb="' + r.id + '">' + editIc() + '</button>' +
          '<button class="mini-btn danger" title="Hapus" data-delb="' + r.id + '">' + delIc() + '</button>' +
        '</div></td></tr>';
    }).join("");

    return sectionHead("Perpustakaan", total + " eksemplar · " + tersedia + " tersedia") +
      '<div class="stat-grid">' +
        stat("ic-emerald", ICONS.book, total, "Total Buku") +
        stat("ic-blue", ICONS.book, tersedia, "Tersedia") +
        stat("ic-amber", ICONS.alert, dipinjam, "Dipinjam") +
        stat("ic-red", ICONS.alert, p.filter(function (x) { return x.stok === 0; }).length, "Stok Habis") +
      '</div>' +
      '<div class="panel"><div class="panel-head"><div class="panel-title">Daftar Buku</div>' +
      '<button class="btn btn-primary" style="padding:.5rem 1rem;font-size:.85rem" data-act="addb">+ Tambah Buku</button></div>' +
      '<table class="tbl">' + tableHead(["Kode", "Judul", "Stok", "Dipinjam", "Status", ""]) + '<tbody>' + rows + '</tbody></table></div>';
  }
  function borrowIc() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'; }
  function backIc() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>'; }

  function bukuForm(rec) {
    var r = rec || {};
    openModal(
      '<div class="modal"><div class="modal-head"><div class="modal-title">' + (rec ? "Edit Buku" : "Tambah Buku") + '</div>' +
      '<button class="modal-close" onclick="SIPKBM.closeModal()">×</button></div>' +
      '<div class="modal-body">' +
        '<div class="field"><label class="label">Judul Buku</label><input class="input" id="b_judul" value="' + (r.judul || "") + '" placeholder="Judul buku"></div>' +
        '<div class="field"><label class="label">Pengarang</label><input class="input" id="b_peng" value="' + (r.pengarang || "") + '" placeholder="Nama pengarang"></div>' +
        '<div class="field"><label class="label">Stok Awal</label><input class="input" id="b_stok" type="number" value="' + (r.stok != null ? r.stok : 1) + '"></div>' +
      '</div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" onclick="SIPKBM.closeModal()">Batal</button>' +
      '<button class="btn btn-primary" id="b_save">' + (rec ? "Simpan" : "Tambah") + '</button></div></div>'
    );
    $("#b_save").addEventListener("click", function () {
      var judul = $("#b_judul").value.trim();
      if (!judul) { toast("Judul wajib diisi", "err"); return; }
      var stok = parseInt($("#b_stok").value, 10) || 0;
      if (rec) { rec.judul = judul; rec.pengarang = $("#b_peng").value.trim(); rec.stok = stok; }
      else { state.perpus.push({ id: SIPKBM.nextId("B"), judul: judul, pengarang: $("#b_peng").value.trim(), stok: stok, dipinjam: 0 }); }
      save(); closeModal(); SIPKBM.__nav("perpus"); toast("Data buku tersimpan", "ok");
    });
  }
  window.SIPKBM.after_perpus = function () {
    var add = $('[data-act="addb"]'); if (add) add.addEventListener("click", function () { bukuForm(null); });
    $$("[data-pinjam]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = state.perpus.find(function (x) { return x.id === b.getAttribute("data-pinjam"); });
        if (r && r.stok > 0) { r.stok--; r.dipinjam++; save(); SIPKBM.__nav("perpus"); toast(r.judul + " dipinjam", "ok"); }
      });
    });
    $$("[data-kembali]").forEach(function (b) {
      b.addEventListener("click", function () {
        var r = state.perpus.find(function (x) { return x.id === b.getAttribute("data-kembali"); });
        if (r && r.dipinjam > 0) { r.stok++; r.dipinjam--; save(); SIPKBM.__nav("perpus"); toast(r.judul + " dikembalikan", "ok"); }
      });
    });
    $$("[data-editb]").forEach(function (b) {
      b.addEventListener("click", function () { var id = b.getAttribute("data-editb"); bukuForm(state.perpus.find(function (x) { return x.id === id; })); });
    });
    $$("[data-delb]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-delb"); var rec = state.perpus.find(function (x) { return x.id === id; });
        confirmDialog("Hapus Buku", "Yakin hapus " + (rec ? rec.judul : id) + "?", function () {
          state.perpus = state.perpus.filter(function (x) { return x.id !== id; }); save(); SIPKBM.__nav("perpus"); toast("Buku dihapus", "ok");
        }, true);
      });
    });
  };

  /* ============================================================
     VIEW: KURIKULUM  (CRUD mapel)
     ============================================================ */
  function viewKurikulum() {
    var m = state.mapel;
    var rows = m.map(function (r) {
      var sc = r.kelompok === "Wajib" ? "emerald" : "amber";
      return '<tr><td class="name">' + r.id + '</td><td>' + av(r.nama) + '<span class="name">' + r.nama + '</span></td>' +
        '<td><span class="badge badge-' + sc + '">' + r.kelompok + '</span></td>' +
        '<td>' + r.kkm + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="mini-btn edit" title="Edit" data-editm="' + r.id + '">' + editIc() + '</button>' +
          '<button class="mini-btn danger" title="Hapus" data-delm="' + r.id + '">' + delIc() + '</button>' +
        '</div></td></tr>';
    }).join("");

    return sectionHead("Kurikulum", m.length + " mata pelajaran terdaftar") +
      '<div class="panel"><div class="panel-head"><div class="panel-title">Mata Pelajaran</div>' +
      '<button class="btn btn-primary" style="padding:.5rem 1rem;font-size:.85rem" data-act="addm">+ Tambah Mapel</button></div>' +
      '<table class="tbl">' + tableHead(["Kode", "Nama Mapel", "Kelompok", "KKM", ""]) + '<tbody>' + rows + '</tbody></table></div>';
  }
  function mapelForm(rec) {
    var r = rec || {};
    openModal(
      '<div class="modal"><div class="modal-head"><div class="modal-title">' + (rec ? "Edit Mapel" : "Tambah Mapel") + '</div>' +
      '<button class="modal-close" onclick="SIPKBM.closeModal()">×</button></div>' +
      '<div class="modal-body">' +
        '<div class="field"><label class="label">Nama Mata Pelajaran</label><input class="input" id="m_nama" value="' + (r.nama || "") + '" placeholder="Mis. Kimia"></div>' +
        '<div class="row-2">' +
          '<div class="field"><label class="label">Kelompok</label><select class="sel" id="m_kel"><option ' + (r.kelompok === "Wajib" || !r.kelompok ? "selected" : "") + '>Wajib</option><option ' + (r.kelompok === "Peminatan" ? "selected" : "") + '>Peminatan</option></select></div>' +
          '<div class="field"><label class="label">KKM</label><input class="input" id="m_kkm" type="number" value="' + (r.kkm != null ? r.kkm : 70) + '"></div>' +
        '</div>' +
      '</div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" onclick="SIPKBM.closeModal()">Batal</button>' +
      '<button class="btn btn-primary" id="m_save">' + (rec ? "Simpan" : "Tambah") + '</button></div></div>'
    );
    $("#m_save").addEventListener("click", function () {
      var nama = $("#m_nama").value.trim(), kkm = parseInt($("#m_kkm").value, 10);
      if (!nama || isNaN(kkm)) { toast("Isi nama & KKM", "err"); return; }
      if (rec) { rec.nama = nama; rec.kelompok = $("#m_kel").value; rec.kkm = kkm; }
      else { state.mapel.push({ id: SIPKBM.nextId("MP"), nama: nama, kelompok: $("#m_kel").value, kkm: kkm }); }
      save(); closeModal(); SIPKBM.__nav("kurikulum"); toast("Mapel tersimpan", "ok");
    });
  }
  window.SIPKBM.after_kurikulum = function () {
    var add = $('[data-act="addm"]'); if (add) add.addEventListener("click", function () { mapelForm(null); });
    $$("[data-editm]").forEach(function (b) {
      b.addEventListener("click", function () { var id = b.getAttribute("data-editm"); mapelForm(state.mapel.find(function (x) { return x.id === id; })); });
    });
    $$("[data-delm]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-delm"); var rec = state.mapel.find(function (x) { return x.id === id; });
        confirmDialog("Hapus Mapel", "Yakin hapus " + (rec ? rec.nama : id) + "?", function () {
          state.mapel = state.mapel.filter(function (x) { return x.id !== id; }); save(); SIPKBM.__nav("kurikulum"); toast("Mapel dihapus", "ok");
        }, true);
      });
    });
  };

  /* ============================================================
     VIEW: PENGATURAN  (profil PKBM + reset data)
     ============================================================ */
  function viewPengaturan() {
    var s = state.settings;
    return sectionHead("Pengaturan", "Profil & preferensi PKBM") +
      '<div class="grid-2">' +
        '<div class="panel"><div class="panel-head"><div class="panel-title">Profil Lembaga</div></div><div class="modal-body" style="padding:1.5rem">' +
          '<div class="field"><label class="label">Nama PKBM</label><input class="input" id="set_nama" value="' + (s.namaPKBM || "") + '"></div>' +
          '<div class="row-2">' +
            '<div class="field"><label class="label">NPSN</label><input class="input" id="set_npsn" value="' + (s.npsn || "") + '"></div>' +
            '<div class="field"><label class="label">Kontak</label><input class="input" id="set_kontak" value="' + (s.kontak || "") + '"></div>' +
          '</div>' +
          '<div class="row-2">' +
            '<div class="field"><label class="label">Kecamatan</label><input class="input" id="set_kec" value="' + (s.kecamatan || "") + '"></div>' +
            '<div class="field"><label class="label">Kota</label><input class="input" id="set_kota" value="' + (s.kota || "") + '"></div>' +
          '</div>' +
          '<div class="field"><label class="label">Kepala PKBM</label><input class="input" id="set_kepala" value="' + (s.kepala || "") + '"></div>' +
          '<div class="field"><label class="label">Tema Aksen</label><select class="sel" id="set_tema">' +
            ['emerald', 'blue', 'amber', 'red'].map(function (t) { return '<option ' + (s.tema === t ? "selected" : "") + '>' + t + '</option>'; }).join("") + '</select></div>' +
          '<button class="btn btn-primary btn-block" id="set_save" style="margin-top:.5rem">Simpan Pengaturan</button>' +
        '</div></div>' +
        '<div class="panel"><div class="panel-head"><div class="panel-title">Statistik & Data</div></div><div class="modal-body" style="padding:1.5rem">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">' +
            miniStat("Siswa", state.siswa.length) +
            miniStat("Buku", state.perpus.length) +
            miniStat("Mapel", state.mapel.length) +
            miniStat("Transaksi", state.keuangan.length) +
          '</div>' +
          '<div style="margin-top:1.4rem;border-top:1px solid #eef1f6;padding-top:1.2rem">' +
            '<div style="font-weight:600;color:#1a2b4a;margin-bottom:.4rem">Reset Data</div>' +
            '<p style="font-size:.82rem;color:#94a3b8;margin-bottom:.8rem">Kembalikan semua data ke contoh awal (tidak bisa dibatalkan).</p>' +
            '<button class="btn btn-ghost" style="border-color:rgba(212,102,96,.4);color:var(--a-red)" id="set_reset">Reset Semua Data</button>' +
          '</div>' +
        '</div></div>' +
      '</div>';
  }
  function miniStat(l, v) {
    return '<div style="background:#f8fafc;border-radius:12px;padding:1rem"><div style="font-size:1.6rem;font-weight:800;color:#1a2b4a">' + v + '</div><div style="font-size:.8rem;color:#94a3b8">' + l + '</div></div>';
  }
  window.SIPKBM.after_pengaturan = function () {
    var sv = $("#set_save");
    if (sv) sv.addEventListener("click", function () {
      state.settings = {
        namaPKBM: $("#set_nama").value.trim(), npsn: $("#set_npsn").value.trim(),
        kecamatan: $("#set_kec").value.trim(), kota: $("#set_kota").value.trim(),
        kepala: $("#set_kepala").value.trim(), kontak: $("#set_kontak").value.trim(),
        tema: $("#set_tema").value
      };
      save(); toast("Pengaturan tersimpan", "ok");
    });
    var rs = $("#set_reset");
    if (rs) rs.addEventListener("click", function () {
      confirmDialog("Reset Semua Data", "Semua data akan dikembalikan ke contoh awal. Lanjut?", function () {
        state = seed(); save(); window.SIPKBM.state = state; SIPKBM.__nav("pengaturan"); toast("Data direset", "ok");
      }, true);
    });
  };
})();
