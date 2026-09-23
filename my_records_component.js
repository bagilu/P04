// P04 V2.7：主畫面「我的微笑紀錄」與「我的回應紀錄」
// 請在 index.html 載入此檔案，並確認頁面中有 <section id="myRecordsSection"></section>

(function () {
  const config = window.APP_CONFIG || {};
  const section = document.getElementById("myRecordsSection");

  if (!section) return;

  let mySmilePage = 1;
  let myResponsePage = 1;

  function normalizeAccount(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getAccount() {
    return normalizeAccount(localStorage.getItem(config.STORAGE_KEY_ACCOUNT || "P04_ACCOUNT"));
  }

  function formatTime(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  async function callMyRecords(mode, page) {
    const url = config.FUNCTIONS?.GET_MY_RECORDS;
    const account = getAccount();

    if (!account) {
      return { success: false, message: "尚未設定帳號。" };
    }

    if (!url) {
      return { success: false, message: "config.js 缺少 FUNCTIONS.GET_MY_RECORDS。" };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": config.SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${config.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ account, mode, page })
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return { success: false, message: data?.message || `Function error ${res.status}` };
    }

    return data;
  }

  function renderShell() {
    section.innerHTML = `
      <div class="my-records-wrap">
        <div class="record-panel">
          <div class="record-panel-title">🌞 我的微笑紀錄</div>
          <div class="record-panel-subtitle">別人記錄了我對他的微笑、問候或鼓勵</div>
          <div id="mySmileRecordsBody" class="record-table-body">載入中...</div>
        </div>

        <div class="record-panel">
          <div class="record-panel-title">🌱 我的回應紀錄</div>
          <div class="record-panel-subtitle">我記錄了別人給我的微笑、問候或鼓勵</div>
          <div id="myResponseRecordsBody" class="record-table-body">載入中...</div>
        </div>
      </div>
    `;
  }

  function renderTable(targetId, data, mode) {
    const target = document.getElementById(targetId);
    if (!target) return;

    if (!data.success) {
      target.innerHTML = `<div class="record-error">${data.message || "載入失敗"}</div>`;
      return;
    }

    const rows = data.rows || [];

    if (!rows.length) {
      target.innerHTML = `
        <div class="record-empty">目前尚無資料。</div>
        <div class="record-pagination">
          <button disabled>上一頁</button>
          <span>第 1 / 1 頁</span>
          <button disabled>下一頁</button>
        </div>
      `;
      return;
    }

    const bodyHtml = rows.map(row => {
      const otherName = mode === "smiler"
        ? (row.responder_nickname || row.responder_account || "某位同學")
        : (row.smiler_nickname || row.smiler_account || "某位同學");

      const verb = mode === "smiler"
        ? "記錄了你給他的"
        : "你記錄了他給你的";

      return `
        <tr>
          <td>${formatTime(row.created_at)}</td>
          <td>${escapeHtml(otherName)}</td>
          <td>${escapeHtml(verb)}${escapeHtml(row.smile_type_label || "善意")}</td>
        </tr>
      `;
    }).join("");

    const prevDisabled = data.page <= 1 ? "disabled" : "";
    const nextDisabled = data.page >= data.total_pages ? "disabled" : "";

    target.innerHTML = `
      <table class="record-table">
        <thead>
          <tr>
            <th>時間</th>
            <th>對象</th>
            <th>內容</th>
          </tr>
        </thead>
        <tbody>${bodyHtml}</tbody>
      </table>
      <div class="record-pagination">
        <button data-mode="${mode}" data-action="prev" ${prevDisabled}>上一頁</button>
        <span>第 ${data.page} / ${data.total_pages} 頁，共 ${data.total} 筆</span>
        <button data-mode="${mode}" data-action="next" ${nextDisabled}>下一頁</button>
      </div>
    `;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function loadSmileRecords() {
    const data = await callMyRecords("smiler", mySmilePage);
    renderTable("mySmileRecordsBody", data, "smiler");
  }

  async function loadResponseRecords() {
    const data = await callMyRecords("responder", myResponsePage);
    renderTable("myResponseRecordsBody", data, "responder");
  }

  section.addEventListener("click", async (event) => {
    const btn = event.target.closest("button[data-mode][data-action]");
    if (!btn) return;

    const mode = btn.dataset.mode;
    const action = btn.dataset.action;

    if (mode === "smiler") {
      mySmilePage = action === "prev" ? Math.max(1, mySmilePage - 1) : mySmilePage + 1;
      await loadSmileRecords();
    }

    if (mode === "responder") {
      myResponsePage = action === "prev" ? Math.max(1, myResponsePage - 1) : myResponsePage + 1;
      await loadResponseRecords();
    }
  });

  renderShell();
  loadSmileRecords();
  loadResponseRecords();
})();
