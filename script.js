"use strict";

/* CampusHire - Interactive demo application
   Demo accounts and applications are stored in this browser.
   This is not production authentication. */

const STORAGE = {
  users: "campushire_users",
  session: "campushire_session",
  applications: "campushire_applications"
};

const demoJobs = [
  {
    id: "job-101",
    title: "Frontend Developer Intern",
    company: "TechNova",
    location: "Hyderabad",
    type: "Internship",
    salary: "₹15,000/month",
    icon: "💻",
    description: "Create responsive websites using HTML, CSS and JavaScript."
  },
  {
    id: "job-102",
    title: "Python Developer",
    company: "CodeSphere",
    location: "Remote",
    type: "Full-time",
    salary: "₹4–6 LPA",
    icon: "🐍",
    description: "Build Python applications, APIs and backend services."
  },
  {
    id: "job-103",
    title: "Java Developer Intern",
    company: "NextGen Solutions",
    location: "Bengaluru",
    type: "Internship",
    salary: "₹12,000/month",
    icon: "☕",
    description: "Work with Java, object-oriented programming and databases."
  },
  {
    id: "job-104",
    title: "UI/UX Design Intern",
    company: "PixelCraft",
    location: "Hyderabad",
    type: "Internship",
    salary: "₹10,000/month",
    icon: "🎨",
    description: "Design intuitive digital experiences and interactive prototypes."
  },
  {
    id: "job-105",
    title: "Data Analyst",
    company: "InsightWorks",
    location: "Chennai",
    type: "Full-time",
    salary: "₹5–7 LPA",
    icon: "📊",
    description: "Analyse datasets and turn business information into insights."
  },
  {
    id: "job-106",
    title: "Campus Support Assistant",
    company: "StudentHub",
    location: "Remote",
    type: "Part-time",
    salary: "₹8,000/month",
    icon: "🎓",
    description: "Support student communities and coordinate online activities."
  }
];

let jobs = [...demoJobs];
let authMode = "login";
let currentUser = readStorage(STORAGE.session, null);
let toastTimer;

/* Safely read browser storage */
function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error("Could not read storage:", error);
    return fallback;
  }
}

/* Safely write browser storage */
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Could not save data:", error);
    showToast("Browser storage is unavailable.");
    return false;
  }
}

/* Escape user-provided text before displaying it as HTML */
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

/* Notifications */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

/* Job listings */
function renderJobs(list) {
  const container = document.getElementById("jobsContainer");
  const count = document.getElementById("jobCount");

  if (!container) return;

  if (count) {
    count.textContent =
      `${list.length} ${list.length === 1 ? "opportunity" : "opportunities"}`;
  }

  if (!list.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div style="font-size:36px;margin-bottom:10px">🔎</div>
        <h3>No matching jobs found</h3>
        <p style="margin-top:8px">Try changing your search or filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(job => `
    <article class="job-card">
      <div class="company-icon">${escapeHTML(job.icon || "💼")}</div>

      <div class="job-card-header">
        <div>
          <h3>${escapeHTML(job.title)}</h3>
          <p class="company-name">${escapeHTML(job.company)}</p>
        </div>
        <span class="job-type">${escapeHTML(job.type)}</span>
      </div>

      <p class="job-description">${escapeHTML(job.description)}</p>

      <div class="job-meta">
        <span>📍 ${escapeHTML(job.location)}</span>
      </div>

      <p class="job-salary">${escapeHTML(job.salary)}</p>

      <button
        class="apply-btn"
        data-job-id="${escapeHTML(job.id)}"
        onclick="applyForJob(this.dataset.jobId)"
      >Apply Now →</button>
    </article>
  `).join("");
}

/* Search and filter */
function filterJobs() {
  const query = (
    document.getElementById("searchInput")?.value || ""
  ).trim().toLowerCase();

  const location = (
    document.getElementById("locationFilter")?.value || ""
  ).toLowerCase();

  const type = (
    document.getElementById("jobTypeFilter")?.value || ""
  ).toLowerCase();

  const filtered = jobs.filter(job => {
    const text = [
      job.title,
      job.company,
      job.description,
      job.location
    ].join(" ").toLowerCase();

    return text.includes(query) &&
      (!location || job.location.toLowerCase() === location) &&
      (!type || job.type.toLowerCase() === type);
  });

  renderJobs(filtered);
}

/* Authentication modal */
function openAuthModal(mode = "login") {
  setAuthMode(mode);

  document.getElementById("modalBackdrop")
    ?.classList.remove("hidden");

  document.getElementById("authEmail")?.focus();
}

function closeAuthModal() {
  document.getElementById("modalBackdrop")
    ?.classList.add("hidden");
}

function setAuthMode(mode) {
  authMode = mode;

  const isSignup = mode === "signup";

  document.getElementById("loginTab")
    ?.classList.toggle("active", !isSignup);

  document.getElementById("signupTab")
    ?.classList.toggle("active", isSignup);

  document.getElementById("nameField")
    ?.classList.toggle("hidden", !isSignup);

  document.getElementById("roleField")
    ?.classList.toggle("hidden", !isSignup);

  const nameInput = document.getElementById("authName");
  if (nameInput) nameInput.required = isSignup;

  const title = document.getElementById("modalTitle");
  if (title) {
    title.textContent = isSignup
      ? "Create your account"
      : "Welcome back!";
  }

  const submit = document.getElementById("authSubmit");
  if (submit) {
    submit.textContent = isSignup
      ? "Create Account"
      : "Login";
  }
}

/* Demo login and registration */
function handleAuth(event) {
  event.preventDefault();

  const email = document.getElementById("authEmail")
    .value.trim().toLowerCase();

  const password = document.getElementById("authPassword").value;

  const users = readStorage(STORAGE.users, []);

  if (password.length < 8) {
    showToast("Password must contain at least 8 characters.");
    return;
  }

  if (authMode === "signup") {
    const name = document.getElementById("authName")
      .value.trim();

    const role = document.getElementById("authRole").value;

    if (!name) {
      showToast("Please enter your name.");
      return;
    }

    if (users.some(user => user.email === email)) {
      showToast("An account with this email already exists.");
      return;
    }

    const user = {
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()),
      name,
      email,
      password,
      role
    };

    users.push(user);

    if (!writeStorage(STORAGE.users, users)) return;

    currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    writeStorage(STORAGE.session, currentUser);
    showToast("Account created successfully!");
  } else {
    const user = users.find(
      item => item.email === email && item.password === password
    );

    if (!user) {
      showToast("Invalid email or password. Try signing up first.");
      return;
    }

    currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    writeStorage(STORAGE.session, currentUser);
    showToast("Welcome back, " + user.name + "!");
  }

  closeAuthModal();
  updateDashboard();
}

/* Sign out */
function logout() {
  currentUser = null;

  try {
    localStorage.removeItem(STORAGE.session);
  } catch (error) {
    console.error(error);
  }

  updateDashboard();
  showToast("You have logged out.");
}

/* Application tracking */
function getApplications() {
  return readStorage(STORAGE.applications, []);
}

function applyForJob(jobId) {
  if (!currentUser) {
    showToast("Please log in before applying.");
    openAuthModal("login");
    return;
  }

  if (currentUser.role !== "student") {
    showToast("Only student accounts can apply for jobs.");
    return;
  }

  const job = jobs.find(item => item.id === jobId);

  if (!job) {
    showToast("This job is no longer available.");
    return;
  }

  const applications = getApplications();

  const alreadyApplied = applications.some(
    item => item.jobId === jobId && item.userId === currentUser.id
  );

  if (alreadyApplied) {
    showToast("You have already applied for this job.");
    return;
  }

  applications.push({
    id: String(Date.now()),
    userId: currentUser.id,
    jobId: job.id,
    title: job.title,
    company: job.company,
    appliedAt: new Date().toISOString(),
    status: "Pending"
  });

  if (!writeStorage(STORAGE.applications, applications)) return;

  updateDashboard();
  showToast("Application submitted successfully!");
}

/* Dashboard */
function updateDashboard() {
  const userStatus = document.getElementById("userStatus");
  const authButton = document.getElementById("authButton");
  const logoutButton = document.getElementById("logoutButton");
  const profileName = document.getElementById("profileName");
  const profileRole = document.getElementById("profileRole");

  if (currentUser) {
    if (userStatus) userStatus.textContent = "Signed in";
    if (authButton) authButton.classList.add("hidden");
    if (logoutButton) logoutButton.classList.remove("hidden");

    if (profileName) profileName.textContent = currentUser.name;
    if (profileRole) {
      profileRole.textContent =
        currentUser.role === "recruiter"
          ? "Recruiter workspace"
          : "Student workspace";
    }
  } else {
    if (userStatus) userStatus.textContent = "Guest mode";
    if (authButton) authButton.classList.remove("hidden");
    if (logoutButton) logoutButton.classList.add("hidden");

    if (profileName) profileName.textContent = "Guest";
    if (profileRole) profileRole.textContent = "Student workspace";
  }

  const count = currentUser
    ? getApplications().filter(
        app => app.userId === currentUser.id
      ).length
    : 0;

  const applicationCount = document.getElementById("applicationCount");
  if (applicationCount) applicationCount.textContent = count;
}

/* Display applications */
function showApplications() {
  const panel = document.getElementById("applicationsPanel");
  const list = document.getElementById("applicationsList");

  if (!currentUser) {
    showToast("Please log in to view your applications.");
    openAuthModal("login");
    return;
  }

  if (currentUser.role !== "student") {
    showToast("Application tracking is available for student accounts.");
    return;
  }

  const applications = getApplications().filter(
    app => app.userId === currentUser.id
  );

  panel.classList.remove("hidden");

  if (!applications.length) {
    list.innerHTML = `
      <div class="empty-state">
        You haven't applied for any jobs yet.
        <br><br>
        <a href="#jobs" class="text-button">Explore open jobs →</a>
      </div>
    `;
  } else {
    list.innerHTML = applications.map(app => `
      <div class="application-item">
        <div>
          <strong>${escapeHTML(app.title)}</strong>
          <p>${escapeHTML(app.company)} · Applied ${
            new Date(app.appliedAt).toLocaleDateString()
          }</p>
        </div>
        <span class="status-pill">${escapeHTML(app.status)}</span>
      </div>
    `).join("");
  }

  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* Mobile navigation */
function toggleMenu() {
  const nav = document.getElementById("navLinks");
  nav?.classList.toggle("open");
}

/* Initialize all interactions */
document.addEventListener("DOMContentLoaded", () => {
  renderJobs(jobs);
  updateDashboard();

  document.getElementById("searchButton")
    ?.addEventListener("click", filterJobs);

  document.getElementById("searchInput")
    ?.addEventListener("input", filterJobs);

  document.getElementById("locationFilter")
    ?.addEventListener("change", filterJobs);

  document.getElementById("jobTypeFilter")
    ?.addEventListener("change", filterJobs);

  document.getElementById("authButton")
    ?.addEventListener("click", () => openAuthModal("login"));

  document.getElementById("profileButton")
    ?.addEventListener("click", () => {
      if (currentUser) {
        showToast("You are signed in as " + currentUser.name + ".");
      } else {
        openAuthModal("signup");
      }
    });

  document.getElementById("logoutButton")
    ?.addEventListener("click", logout);

  document.getElementById("loginTab")
    ?.addEventListener("click", () => setAuthMode("login"));

  document.getElementById("signupTab")
    ?.addEventListener("click", () => setAuthMode("signup"));

  document.getElementById("authForm")
    ?.addEventListener("submit", handleAuth);

  document.getElementById("closeModal")
    ?.addEventListener("click", closeAuthModal);

  document.getElementById("modalBackdrop")
    ?.addEventListener("click", event => {
      if (event.target.id === "modalBackdrop") {
        closeAuthModal();
      }
    });

  document.getElementById("menuToggle")
    ?.addEventListener("click", toggleMenu);

  document.getElementById("navLinks")
    ?.querySelectorAll("a")
    .forEach(link => {
      link.addEventListener("click", () => {
        document.getElementById("navLinks")
          ?.classList.remove("open");
      });
    });

  document.getElementById("viewApplications")
    ?.addEventListener("click", showApplications);

  document.getElementById("closeApplications")
    ?.addEventListener("click", () => {
      document.getElementById("applicationsPanel")
        ?.classList.add("hidden");
    });

  document.getElementById("currentYear").textContent =
    new Date().getFullYear();

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeAuthModal();
  });
});