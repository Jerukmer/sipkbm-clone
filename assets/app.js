/* ============================================================
   SIPKBM CLONE — shared interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ---------- landing: nav scroll + reveal + FAQ ---------- */
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 20); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  var io = ("IntersectionObserver" in window)
    ? new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { threshold: 0.12 })
    : null;
  document.querySelectorAll(".reveal").forEach(function (el) { io ? io.observe(el) : el.classList.add("in"); });

  document.querySelectorAll(".faq-item").forEach(function (item) {
    item.addEventListener("click", function () {
      var open = item.classList.toggle("open");
      var panel = item.querySelector(".faq-panel");
      var icon = item.querySelector(".faq-icon");
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
      if (icon) icon.style.transform = open ? "rotate(45deg)" : "rotate(0deg)";
    });
  });

  /* ---------- login: show/hide password ---------- */
  var togglePw = document.getElementById("togglePw");
  if (togglePw) {
    var pw = document.getElementById("password");
    togglePw.addEventListener("click", function () {
      pw.type = pw.type === "password" ? "text" : "password";
    });
  }
  var loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("email").value.trim();
      var pass = document.getElementById("password").value;
      if (!email || !pass) { toast("Email dan password wajib diisi"); return; }
      toast("Login berhasil — mengarahkan ke dashboard…");
      setTimeout(function () { window.location.href = "dashboard.html"; }, 900);
    });
  }

  /* ---------- register: show/hide + validation ---------- */
  document.querySelectorAll("[data-toggle]").forEach(function (ic) {
    ic.addEventListener("click", function () {
      var el = document.getElementById(ic.getAttribute("data-toggle"));
      if (el) el.type = el.type === "password" ? "text" : "password";
    });
  });
  var regForm = document.getElementById("regForm");
  if (regForm) {
    var rName = document.getElementById("name"),
        rEmail = document.getElementById("email"),
        rWa = document.getElementById("wa"),
        rPass = document.getElementById("password"),
        rCfm = document.getElementById("confirm"),
        rTerms = document.getElementById("terms"),
        rBtn = document.getElementById("submitBtn");

    function valid() {
      var ok = rName.value.trim() && /\S+@\S+\.\S+/.test(rEmail.value) &&
               rWa.value.trim().length >= 8 && rPass.value.length >= 8 &&
               rPass.value === rCfm.value && rTerms.checked;
      rBtn.disabled = !ok;
      rBtn.style.opacity = ok ? "1" : ".6";
      rBtn.style.cursor = ok ? "pointer" : "not-allowed";
      return ok;
    }
    [rName, rEmail, rWa, rPass, rCfm, rTerms].forEach(function (el) {
      el.addEventListener("input", valid); el.addEventListener("change", valid);
    });

    regForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!valid()) { toast("Periksa kembali data pendaftaran"); return; }
      if (rPass.value !== rCfm.value) { toast("Konfirmasi password tidak cocok"); return; }
      toast("PKBM berhasil didaftarkan — trial 14 hari aktif!");
      setTimeout(function () { window.location.href = "dashboard.html"; }, 1000);
    });
  }

  /* ============================================================
     DASHBOARD — view rendering
     ============================================================ */
  var sideNav = document.getElementById("sideNav");
  var content = document.getElementById("content");
  var pageTitle = document.getElementById("pageTitle");
  var crumb = document.getElementById("crumb");

  if (!content) return; // not a dashboard page

  var I = {
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>',
    money: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    grad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };

  function stat(icClass, icon, val, label, trend, up) {
    return '' +
      '<div class="stat">' +
        '<div class="ic ' + icClass + '">' + icon + '</div>' +
        '<div><div class="v">' + val + '</div><div class="l">' + label + '</div>' +
        (trend ? '<div class="trend ' + (up ? 'trend-up' : 'trend-down') + '">' + trend + '</div>' : '') +
        '</div></div>';
  }

  function tableHead(cols) { return '<thead><tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join("") + '</tr></thead>'; }
  function av(name) { return '<span class="av-sm">' + name.slice(0, 2).toUpperCase() + '</span>'; }

  var VIEWS = {
    overview: function () {
      return '' +
        '<div class="stat-grid">' +
          stat("ic-emerald", I.users, "248", "Total Siswa", "▲ 12 bulan ini", true) +
          stat("ic-blue", I.grad, "18", "Tutor Aktif", "▲ 2 baru", true) +
          stat("ic-amber", I.book, "95%", "Kehadiran", "▼ 3% minggu lalu", false) +
          stat("ic-red", I.money, "Rp 12,4jt", "SPP Masuk", "▲ 8% vs bulan lalu", true) +
        '</div>' +
        '<div class="grid-2">' +
          '<div class="panel">' +
            '<div class="panel-head"><div class="panel-title">Aktivitas Terbaru</div><span class="badge badge-slate">7 hari</span></div>' +
            '<table class="tbl"><tbody>' +
              rowActivity("Pendaftaran baru", "Budi Santoso — Paket C", "2 jam lalu", "emerald") +
              rowActivity("Pembayaran SPP", "Siti Aminah — Rp 150rb", "5 jam lalu", "blue") +
              rowActivity("Absensi terlambat", "3 siswa — Kelas XII", "Kemarin", "amber") +
              rowActivity("Raport selesai", "Angkatan 2025", "2 hari lalu", "emerald") +
              rowActivity("Pengeluaran", "Alat tulis Rp 320rb", "3 hari lalu", "red") +
            '</tbody></table>' +
          '</div>' +
          '<div class="panel">' +
            '<div class="panel-head"><div class="panel-title">Distribusi Program</div></div>' +
            progRow("Kesetaraan", 62, "emerald") +
            progRow("Kursus & Pelatihan", 21, "blue") +
            progRow("Bimbingan Belajar", 11, "amber") +
            progRow("PAUD", 6, "red") +
            '<div style="margin-top:1.2rem"><button class="btn btn-primary btn-block" onclick="window.__nav(\'siswa\')">Kelola Siswa →</button></div>' +
          '</div>' +
        '</div>';
    },

    siswa: function () {
      var rows = [
        ["001", "Budi Santoso", "Paket C", "XII", "Aktif", "emerald"],
        ["002", "Siti Aminah", "Paket B", "IX", "Aktif", "emerald"],
        ["003", "Andi Wijaya", "Paket C", "XI", "Aktif", "emerald"],
        ["004", "Dewi Lestari", "Paket A", "VI", "Cuti", "amber"],
        ["005", "Rizki Pratama", "Paket C", "X", "Nonaktif", "red"],
        ["006", "Maya Sari", "Paket B", "VIII", "Aktif", "emerald"]
      ];
      return sectionHead("Manajemen Siswa", "248 siswa terdaftar · 6 rombongan belajar") +
        '<div class="filters"><span class="chip active">Semua</span><span class="chip">Aktif</span><span class="chip">Cuti</span><span class="chip">Nonaktif</span><span class="chip">+ Tambah Siswa</span></div>' +
        '<div class="panel"><table class="tbl">' + tableHead(["NIS", "Nama", "Program", "Kelas", "Status", ""]) +
        '<tbody>' + rows.map(function (r) {
          return '<tr><td>' + av(r[1]) + '<span class="name">' + r[1] + '</span></td><td>' + r[0] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td><td><span class="badge badge-' + r[5] + '">' + r[4] + '</span></td><td style="text-align:right;color:#94a3b8">⋯</td></tr>';
        }).join("") + '</tbody></table></div>';
    },

    absensi: function () {
      var rows = [
        ["XII Paket C", "28/30", "93%", "emerald"],
        ["XI Paket C", "25/27", "92%", "emerald"],
        ["IX Paket B", "22/24", "91%", "emerald"],
        ["VI Paket A", "18/20", "90%", "emerald"],
        ["VIII Paket B", "19/23", "82%", "amber"]
      ];
      return sectionHead("Absensi Digital", "Hari ini · 112 dari 124 hadir") +
        '<div class="stat-grid">' +
          stat("ic-emerald", I.cal, "112", "Hadir Hari Ini") +
          stat("ic-amber", I.alert, "9", "Izin / Sakit") +
          stat("ic-red", I.alert, "3", "Tanpa Keterangan") +
          stat("ic-blue", I.users, "91%", "Rata-rata Minggu") +
        '</div>' +
        '<div class="panel"><div class="panel-head"><div class="panel-title">Rekap per Rombel</div><span class="badge badge-slate">Juli 2026</span></div>' +
        '<table class="tbl">' + tableHead(["Rombel", "Hadir", "Persentase", ""]) +
        '<tbody>' + rows.map(function (r) {
          return '<tr><td class="name">' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td style="width:140px"><div class="bar ' + (r[3]==="amber"?"amber":"") + '"><span style="width:' + r[2] + '"></span></div></td></tr>';
        }).join("") + '</tbody></table></div>';
    },

    raport: function () {
      var rows = [
        ["Budi Santoso", "Paket C", "87.4", "A", "emerald"],
        ["Siti Aminah", "Paket B", "91.2", "A", "emerald"],
        ["Andi Wijaya", "Paket C", "76.0", "B", "blue"],
        ["Dewi Lestari", "Paket A", "83.5", "A", "emerald"],
        ["Rizki Pratama", "Paket C", "68.9", "C", "amber"]
      ];
      return sectionHead("Raport Digital", "Semester Genap 2025/2026") +
        '<div class="filters"><span class="chip active">Semua</span><span class="chip">Paket A</span><span class="chip">Paket B</span><span class="chip">Paket C</span><span class="chip">Cetak Semua</span></div>' +
        '<div class="panel"><table class="tbl">' + tableHead(["Nama", "Program", "Rata-rata", "Predikat", ""]) +
        '<tbody>' + rows.map(function (r) {
          return '<tr><td>' + av(r[0]) + '<span class="name">' + r[0] + '</span></td><td>' + r[1] + '</td><td class="name">' + r[2] + '</td><td><span class="badge badge-' + r[4] + '">' + r[3] + '</span></td><td style="text-align:right;color:#94a3b8">🖨</td></tr>';
        }).join("") + '</tbody></table></div>';
    },

    keuangan: function () {
      var rows = [
        ["INV-0726", "SPP Juli — Siti Aminah", "Pemasukan", "Rp 150.000", "Lunas", "emerald"],
        ["INV-0725", "SPP Juli — Budi Santoso", "Pemasukan", "Rp 150.000", "Lunas", "emerald"],
        ["OUT-014", "Alat Tulis Kantor", "Pengeluaran", "Rp 320.000", "Lunas", "red"],
        ["INV-0724", "SPP Juli — Andi Wijaya", "Pemasukan", "Rp 150.000", "Pending", "amber"],
        ["OUT-013", "Listrik Bulanan", "Pengeluaran", "Rp 450.000", "Lunas", "red"]
      ];
      return sectionHead("Keuangan & SPP", "Saldo bulan ini: Rp 12,4 jt") +
        '<div class="stat-grid">' +
          stat("ic-emerald", I.money, "Rp 12,4jt", "Pemasukan") +
          stat("ic-red", I.money, "Rp 770rb", "Pengeluaran") +
          stat("ic-blue", I.money, "Rp 11,6jt", "Saldo") +
          stat("ic-amber", I.alert, "3", "Pending") +
        '</div>' +
        '<div class="panel"><div class="panel-head"><div class="panel-title">Transaksi Terakhir</div><button class="btn btn-primary" style="padding:.5rem 1rem;font-size:.85rem">+ Catat</button></div>' +
        '<table class="tbl">' + tableHead(["No.", "Keterangan", "Tipe", "Nominal", "Status"]) +
        '<tbody>' + rows.map(function (r) {
          return '<tr><td class="name">' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td class="name">' + r[3] + '</td><td><span class="badge badge-' + r[5] + '">' + r[4] + '</span></td></tr>';
        }).join("") + '</tbody></table></div>';
    },

    ppdb: function () {
      var rows = [
        ["PPDB-031", "Joko Susilo", "Paket C", "Menunggu", "amber"],
        ["PPDB-030", "Nina Fatimah", "Paket B", "Diverifikasi", "emerald"],
        ["PPDB-029", "Hendra Kusuma", "Paket A", "Ditolak", "red"],
        ["PPDB-028", "Sela Marlina", "Paket C", "Diverifikasi", "emerald"]
      ];
      return sectionHead("PPDB Online", "4 pendaftar baru bulan ini") +
        '<div class="stat-grid">' +
          stat("ic-blue", I.grad, "4", "Pendaftar Baru") +
          stat("ic-amber", I.alert, "1", "Menunggu") +
          stat("ic-emerald", I.users, "2", "Diterima") +
          stat("ic-red", I.alert, "1", "Ditolak") +
        '</div>' +
        '<div class="filters"><span class="chip active">Semua</span><span class="chip">Menunggu</span><span class="chip">Diverifikasi</span><span class="chip">Ditolak</span><span class="chip">+ Buka Form</span></div>' +
        '<div class="panel"><table class="tbl">' + tableHead(["ID", "Nama", "Program", "Status", ""]) +
        '<tbody>' + rows.map(function (r) {
          return '<tr><td class="name">' + r[0] + '</td><td>' + av(r[1]) + '<span class="name">' + r[1] + '</span></td><td>' + r[2] + '</td><td><span class="badge badge-' + r[4] + '">' + r[3] + '</span></td><td style="text-align:right;color:#94a3b8">✓ ✕</td></tr>';
        }).join("") + '</tbody></table></div>';
    }
  };

  function rowActivity(t, d, time, c) {
    return '<tr><td><span class="badge badge-' + c + '" style="margin-right:.6rem">●</span><span class="name">' + t + '</span><div style="font-size:.78rem;color:#94a3b8">' + d + '</div></td><td style="text-align:right;color:#94a3b8;font-size:.82rem">' + time + '</td></tr>';
  }
  function progRow(label, pct, c) {
    return '<div style="margin-bottom:.9rem"><div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:.35rem"><span>' + label + '</span><span style="color:#64748b">' + pct + '%</span></div><div class="bar ' + (c==="amber"?"amber":c==="blue"?"blue":"") + '"><span style="width:' + pct + '%"></span></div></div>';
  }
  function sectionHead(title, sub) {
    return '<div style="margin-bottom:1.3rem"><h2 class="font-display" style="font-size:1.4rem;font-weight:800;color:#1a2b4a">' + title + '</h2>' +
      (sub ? '<p style="color:#64748b;font-size:.9rem;margin-top:.2rem">' + sub + '</p>' : '') + '</div>';
  }

  var TITLES = { overview: "Dashboard", siswa: "Siswa", absensi: "Absensi", raport: "Raport", keuangan: "Keuangan", ppdb: "PPDB Online" };

  function render(view) {
    if (!VIEWS[view]) view = "overview";
    content.innerHTML = VIEWS[view]();
    pageTitle.textContent = TITLES[view];
    crumb.textContent = "PKBM Cerdas / " + TITLES[view];
    document.querySelectorAll(".nav-item[data-view]").forEach(function (n) {
      n.classList.toggle("active", n.getAttribute("data-view") === view);
    });
  }

  // expose nav for inline onclick
  window.__nav = render;

  if (sideNav) {
    sideNav.addEventListener("click", function (e) {
      var item = e.target.closest(".nav-item[data-view]");
      if (item) render(item.getAttribute("data-view"));
    });
  }

  render("overview");
})();
