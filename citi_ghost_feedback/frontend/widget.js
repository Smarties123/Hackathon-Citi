(() => {
  if (window.CitiGhostWidgetLoaded) {
    return;
  }
  window.CitiGhostWidgetLoaded = true;

  const COLORS = {
    primaryBg: "#0A1224",
    secondaryBg: "#111C33",
    textPrimary: "#E8ECF2",
    textSecondary: "#9BA7B8",
    accentBlue: "#255BE3",
    accentRed: "#FF3C28",
    accentCyan: "#2DAEF7",
    border: "#1E2A3D",
  };

  const state = {
    screenshotData: null,
    role: "Client",
  };

  const createGhostSVG = (size = 28) => `
    <svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">
      <defs>
        <linearGradient id="ghostGradient" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#2DAEF7"/>
          <stop offset="100%" stop-color="#255BE3"/>
        </linearGradient>
      </defs>
      <path d="M32 6c12.7 0 21 9.2 21 22.3V58l-5.4-6.5-4.7 6.9-5.9-6.9-5.9 6.9-4.7-6.9L21 58V28.3C21 15.2 19.3 6 32 6Z" fill="url(#ghostGradient)" stroke="#2DAEF7" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="25" cy="30" r="4" fill="#0A1224"/>
      <circle cx="39" cy="30" r="4" fill="#0A1224"/>
      <path d="M26 41c1.8 2 4 3 6.8 3 2.9 0 5-1 6.8-3" stroke="#F6F8FC" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    </svg>
  `;

  const injectStyles = () => {
    if (document.getElementById("citi-ghost-widget-styles")) return;
    const style = document.createElement("style");
    style.id = "citi-ghost-widget-styles";
    style.textContent = `
      .citi-ghost-toolbar {
        position: fixed;
        bottom: 24px;
        right: 24px;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 1rem;
        border-radius: 999px;
        background: linear-gradient(120deg, ${COLORS.accentBlue}, #1936a8);
        color: #fff;
        font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid rgba(45, 174, 247, 0.45);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
        z-index: 2147483001;
        user-select: none;
      }
      .citi-ghost-toolbar:hover {
        box-shadow: 0 25px 50px rgba(25, 54, 168, 0.45);
      }
      .citi-ghost-menu {
        position: fixed;
        width: 260px;
        background: ${COLORS.secondaryBg};
        border-radius: 14px;
        border: 1px solid ${COLORS.border};
        padding: 1rem;
        color: ${COLORS.textPrimary};
        font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        box-shadow: 0 20px 55px rgba(0, 0, 0, 0.55);
        z-index: 2147483000;
      }
      .citi-ghost-menu.hidden {
        display: none;
      }
      .ghost-menu-label {
        font-size: 0.9rem;
        color: ${COLORS.textSecondary};
        margin-bottom: 0.35rem;
      }
      .ghost-menu-role {
        width: 100%;
        border-radius: 10px;
        padding: 0.4rem;
        border: 1px solid ${COLORS.border};
        background: #0d172d;
        color: ${COLORS.textPrimary};
        margin-bottom: 0.75rem;
      }
      .ghost-menu-actions button {
        width: 100%;
        border-radius: 10px;
        padding: 0.6rem 0.75rem;
        margin-top: 0.45rem;
        border: 1px solid rgba(45, 174, 247, 0.35);
        background: rgba(37, 91, 227, 0.15);
        color: ${COLORS.textPrimary};
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.1s ease, box-shadow 0.1s ease;
      }
      .ghost-menu-actions button.primary {
        background: ${COLORS.accentBlue};
        border-color: transparent;
      }
      .ghost-menu-actions button.placeholder {
        opacity: 0.65;
      }
      .ghost-menu-actions button:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
      }
      .citi-ghost-modal {
        position: fixed;
        inset: 0;
        background: rgba(10, 18, 36, 0.82);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483999;
        font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      }
      .citi-ghost-modal.hidden {
        display: none;
      }
      .ghost-modal-card {
        width: min(520px, 95%);
        background: #0f1a32;
        border-radius: 20px;
        border: 1px solid ${COLORS.border};
        padding: 1.5rem;
        box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6);
      }
      .ghost-modal-header {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        margin-bottom: 1rem;
      }
      .ghost-modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
        color: ${COLORS.textPrimary};
      }
      .ghost-modal-header p {
        margin: 0.1rem 0 0;
        color: ${COLORS.textSecondary};
        font-size: 0.9rem;
      }
      .ghost-modal-close {
        margin-left: auto;
        background: transparent;
        border: none;
        color: ${COLORS.textSecondary};
        font-size: 1.2rem;
        cursor: pointer;
      }
      .ghost-modal-body textarea {
        width: 100%;
        min-height: 120px;
        background: #0a1429;
        border-radius: 12px;
        border: 1px solid ${COLORS.border};
        color: ${COLORS.textPrimary};
        padding: 0.75rem;
        resize: vertical;
        font-size: 0.95rem;
      }
      .ghost-modal-body label {
        font-size: 0.85rem;
        color: ${COLORS.textSecondary};
      }
      .ghost-modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1rem;
      }
      .ghost-modal-footer button {
        border-radius: 10px;
        padding: 0.6rem 1.2rem;
        font-weight: 600;
        border: 1px solid transparent;
        cursor: pointer;
      }
      .ghost-modal-footer .secondary {
        background: transparent;
        border-color: ${COLORS.border};
        color: ${COLORS.textSecondary};
      }
      .ghost-modal-footer .primary {
        background: ${COLORS.accentBlue};
        color: #fff;
      }
      .ghost-status {
        margin-top: 0.4rem;
        font-size: 0.85rem;
        color: ${COLORS.textSecondary};
      }
      .ghost-status.success {
        color: ${COLORS.accentCyan};
      }
      .ghost-status.error {
        color: ${COLORS.accentRed};
      }
      .ghost-meta {
        font-size: 0.8rem;
        color: ${COLORS.textSecondary};
        margin-top: 0.8rem;
        background: rgba(14, 23, 43, 0.8);
        border-radius: 10px;
        padding: 0.6rem;
        border: 1px dashed ${COLORS.border};
        word-break: break-all;
      }
      .ghost-toolbar-label {
        font-size: 0.95rem;
        letter-spacing: 0.02em;
      }
    `;
    document.head.appendChild(style);
  };

  const createToolbar = () => {
    const toolbar = document.createElement("div");
    toolbar.className = "citi-ghost-toolbar";
    toolbar.innerHTML = `
      <div class="ghost-icon-mini">${createGhostSVG(32)}</div>
      <span class="ghost-toolbar-label">Ghost Panel</span>
    `;
    return toolbar;
  };

  const createMenu = () => {
    const menu = document.createElement("div");
    menu.className = "citi-ghost-menu hidden";
    menu.innerHTML = `
      <div class="ghost-menu-label">Who is giving feedback?</div>
      <select class="ghost-menu-role">
        <option value="Client">Client</option>
        <option value="Product Support">Product Support</option>
        <option value="Product Management">Product Management</option>
        <option value="Engineering">Engineering</option>
      </select>
      <div class="ghost-menu-actions">
        <button class="primary" data-action="give-feedback">Give Feedback</button>
        <button class="placeholder" data-action="tickets">View Recent Tickets</button>
        <button class="placeholder" data-action="settings">Settings</button>
      </div>
    `;
    return menu;
  };

  const createModal = () => {
    const modal = document.createElement("div");
    modal.className = "citi-ghost-modal hidden";
    modal.innerHTML = `
      <div class="ghost-modal-card">
        <div class="ghost-modal-header">
          <div class="ghost-icon-mini">${createGhostSVG(40)}</div>
          <div>
            <h2>Submit Feedback</h2>
            <p class="ghost-role-pill">Role: <span class="role-value">${state.role}</span></p>
          </div>
          <button class="ghost-modal-close" aria-label="Close feedback panel">&times;</button>
        </div>
        <div class="ghost-modal-body">
          <label for="ghostDescription">Description</label>
          <textarea id="ghostDescription" placeholder="What happened? Include key steps or context."></textarea>
          <div class="ghost-modal-actions">
            <button type="button" class="ghost-btn capture-btn">Capture Screenshot</button>
            <span class="ghost-status capture-status"></span>
          </div>
          <div class="ghost-meta ghost-url"></div>
        </div>
        <div class="ghost-modal-footer">
          <button class="secondary ghost-cancel">Cancel</button>
          <button class="primary ghost-submit">Submit Feedback</button>
        </div>
        <div class="ghost-status submit-status"></div>
      </div>
    `;
    return modal;
  };

  const updateRoleText = (menu, modal) => {
    const roleLabel = modal.querySelector(".role-value");
    roleLabel.textContent = state.role;
  };

  const updateUrlMeta = (modal) => {
    const urlMeta = modal.querySelector(".ghost-url");
    urlMeta.textContent = `Page URL: ${window.location.href}`;
  };

  injectStyles();

  const toolbar = createToolbar();
  const menu = createMenu();
  const modal = createModal();

  document.body.appendChild(toolbar);
  document.body.appendChild(menu);
  document.body.appendChild(modal);

  const roleSelect = menu.querySelector(".ghost-menu-role");
  const captureBtn = modal.querySelector(".capture-btn");
  const captureStatus = modal.querySelector(".capture-status");
  const submitBtn = modal.querySelector(".ghost-submit");
  const submitStatus = modal.querySelector(".submit-status");
  const descriptionInput = modal.querySelector("#ghostDescription");
  const cancelBtn = modal.querySelector(".ghost-cancel");
  const closeBtn = modal.querySelector(".ghost-modal-close");
  const urlMeta = modal.querySelector(".ghost-url");

  urlMeta.textContent = `Page URL: ${window.location.href}`;

  const showMenu = (open) => {
    if (open) {
      menu.classList.remove("hidden");
      positionMenu();
    } else {
      menu.classList.add("hidden");
    }
  };

  const positionMenu = () => {
    const rect = toolbar.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    let top = rect.top - menuRect.height - 12;
    if (top < 12) {
      top = rect.bottom + 12;
    }
    let left = rect.left;
    if (left + menuRect.width > window.innerWidth - 12) {
      left = window.innerWidth - menuRect.width - 12;
    }
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.right = "auto";
    menu.style.bottom = "auto";
  };

  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let toolbarStartX = 0;
  let toolbarStartY = 0;
  let moved = false;

  const onMouseMove = (event) => {
    if (!isDragging) return;
    const deltaX = event.clientX - dragStartX;
    const deltaY = event.clientY - dragStartY;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      moved = true;
    }
    const nextX = toolbarStartX + deltaX;
    const nextY = toolbarStartY + deltaY;
    const boundedX = Math.min(
      window.innerWidth - toolbar.offsetWidth - 12,
      Math.max(12, nextX)
    );
    const boundedY = Math.min(
      window.innerHeight - toolbar.offsetHeight - 12,
      Math.max(12, nextY)
    );
    toolbar.style.left = `${boundedX}px`;
    toolbar.style.top = `${boundedY}px`;
    toolbar.style.right = "auto";
    toolbar.style.bottom = "auto";
    positionMenu();
  };

  const endDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", endDrag);
    if (!moved) {
      toggleMenu();
    }
    setTimeout(() => {
      moved = false;
    }, 0);
  };

  const startDrag = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    isDragging = true;
    const rect = toolbar.getBoundingClientRect();
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    toolbarStartX = rect.left;
    toolbarStartY = rect.top;
    moved = false;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", endDrag);
  };

  const toggleMenu = () => {
    const isHidden = menu.classList.contains("hidden");
    showMenu(isHidden);
  };

  toolbar.addEventListener("mousedown", startDrag);

  roleSelect.addEventListener("change", (event) => {
    state.role = event.target.value;
    updateRoleText(menu, modal);
  });

  const openFeedbackModal = () => {
    modal.classList.remove("hidden");
    showMenu(false);
    submitStatus.textContent = "";
    captureStatus.textContent = state.screenshotData ? "Screenshot ready." : "";
    captureStatus.className = `ghost-status capture-status ${
      state.screenshotData ? "success" : ""
    }`;
    updateUrlMeta(modal);
  };

  const closeModal = () => {
    modal.classList.add("hidden");
  };

  menu.addEventListener("click", (event) => {
    if (event.target.matches("[data-action='give-feedback']")) {
      openFeedbackModal();
    } else if (event.target.matches("[data-action='tickets']")) {
      alert("Recent tickets view is coming soon.");
    } else if (event.target.matches("[data-action='settings']")) {
      alert("Settings panel is under construction.");
    }
  });

  const resetScreenshot = () => {
    state.screenshotData = null;
    captureStatus.textContent = "";
    captureStatus.className = "ghost-status capture-status";
  };

  cancelBtn.addEventListener("click", () => {
    closeModal();
    resetScreenshot();
    descriptionInput.value = "";
  });

  closeBtn.addEventListener("click", () => {
    closeModal();
  });

  captureBtn.addEventListener("click", async () => {
    if (typeof html2canvas !== "function") {
      captureStatus.textContent = "html2canvas is missing.";
      captureStatus.className = "ghost-status capture-status error";
      return;
    }
    captureStatus.textContent = "Capturing screenshot...";
    captureStatus.className = "ghost-status capture-status";
    try {
      const canvas = await html2canvas(document.body, { useCORS: true });
      state.screenshotData = canvas.toDataURL("image/png");
      captureStatus.textContent = "Screenshot captured.";
      captureStatus.className = "ghost-status capture-status success";
    } catch (error) {
      console.error("Screenshot failed", error);
      state.screenshotData = null;
      captureStatus.textContent = "Screenshot failed.";
      captureStatus.className = "ghost-status capture-status error";
    }
  });

  submitBtn.addEventListener("click", async () => {
    const description = descriptionInput.value.trim();
    if (!description) {
      submitStatus.textContent = "Description is required.";
      submitStatus.className = "ghost-status submit-status error";
      return;
    }
    submitStatus.textContent = "Submitting...";
    submitStatus.className = "ghost-status submit-status";
    try {
      const response = await fetch("http://localhost:5000/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: state.role,
          description,
          url: window.location.href,
          userAgent: navigator.userAgent,
          screenshot: state.screenshotData,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Server error");
      }
      submitStatus.textContent = `Feedback submitted! Ticket ID: ${data.ticket_id}`;
      submitStatus.className = "ghost-status submit-status success";
      descriptionInput.value = "";
      resetScreenshot();
      setTimeout(() => {
        closeModal();
        submitStatus.textContent = "";
      }, 1800);
    } catch (error) {
      submitStatus.textContent = error.message;
      submitStatus.className = "ghost-status submit-status error";
    }
  });

  window.addEventListener("resize", () => {
    if (!menu.classList.contains("hidden")) {
      positionMenu();
    }
  });

  document.addEventListener("click", (event) => {
    const isClickInside =
      event.target.closest(".citi-ghost-toolbar") ||
      event.target.closest(".citi-ghost-menu") ||
      event.target.closest(".citi-ghost-modal");
    if (!isClickInside) {
      showMenu(false);
    }
  });

  window.citiGhostWidget = {
    openMenu: () => showMenu(true),
    openFeedback: openFeedbackModal,
    closeFeedback: closeModal,
  };

  document.dispatchEvent(
    new CustomEvent("citiGhostWidgetReady", {
      detail: window.citiGhostWidget,
    })
  );
})();
