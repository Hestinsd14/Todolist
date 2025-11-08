// === Ambil Elemen ===
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const addBtn = document.getElementById("addBtn");
const newTasks = document.getElementById("newTasks");
const inProgressTasks = document.getElementById("inProgressTasks");
const completedTasks = document.getElementById("completedTasks");
const calendarDiv = document.getElementById("calendar");

const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const addNoteBtn = document.getElementById("addNote");
const notesList = document.getElementById("notesList");

// === Data ===
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];

// === Tambah Tugas ===
addBtn.onclick = () => {
  const text = taskInput.value.trim();
  const date = taskDate.value;

  if (!text) return alert("Isi dulu tugasnya!");

  tasks.push({ text, date, status: "new" });
  saveTasks();
  renderTasks();
  renderCalendar();

  taskInput.value = "";
  taskDate.value = "";
};

// === Simpan & Render ===
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  newTasks.innerHTML = "";
  inProgressTasks.innerHTML = "";
  completedTasks.innerHTML = "";

  tasks.forEach((task, i) => {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "task-info";
    info.innerHTML = `<span>${task.text}</span><span class="task-date">${task.date || "-"}</span>`;

    const buttons = document.createElement("div");
    buttons.className = "buttons";

    const editBtn = document.createElement("button");
    editBtn.className = "edit";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => {
      const newText = prompt("Edit tugas:", task.text);
      const newDate = prompt("Edit tanggal (YYYY-MM-DD):", task.date);
      if (newText) {
        tasks[i].text = newText;
        tasks[i].date = newDate || task.date;
        saveTasks();
        renderTasks();
        renderCalendar();
      }
    };

    const delBtn = document.createElement("button");
    delBtn.className = "delete";
    delBtn.textContent = "Hapus";
    delBtn.onclick = () => {
      tasks.splice(i, 1);
      saveTasks();
      renderTasks();
      renderCalendar();
    };

    const moveBtn = document.createElement("button");
    moveBtn.className = "move";
    moveBtn.textContent =
      task.status === "new" ? "Mulai" :
      task.status === "inprogress" ? "Selesai" : "Reset";
    moveBtn.onclick = () => {
      if (task.status === "new") task.status = "inprogress";
      else if (task.status === "inprogress") task.status = "done";
      else task.status = "new";
      saveTasks();
      renderTasks();
      renderCalendar();
    };

    buttons.append(editBtn, delBtn, moveBtn);
    li.append(info, buttons);

    if (task.status === "new") newTasks.appendChild(li);
    else if (task.status === "inprogress") inProgressTasks.appendChild(li);
    else completedTasks.appendChild(li);
  });
}

// === Kalender ===
function renderCalendar() {
  calendarDiv.innerHTML = "";
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  days.forEach(d => {
    const label = document.createElement("div");
    label.textContent = d;
    label.style.fontWeight = "bold";
    label.style.textAlign = "center";
    calendarDiv.appendChild(label);
  });

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendarDiv.appendChild(empty);
  }

  for (let d = 1; d <= lastDate; d++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.textContent = d;

    const cellDate = new Date(year, month, d).toISOString().split("T")[0];
    if (cellDate === today.toISOString().split("T")[0]) {
      cell.classList.add("today");
    }

    const hasTask = tasks.some(t => t.date === cellDate);
    if (hasTask) cell.classList.add("has-task");

    cell.onclick = () => {
      const taskForDay = tasks.filter(t => t.date === cellDate);
      if (taskForDay.length === 0)
        alert(`Tidak ada tugas untuk ${cellDate}`);
      else {
        const list = taskForDay.map(t => `- ${t.text} [${t.status}]`).join("\n");
        alert(`Tugas tanggal ${cellDate}:\n${list}`);
      }
    };

    calendarDiv.appendChild(cell);
  }
}

// === Catatan ===
addNoteBtn.onclick = () => {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();
  if (!title || !content) return alert("Isi judul dan isi catatan!");
  notes.push({ title, content });
  saveNotes();
  renderNotes();
  noteTitle.value = "";
  noteContent.value = "";
};

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function renderNotes() {
  notesList.innerHTML = "";
  notes.forEach((n, i) => {
    const li = document.createElement("li");
    li.className = "note-item";
    li.innerHTML = `
      <h3>${n.title}</h3>
      <p>${n.content}</p>
      <div class="note-actions">
        <button class="edit" onclick="editNote(${i})">Edit</button>
        <button class="delete" onclick="deleteNote(${i})">Hapus</button>
      </div>
    `;
    notesList.appendChild(li);
  });
}

window.editNote = (i) => {
  const newTitle = prompt("Edit judul:", notes[i].title);
  const newContent = prompt("Edit isi:", notes[i].content);
  if (newTitle && newContent) {
    notes[i].title = newTitle;
    notes[i].content = newContent;
    saveNotes();
    renderNotes();
  }
};

window.deleteNote = (i) => {
  if (confirm("Yakin ingin menghapus catatan ini?")) {
    notes.splice(i, 1);
    saveNotes();
    renderNotes();
  }
};

// === Notifikasi Deadline ===
setInterval(() => {
  const today = new Date();
  tasks.forEach(t => {
    if (!t.date) return;
    const d = new Date(t.date);
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    if (diff === 1) alert(`🔔 Pengingat: "${t.text}" jatuh tempo BESOK!`);
  });
}, 3600000);

renderTasks();
renderCalendar();
renderNotes();
