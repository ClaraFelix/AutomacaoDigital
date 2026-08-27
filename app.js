const BOX_CAPACITY = 10;
const STORAGE_KEY = "autoinspect_parts_v1";

const state = {
  parts: loadParts(),
  activeTab: "operacao",
  filter: "todas",
};

const elements = {
  form: document.querySelector("#partForm"),
  toast: document.querySelector("#toast"),
  latestResult: document.querySelector("#latestResult"),
  tableBody: document.querySelector("#partsTableBody"),
  boxesGrid: document.querySelector("#boxesGrid"),
  statusFilter: document.querySelector("#statusFilter"),
  donut: document.querySelector("#qualityDonut"),
  approvedKpi: document.querySelector("#approvedKpi"),
  rejectedKpi: document.querySelector("#rejectedKpi"),
  boxesKpi: document.querySelector("#boxesKpi"),
  approvalRateKpi: document.querySelector("#approvalRateKpi"),
  reportApproved: document.querySelector("#reportApproved"),
  reportRejected: document.querySelector("#reportRejected"),
  reportBoxes: document.querySelector("#reportBoxes"),
  reportTotal: document.querySelector("#reportTotal"),
  reasonList: document.querySelector("#reasonList"),
};

document.querySelectorAll(".nav-tab").forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab));
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = document.querySelector("#partId").value.trim();
  const weight = Number(document.querySelector("#weight").value);
  const color = document.querySelector("#color").value.trim();
  const length = Number(document.querySelector("#length").value);

  const inputErrors = validateInput(id, weight, length);
  if (inputErrors.length > 0) {
    showToast(inputErrors.join("; "), "error");
    return;
  }

  const inspection = inspectPart({ weight, color, length });
  const part = {
    id,
    weight,
    color,
    length,
    status: inspection.approved ? "APROVADA" : "REPROVADA",
    rejectionReasons: inspection.reasons,
    createdAt: new Date().toISOString(),
  };

  state.parts.push(part);
  saveParts();
  elements.form.reset();

  if (part.status === "APROVADA") {
    showToast(`Peça ${part.id} aprovada e encaminhada para caixa.`, "success");
  } else {
    showToast(`Peça ${part.id} reprovada: ${part.rejectionReasons.join("; ")}`, "error");
  }

  elements.latestResult.textContent = buildLatestResult(part);
  render();
});

elements.statusFilter.addEventListener("change", (event) => {
  state.filter = event.target.value;
  renderTable();
});

elements.tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-id]");
  if (!button) return;

  const id = button.dataset.deleteId;
  state.parts = state.parts.filter((part) => part.id !== id);
  saveParts();
  showToast(`Peça ${id} excluída. Caixas e relatórios recalculados.`, "success");
  render();
});

function validateInput(id, weight, length) {
  const errors = [];

  if (!id) errors.push("Informe o ID da peça");
  if (state.parts.some((part) => part.id.toLowerCase() === id.toLowerCase())) {
    errors.push(`ID duplicado: ${id}`);
  }
  if (!Number.isFinite(weight) || weight <= 0) {
    errors.push("Peso deve ser um número positivo");
  }
  if (!Number.isFinite(length) || length <= 0) {
    errors.push("Comprimento deve ser um número positivo");
  }

  return errors;
}

function inspectPart({ weight, color, length }) {
  const normalizedColor = color.toLowerCase();
  const reasons = [];

  if (weight < 95 || weight > 105) {
    reasons.push(`Peso fora do padrão (${formatNumber(weight)}g)`);
  }

  if (!["azul", "verde"].includes(normalizedColor)) {
    reasons.push(`Cor inválida ('${color}')`);
  }

  if (length < 10 || length > 20) {
    reasons.push(`Comprimento fora do padrão (${formatNumber(length)}cm)`);
  }

  return {
    approved: reasons.length === 0,
    reasons,
  };
}

function buildBoxes() {
  const approvedParts = state.parts.filter((part) => part.status === "APROVADA");
  const boxes = [];

  for (let index = 0; index < approvedParts.length; index += BOX_CAPACITY) {
    const pieces = approvedParts.slice(index, index + BOX_CAPACITY);
    boxes.push({
      number: boxes.length + 1,
      pieces,
      status: pieces.length === BOX_CAPACITY ? "FECHADA" : "ABERTA",
    });
  }

  return boxes;
}

function getMetrics() {
  const approved = state.parts.filter((part) => part.status === "APROVADA").length;
  const rejected = state.parts.filter((part) => part.status === "REPROVADA").length;
  const total = state.parts.length;
  const boxes = buildBoxes();
  const approvalRate = total === 0 ? 0 : Math.round((approved / total) * 100);

  return {
    approved,
    rejected,
    total,
    boxes,
    boxesUsed: boxes.length,
    approvalRate,
  };
}

function render() {
  renderMetrics();
  renderTable();
  renderBoxes();
  renderReasons();
}

function renderMetrics() {
  const metrics = getMetrics();
  const approvedDegrees = metrics.total === 0 ? 0 : (metrics.approved / metrics.total) * 360;

  elements.approvedKpi.textContent = metrics.approved;
  elements.rejectedKpi.textContent = metrics.rejected;
  elements.boxesKpi.textContent = metrics.boxesUsed;
  elements.approvalRateKpi.textContent = `${metrics.approvalRate}%`;
  elements.reportApproved.textContent = metrics.approved;
  elements.reportRejected.textContent = metrics.rejected;
  elements.reportBoxes.textContent = metrics.boxesUsed;
  elements.reportTotal.textContent = metrics.total;

  elements.donut.style.background = `conic-gradient(var(--accent) 0deg ${approvedDegrees}deg, var(--danger) ${approvedDegrees}deg 360deg)`;
  elements.donut.dataset.label = metrics.total === 0 ? "0 peças" : `${metrics.approvalRate}%`;
}

function renderTable() {
  const filteredParts = state.filter === "todas"
    ? state.parts
    : state.parts.filter((part) => part.status === state.filter);

  if (filteredParts.length === 0) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">Nenhuma peça encontrada para este filtro.</td>
      </tr>
    `;
    return;
  }

  elements.tableBody.innerHTML = filteredParts.map((part) => `
    <tr>
      <td>${escapeHtml(part.id)}</td>
      <td>${formatNumber(part.weight)}g</td>
      <td>${escapeHtml(part.color)}</td>
      <td>${formatNumber(part.length)}cm</td>
      <td><span class="badge ${part.status === "APROVADA" ? "approved" : "rejected"}">${part.status}</span></td>
      <td>${part.rejectionReasons.length ? escapeHtml(part.rejectionReasons.join("; ")) : "-"}</td>
      <td><button class="delete-button" type="button" data-delete-id="${escapeHtml(part.id)}">Excluir</button></td>
    </tr>
  `).join("");
}

function renderBoxes() {
  const boxes = buildBoxes();

  if (boxes.length === 0) {
    elements.boxesGrid.innerHTML = `<div class="empty-state">Nenhuma caixa iniciada. Peças reprovadas não ocupam espaço.</div>`;
    return;
  }

  elements.boxesGrid.innerHTML = boxes.map((box) => {
    const occupancy = Math.round((box.pieces.length / BOX_CAPACITY) * 100);
    return `
      <article class="box-card">
        <header>
          <strong>Caixa ${box.number}</strong>
          <span class="box-status ${box.status === "FECHADA" ? "closed" : ""}">${box.status}</span>
        </header>
        <div class="progress" aria-label="Ocupação ${box.pieces.length} de ${BOX_CAPACITY}">
          <span style="width: ${occupancy}%"></span>
        </div>
        <p>${box.pieces.length}/${BOX_CAPACITY} peças aprovadas</p>
        <div class="box-pieces">
          ${box.pieces.map((part) => `<span>${escapeHtml(part.id)}</span>`).join("")}
        </div>
      </article>
    `;
  }).join("");
}

function renderReasons() {
  const rejectedParts = state.parts.filter((part) => part.status === "REPROVADA");
  const reasons = rejectedParts.flatMap((part) =>
    part.rejectionReasons.map((reason) => ({ id: part.id, reason }))
  );

  if (reasons.length === 0) {
    elements.reasonList.innerHTML = `<li>Nenhum motivo registrado até o momento.</li>`;
    return;
  }

  elements.reasonList.innerHTML = reasons.map((item) => `
    <li><strong>${escapeHtml(item.id)}</strong>: ${escapeHtml(item.reason)}</li>
  `).join("");
}

function setActiveTab(tabId) {
  state.activeTab = tabId;

  document.querySelectorAll(".nav-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });
}

function showToast(message, type) {
  elements.toast.textContent = message;
  elements.toast.style.borderColor = type === "error" ? "rgba(255, 107, 107, 0.7)" : "rgba(37, 194, 160, 0.7)";
  elements.toast.classList.add("show");

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 4200);
}

function buildLatestResult(part) {
  if (part.status === "APROVADA") {
    return `Última inspeção: peça ${part.id} aprovada.`;
  }

  return `Última inspeção: peça ${part.id} reprovada por ${part.rejectionReasons.join("; ")}.`;
}

function saveParts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.parts));
}

function loadParts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function formatNumber(value) {
  return Number(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
