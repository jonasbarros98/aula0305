function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2, 10);
}

const state = {
  today: new Date(),
  currentMonth: new Date(),
  selectedDate: null,
  notes: {
    "2026-01-19": [
      {
        id: uid(),
        status: "confirmed",
        title: "Aula Matheus - 15h00",
        info: "Revisão de phrasal verbs + listening",
      },
      {
        id: uid(),
        status: "canceled",
        title: "Aula Ricardo - 17h00",
        info: "Reagendar para semana que vem",
      },
    ],
    "2026-01-22": [
      {
        id: uid(),
        status: "pending",
        title: "Aula Marina - 19h30",
        info: "Confirmar pagamento do pacote",
      },
    ],
  },
  students: [
    {
      id: "matheus",
      name: "Matheus Silva",
      guardians: "Responsável próprio",
      phone: "(11) 99999-1001",
      address: "São Paulo - SP",
      plan: "Plano Premium (12 aulas)",
      progress: { done: 8, total: 12 },
      pix: "cini.english@pix.com",
    },
    {
      id: "ana",
      name: "Ana Costa",
      guardians: "Pai: Marcelo / Mãe: Priscila",
      phone: "(21) 98888-2211",
      address: "Rio de Janeiro - RJ",
      plan: "Plano Intensivo (8 aulas)",
      progress: { done: 3, total: 8 },
      pix: "cini.english@pix.com",
    },
    {
      id: "ricardo",
      name: "Ricardo Reis",
      guardians: "Responsável próprio",
      phone: "(31) 97777-3322",
      address: "Belo Horizonte - MG",
      plan: "Plano Conversação (4 aulas)",
      progress: { done: 1, total: 4 },
      pix: "cini.english@pix.com",
    },
  ],
  tasks: [
    {
      id: uid(),
      title: "Preparar aula B2 para Matheus (phrasal verbs)",
      status: "doing",
      tags: ["Planejamento", "Vocabulário"],
    },
    {
      id: uid(),
      title: "Enviar materiais de listening para Ana",
      status: "todo",
      tags: ["Materiais"],
    },
    {
      id: uid(),
      title: "Revisar datas de cobrança de fevereiro",
      status: "todo",
      tags: ["Financeiro"],
    },
  ],
};

const statusLabels = {
  confirmed: "Confirmado",
  pending: "Pendente",
  canceled: "Cancelado",
};

const statusEmoji = {
  confirmed: "✔",
  pending: "•",
  canceled: "✖",
};

function toISO(date) {
  return date.toISOString().slice(0, 10);
}

function monthName(date) {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function ensureDayArray(dateKey) {
  if (!state.notes[dateKey]) state.notes[dateKey] = [];
  return state.notes[dateKey];
}

function renderStats() {
  let confirmed = 0;
  let pending = 0;
  let canceled = 0;
  Object.values(state.notes).forEach((noteList) => {
    noteList.forEach((note) => {
      if (note.status === "confirmed") confirmed += 1;
      if (note.status === "pending") pending += 1;
      if (note.status === "canceled") canceled += 1;
    });
  });

  document.getElementById("statConfirmed").textContent = confirmed;
  document.getElementById("statPending").textContent = pending;
  document.getElementById("statCanceled").textContent = canceled;
  document.getElementById("statStudents").textContent = state.students.length;

  document.getElementById("sidebarConfirmed").textContent = confirmed;
  document.getElementById("sidebarPending").textContent = pending;
  document.getElementById("sidebarStudents").textContent = state.students.length;
}

function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";
  const year = state.currentMonth.getFullYear();
  const month = state.currentMonth.getMonth();
  const label = monthName(state.currentMonth);
  document.getElementById("monthTitle").textContent =
    label.charAt(0).toUpperCase() + label.slice(1);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const key = toISO(date);
    const notes = state.notes[key] || [];

    const dayEl = document.createElement("button");
    dayEl.className = "day";
    if (state.selectedDate === key) dayEl.classList.add("selected");

    const header = document.createElement("div");
    header.className = "day-header";
    const dateEl = document.createElement("span");
    dateEl.className = "day-date";
    dateEl.textContent = day.toString().padStart(2, "0");
    const countEl = document.createElement("span");
    countEl.className = "pill pending";
    countEl.textContent = `${notes.length} notas`;
    header.append(dateEl, countEl);

    const list = document.createElement("div");
    list.className = "day-notes";
    notes.slice(0, 3).forEach((note) => {
      const chip = document.createElement("div");
      chip.className = `note-chip`;
      chip.innerHTML = `<span class="pill ${note.status}">${statusEmoji[note.status]}</span><span>${note.title}</span>`;
      list.append(chip);
    });

    dayEl.append(header, list);
    dayEl.addEventListener("click", () => selectDay(key));
    grid.append(dayEl);
  }
}

function selectDay(key) {
  state.selectedDate = key;
  renderCalendar();
  renderDayDetails();
}

function renderDayDetails() {
  const title = document.getElementById("selectedDateTitle");
  const notesContainer = document.getElementById("dayNotes");
  notesContainer.innerHTML = "";
  if (!state.selectedDate) {
    title.textContent = "Selecione um dia";
    return;
  }
  const date = new Date(state.selectedDate);
  title.textContent = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const notes = state.notes[state.selectedDate] || [];
  if (notes.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Nenhuma anotação para este dia. Adicione a primeira!";
    notesContainer.append(empty);
    return;
  }

  notes.forEach((note) => {
    const row = document.createElement("div");
    row.className = "note-row";
    const header = document.createElement("header");
    const title = document.createElement("strong");
    title.textContent = note.title;
    const badge = document.createElement("span");
    badge.className = `pill status ${note.status}`;
    badge.textContent = statusLabels[note.status];
    header.append(title, badge);

    const info = document.createElement("p");
    info.className = "muted";
    info.textContent = note.info || "Sem observações.";

    const actions = document.createElement("div");
    actions.className = "note-actions";
    ["confirmed", "pending", "canceled"].forEach((status) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tag";
      button.textContent = `Marcar ${statusLabels[status]}`;
      button.addEventListener("click", () => {
        note.status = status;
        renderStats();
        renderCalendar();
        renderDayDetails();
      });
      actions.append(button);
    });

    row.append(header, info, actions);
    notesContainer.append(row);
  });
}

function renderStudents() {
  const list = document.getElementById("studentList");
  list.innerHTML = "";
  const select = document.getElementById("billingStudent");
  select.innerHTML = "";
  state.students.forEach((student) => {
    const card = document.createElement("div");
    card.className = "student-card";

    const heading = document.createElement("div");
    heading.className = "note-row-header";
    const name = document.createElement("strong");
    name.textContent = student.name;

    const plan = document.createElement("span");
    plan.className = "pill";
    plan.textContent = student.plan;
    heading.append(name, plan);

    const meta = document.createElement("div");
    meta.className = "student-meta";
    meta.innerHTML = `
      👪 ${student.guardians}<br/>
      📞 ${student.phone}<br/>
      📍 ${student.address}
    `;

    const progress = document.createElement("div");
    progress.className = "progress";
    const bar = document.createElement("span");
    const pct = Math.min(100, Math.round((student.progress.done / student.progress.total) * 100));
    bar.style.width = `${pct}%`;
    progress.append(bar);
    const info = document.createElement("p");
    info.className = "muted";
    info.textContent = `${student.progress.done} aulas de ${student.progress.total}`;

    card.append(heading, meta, progress, info);
    list.append(card);

    const option = document.createElement("option");
    option.value = student.id;
    option.textContent = student.name;
    select.append(option);
  });
  populateBilling();
  renderStats();
}

function populateBilling() {
  const studentId = document.getElementById("billingStudent").value;
  const student = state.students.find((s) => s.id === studentId);
  if (!student) return;
  document.getElementById("billingPlan").value = student.plan;
  document.getElementById("billingInstallments").value = "Mensal - vencimento dia 05";
  document.getElementById("billingDelivered").value = student.progress.done;
  document.getElementById("billingTotal").value = student.progress.total;
  document.getElementById("billingPix").value = student.pix;
  renderBillingPreview();
}

function renderBillingPreview() {
  const studentId = document.getElementById("billingStudent").value;
  const student = state.students.find((s) => s.id === studentId);
  if (!student) return;
  const plan = document.getElementById("billingPlan").value;
  const installments = document.getElementById("billingInstallments").value;
  const delivered = document.getElementById("billingDelivered").value || 0;
  const total = document.getElementById("billingTotal").value || 0;
  const pix = document.getElementById("billingPix").value;

  const preview = `Olá ${student.name}! 🌟

Plano: ${plan}
Parcelamento: ${installments || "à vista"}
Progresso: ${delivered}/${total} aulas concluídas
Chave Pix: ${pix}

Conte comigo para qualquer dúvida!`;
  document.getElementById("billingPreview").textContent = preview;
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";
  state.tasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "task-card";
    const title = document.createElement("strong");
    title.textContent = task.title;
    const status = document.createElement("div");
    status.className = "task-status";
    status.innerHTML = `<span class="pill ${task.status}">${statusLabels[task.status] || "Em aberto"}</span>`;

    const tags = document.createElement("div");
    tags.className = "task-actions";
    ["todo", "doing", "confirmed"].forEach((status) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tag";
      btn.textContent = `Marcar ${status}`;
      btn.addEventListener("click", () => {
        task.status = status;
        renderTasks();
      });
      tags.append(btn);
    });

    card.append(title, status, tags);
    list.append(card);
  });
}

function addTask() {
  const title = prompt("Título da tarefa");
  if (!title) return;
  state.tasks.unshift({
    id: uid(),
    title,
    status: "todo",
    tags: [],
  });
  renderTasks();
}

function attachNavigation() {
  const navButtons = document.querySelectorAll(".nav-item");
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      showView(btn.dataset.view);
    });
  });
}

function attachForms() {
  document.getElementById("noteForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.selectedDate) {
      alert("Selecione um dia no calendário primeiro.");
      return;
    }
    const title = document.getElementById("noteTitle").value.trim();
    const status = document.getElementById("noteStatus").value;
    const info = document.getElementById("noteInfo").value.trim();
    if (!title) return;
    ensureDayArray(state.selectedDate).push({
      id: uid(),
      title,
      status,
      info,
    });
    event.target.reset();
    renderStats();
    renderCalendar();
    renderDayDetails();
  });

  document.getElementById("billingForm").addEventListener("input", renderBillingPreview);
  document.getElementById("billingStudent").addEventListener("change", populateBilling);
  document.getElementById("copyBilling").addEventListener("click", async () => {
    const preview = document.getElementById("billingPreview").textContent;
    try {
      await navigator.clipboard.writeText(preview);
      alert("Mensagem copiada!");
    } catch {
      alert("Não foi possível copiar automaticamente, selecione o texto manualmente.");
    }
  });

  document.getElementById("monthBack").addEventListener("click", () => {
    state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  document.getElementById("monthForward").addEventListener("click", () => {
    state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  document.getElementById("createLessonBtn").addEventListener("click", () => {
    const todayKey = toISO(state.today);
    selectDay(todayKey);
    document.getElementById("noteTitle").focus();
  });

  document.getElementById("addTask").addEventListener("click", addTask);
}

function init() {
  attachNavigation();
  attachForms();
  renderStudents();
  selectDay(toISO(state.today));
  renderCalendar();
  renderTasks();
  renderBillingPreview();
  showView("view-calendar");
}

document.addEventListener("DOMContentLoaded", init);

function showView(viewId) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === viewId);
  });
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}
