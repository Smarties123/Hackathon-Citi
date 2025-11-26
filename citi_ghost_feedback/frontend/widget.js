(() => {
  if (window.CitiGhostWidgetLoaded) {
    return;
  }
  window.CitiGhostWidgetLoaded = true;

  const API_BASE = "http://127.0.0.1:5000";

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
    screenshotData: [], // Array to support multiple screenshots
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
        width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        background: ${COLORS.secondaryBg};
        border-radius: 16px;
        border: 1px solid ${COLORS.border};
        padding: 1.5rem;
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
        color: ${COLORS.textPrimary};
        font-weight: 600;
        margin-bottom: 0.75rem;
      }
      .ghost-menu-role {
        width: 100%;
        border-radius: 10px;
        padding: 0.75rem;
        border: 1px solid ${COLORS.border};
        background: rgba(10, 20, 41, 0.6);
        color: ${COLORS.textPrimary};
        font-size: 0.95rem;
        margin-bottom: 1rem;
        transition: border-color 0.2s ease;
      }
      .ghost-menu-role:hover {
        border-color: ${COLORS.accentCyan};
      }
      .ghost-menu-role:focus {
        outline: none;
        border-color: ${COLORS.accentBlue};
      }
      .ghost-menu-quick-fields {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin: 1.25rem 0;
      }
      .ghost-menu-quick-fields .ghost-menu-field:first-child {
        grid-column: 1 / -1;
      }
      .ghost-menu-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .ghost-menu-field label {
        font-size: 0.85rem;
        color: ${COLORS.textPrimary};
        font-weight: 500;
      }
      .ghost-menu-input,
      .ghost-menu-select {
        width: 100%;
        padding: 0.75rem;
        background: rgba(10, 20, 41, 0.6);
        border-radius: 10px;
        border: 1px solid ${COLORS.border};
        color: ${COLORS.textPrimary};
        font-size: 0.9rem;
        font-family: inherit;
        transition: all 0.2s ease;
      }
      .ghost-menu-input:hover,
      .ghost-menu-select:hover {
        border-color: ${COLORS.accentCyan};
      }
      .ghost-menu-input:focus,
      .ghost-menu-select:focus {
        outline: none;
        border-color: ${COLORS.accentBlue};
        box-shadow: 0 0 0 3px rgba(37, 91, 227, 0.1);
      }
      .ghost-menu-input::placeholder {
        color: ${COLORS.textSecondary};
        opacity: 0.6;
      }
      .ghost-menu-actions {
        margin-top: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .ghost-menu-actions button {
        width: 100%;
        border-radius: 10px;
        padding: 0.75rem 1rem;
        border: 1px solid transparent;
        background: ${COLORS.accentBlue};
        color: #fff;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .ghost-menu-actions button.primary {
        background: ${COLORS.accentBlue};
        border-color: transparent;
      }
      .ghost-menu-actions button.placeholder {
        opacity: 0.65;
        background: rgba(37, 91, 227, 0.15);
        border-color: rgba(45, 174, 247, 0.35);
        color: ${COLORS.textPrimary};
      }
      .ghost-menu-actions button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(37, 91, 227, 0.4);
        background: #1e4fd4;
      }
      .ghost-menu-actions button:active {
        transform: translateY(0);
      }
      .citi-ghost-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(10, 18, 36, 0.82);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483999;
        font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        overflow: auto;
      }
      .citi-ghost-modal.hidden {
        display: none !important;
      }
      .ghost-modal-card {
        width: min(700px, 95%);
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        background: #0f1a32;
        border-radius: 20px;
        border: 1px solid ${COLORS.border};
        padding: 0;
        box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6);
      }
      .ghost-modal-header {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        padding: 1.5rem 1.5rem 1rem 1.5rem;
        flex-shrink: 0;
      }
      .ghost-modal-body {
        padding: 0 1.5rem;
        overflow-y: auto;
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .ghost-modal-footer {
        padding: 1rem 1.5rem 1.5rem 1.5rem;
        flex-shrink: 0;
        border-top: 1px solid ${COLORS.border};
        margin-top: 1rem;
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
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
      .ghost-modal-body {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
      }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }
      .ghost-modal-body label {
        font-size: 0.9rem;
        color: ${COLORS.textPrimary};
        font-weight: 500;
      }
      .ghost-input {
        width: 100%;
        padding: 0.75rem;
        background: #0a1429;
        border-radius: 8px;
        border: 1px solid ${COLORS.border};
        color: ${COLORS.textPrimary};
        font-size: 0.95rem;
        font-family: inherit;
        transition: border-color 0.2s ease;
      }
      .ghost-input:focus {
        outline: none;
        border-color: ${COLORS.accentBlue};
      }
      .ghost-input::placeholder {
        color: ${COLORS.textSecondary};
        opacity: 0.6;
      }
      .ghost-select {
        width: 100%;
        padding: 0.75rem;
        background: #0a1429;
        border-radius: 8px;
        border: 1px solid ${COLORS.border};
        color: ${COLORS.textPrimary};
        font-size: 0.95rem;
        cursor: pointer;
        transition: border-color 0.2s ease;
      }
      .ghost-select:hover {
        border-color: ${COLORS.accentCyan};
      }
      .ghost-select:focus {
        outline: none;
        border-color: ${COLORS.accentBlue};
      }
      .ghost-textarea {
        width: 100%;
        min-height: 80px;
        background: #0a1429;
        border-radius: 8px;
        border: 1px solid ${COLORS.border};
        color: ${COLORS.textPrimary};
        padding: 0.75rem;
        resize: vertical;
        font-size: 0.95rem;
        font-family: inherit;
        transition: border-color 0.2s ease;
      }
      .ghost-textarea:focus {
        outline: none;
        border-color: ${COLORS.accentBlue};
      }
      .ghost-textarea::placeholder {
        color: ${COLORS.textSecondary};
        opacity: 0.6;
      }
      .field-hint {
        font-size: 0.75rem;
        color: ${COLORS.textSecondary};
        margin-top: -0.25rem;
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
      .screenshot-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 0.5rem;
      }
      .screenshot-instructions {
        background: rgba(17, 28, 51, 0.6);
        border: 1px solid ${COLORS.border};
        border-radius: 8px;
        padding: 0.875rem;
        font-size: 0.85rem;
        color: ${COLORS.textSecondary};
        line-height: 1.5;
      }
      .screenshot-instructions p {
        margin: 0;
      }
      .screenshot-preview-container {
        margin-top: 0.5rem;
      }
      .screenshots-preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 0.75rem;
        margin-top: 1rem;
      }
      .screenshot-preview-wrapper {
        position: relative;
        display: inline-block;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid ${COLORS.border};
        background: rgba(10, 20, 41, 0.8);
        aspect-ratio: 16/9;
      }
      .screenshot-preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .screenshot-delete-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(220, 38, 38, 0.9);
        border: 2px solid #fff;
        color: #fff;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        padding: 0;
      }
      .screenshot-delete-btn:hover {
        background: rgba(220, 38, 38, 1);
        transform: scale(1.1);
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
      <span class="ghost-toolbar-label">Citi Snap</span>
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
      
      <div class="ghost-menu-quick-fields">
        <div class="ghost-menu-field" style="grid-column: 1 / -1;">
          <label for="menuIssueType">Issue Type *</label>
          <select id="menuIssueType" class="ghost-menu-select">
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
            <option value="Story">Story</option>
            <option value="Incident">Incident</option>
          </select>
        </div>
        
        <div class="ghost-menu-field">
          <label for="menuPortfolio">Portfolio</label>
          <input type="text" id="menuPortfolio" class="ghost-menu-input" placeholder="Portfolio name" />
        </div>
        
        <div class="ghost-menu-field">
          <label for="menuReporterSOEID">Reporter SOEID</label>
          <input type="text" id="menuReporterSOEID" class="ghost-menu-input" placeholder="Reporter SOEID" />
        </div>
        
        <div class="ghost-menu-field">
          <label for="menuAssigneeSOEID">Assignee SOEID</label>
          <input type="text" id="menuAssigneeSOEID" class="ghost-menu-input" placeholder="Assignee SOEID" />
        </div>
        
        <div class="ghost-menu-field">
          <label for="menuReporter">Reporter</label>
          <input type="text" id="menuReporter" class="ghost-menu-input" placeholder="Reporter name" />
        </div>
        
        <div class="ghost-menu-field">
          <label for="menuPlannedStart">Planned Start</label>
          <input type="date" id="menuPlannedStart" class="ghost-menu-input" />
        </div>
        
        <div class="ghost-menu-field">
          <label for="menuPlannedEnd">Planned End</label>
          <input type="date" id="menuPlannedEnd" class="ghost-menu-input" />
        </div>
        
        <div class="ghost-menu-field">
          <label for="menuParentID">Parent ID</label>
          <input type="text" id="menuParentID" class="ghost-menu-input" placeholder="Parent ticket ID" />
        </div>
        
        <div class="ghost-menu-field">
          <label for="menuEpicLink">Epic Link</label>
          <input type="text" id="menuEpicLink" class="ghost-menu-input" placeholder="Epic link" />
        </div>
      </div>
      
      <div class="ghost-menu-actions">
        <button class="primary" data-action="give-feedback">Give Feedback</button>
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
                    <h2>Citi Snap - Submit Feedback</h2>
                    <p class="ghost-role-pill">Role: <span class="role-value">${state.role}</span></p>
                  </div>
                  <button class="ghost-modal-close" aria-label="Close feedback panel">&times;</button>
                </div>
        <div class="ghost-modal-body">
          <div class="form-field">
            <label for="ghostSummary">Summary *</label>
            <input type="text" id="ghostSummary" class="ghost-input" placeholder="Brief summary of the issue or request" required />
          </div>

          <div class="form-field">
            <label for="ghostDescription">Description *</label>
            <textarea id="ghostDescription" class="ghost-textarea" placeholder="Detailed description of the issue or request" required></textarea>
          </div>

          <div class="ghost-modal-actions">
            <div class="screenshot-section">
              <div style="display: flex; gap: 0.5rem;">
                <button type="button" class="ghost-btn capture-btn" style="flex: 1;">📸 Capture Current Page</button>
                <button type="button" class="ghost-btn detect-clipboard-btn" style="flex: 1;">📋 Detect from Clipboard</button>
              </div>
              <div class="screenshot-instructions">
                <p><strong>Tip:</strong> Take a screenshot with your system tool (Win+Shift+S / Cmd+Shift+4), then click "Detect from Clipboard" or just paste (Ctrl+V / Cmd+V) anywhere in this form. You can add multiple screenshots.</p>
              </div>
              <div class="screenshots-preview-grid" id="screenshotsPreview" style="display: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.75rem; margin-top: 1rem;">
                <!-- Screenshot previews will be added here dynamically -->
              </div>
            </div>
            <input type="file" id="screenshotUpload" accept="image/*" multiple style="display: none;">
            <span class="ghost-status capture-status"></span>
          </div>
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


  injectStyles();

  const toolbar = createToolbar();
  const menu = createMenu();
  const modal = createModal();

  document.body.appendChild(toolbar);
  document.body.appendChild(menu);
  document.body.appendChild(modal);

  const roleSelect = menu.querySelector(".ghost-menu-role");
  const captureBtn = modal.querySelector(".capture-btn");
  const detectClipboardBtn = modal.querySelector(".detect-clipboard-btn");
  const captureStatus = modal.querySelector(".capture-status");
  const screenshotUpload = modal.querySelector("#screenshotUpload");
  const screenshotsPreview = modal.querySelector("#screenshotsPreview");
  let captureCountdown = null;
  const submitBtn = modal.querySelector(".ghost-submit");
  const submitStatus = modal.querySelector(".submit-status");
  const summaryInput = modal.querySelector("#ghostSummary");
  const descriptionInput = modal.querySelector("#ghostDescription");
  
  // Menu fields (these are in the initial panel)
  const menuIssueType = menu.querySelector("#menuIssueType");
  const menuPortfolio = menu.querySelector("#menuPortfolio");
  const menuReporterSOEID = menu.querySelector("#menuReporterSOEID");
  const menuAssigneeSOEID = menu.querySelector("#menuAssigneeSOEID");
  const menuReporter = menu.querySelector("#menuReporter");
  const menuPlannedStart = menu.querySelector("#menuPlannedStart");
  const menuPlannedEnd = menu.querySelector("#menuPlannedEnd");
  const menuParentID = menu.querySelector("#menuParentID");
  const menuEpicLink = menu.querySelector("#menuEpicLink");
  const cancelBtn = modal.querySelector(".ghost-cancel");
  const closeBtn = modal.querySelector(".ghost-modal-close");

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

  // Function to automatically detect screenshot from clipboard
  const detectClipboardScreenshot = async () => {
    try {
      // Check if Clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.read) {
        // Fallback: try reading from paste event data
        return false;
      }

      // Try to read clipboard
      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        // Check for image types
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const reader = new FileReader();
            reader.onload = (event) => {
              addScreenshot(event.target.result);
              captureStatus.textContent = "Screenshot detected from clipboard!";
              captureStatus.className = "ghost-status capture-status success";
            };
            reader.readAsDataURL(blob);
            return true; // Found image, stop looking
          }
        }
      }
      return false;
    } catch (error) {
      // Clipboard might be empty or permission denied - that's okay
      console.log("Clipboard read failed (this is normal):", error);
      return false;
    }
  };

  const openFeedbackModal = (templateData = null) => {
    modal.classList.remove("hidden");
    // Ensure modal covers full screen
    modal.style.visibility = "visible";
    modal.style.opacity = "1";
    showMenu(false);
    // Focus the modal to enable paste events
    modal.focus();
    modal.setAttribute("tabindex", "-1");
    submitStatus.textContent = "";
    
    // Values from menu quick fields will be used directly in submit (no need to copy to modal)
    
    // Reset clipboard check flag
    clipboardCheckAttempted = false;
    
    // Clear any active countdown
    if (captureCountdown) {
      clearInterval(captureCountdown);
      captureCountdown = null;
    }
    
    // Show screenshot preview if exists
    updateScreenshotsPreview();
    if (state.screenshotData.length > 0) {
      captureStatus.textContent = `${state.screenshotData.length} screenshot(s) ready.`;
      captureStatus.className = "ghost-status capture-status success";
    } else {
      captureStatus.textContent = "Click anywhere to detect screenshot from clipboard";
      captureStatus.className = "ghost-status capture-status";
    }
    
    // Apply template if provided
    if (templateData) {
      const summaryField = modal.querySelector("#ghostSummary");
      const descriptionField = modal.querySelector("#ghostDescription");
      
      if (summaryField && templateData.summary) {
        summaryField.value = templateData.summary;
      }
      if (descriptionField && templateData.description) {
        descriptionField.value = templateData.description;
      }
      if (menuIssueType && templateData.issueType) {
        menuIssueType.value = templateData.issueType;
      }
      if (templateData.role) {
        state.role = templateData.role;
        roleSelect.value = templateData.role;
        updateRoleText(menu, modal);
      }
    } else {
      // Clear modal fields if no template (menu fields stay for next submission)
      const summaryField = modal.querySelector("#ghostSummary");
      const descriptionField = modal.querySelector("#ghostDescription");
      if (summaryField) summaryField.value = "";
      if (descriptionField) descriptionField.value = "";
    }
  };

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.style.visibility = "";
    modal.style.opacity = "";
  };

  menu.addEventListener("click", (event) => {
    if (event.target.matches("[data-action='give-feedback']")) {
      openFeedbackModal();
    }
  });

  // Function to add screenshot and show preview
  const addScreenshot = (dataUrl) => {
    if (!state.screenshotData.includes(dataUrl)) {
      state.screenshotData.push(dataUrl);
      updateScreenshotsPreview();
      captureStatus.textContent = `Screenshot added (${state.screenshotData.length} total).`;
      captureStatus.className = "ghost-status capture-status success";
    }
  };

  // Function to remove screenshot by index
  const removeScreenshot = (index) => {
    if (index >= 0 && index < state.screenshotData.length) {
      state.screenshotData.splice(index, 1);
      updateScreenshotsPreview();
      if (state.screenshotData.length === 0) {
        captureStatus.textContent = "";
        captureStatus.className = "ghost-status capture-status";
      } else {
        captureStatus.textContent = `${state.screenshotData.length} screenshot(s) ready.`;
        captureStatus.className = "ghost-status capture-status success";
      }
    }
  };

  // Function to update the screenshots preview grid
  const updateScreenshotsPreview = () => {
    if (!screenshotsPreview) return;
    
    if (state.screenshotData.length === 0) {
      screenshotsPreview.style.display = "none";
      return;
    }

    screenshotsPreview.style.display = "grid";
    screenshotsPreview.innerHTML = state.screenshotData.map((dataUrl, index) => `
      <div class="screenshot-preview-wrapper">
        <img src="${dataUrl}" alt="Screenshot ${index + 1}" class="screenshot-preview-img">
        <button type="button" class="screenshot-delete-btn" onclick="window.citiGhostWidget?.removeScreenshot(${index})" title="Remove screenshot">×</button>
      </div>
    `).join("");
  };

  const resetScreenshot = () => {
    state.screenshotData = [];
    updateScreenshotsPreview();
    if (screenshotUpload) {
      screenshotUpload.value = "";
    }
    if (captureCountdown) {
      clearInterval(captureCountdown);
      captureCountdown = null;
    }
    captureStatus.textContent = "";
    captureStatus.className = "ghost-status capture-status";
  };

  cancelBtn.addEventListener("click", () => {
    closeModal();
    resetScreenshot();
    if (summaryInput) summaryInput.value = "";
    if (descriptionInput) descriptionInput.value = "";
    // Note: Menu fields are kept for next submission
  });

  closeBtn.addEventListener("click", () => {
    closeModal();
  });

  // Delete screenshot button removed - now handled inline in preview grid

  // Capture current page
  captureBtn?.addEventListener("click", async () => {
    if (typeof html2canvas !== "function") {
      captureStatus.textContent = "html2canvas is missing.";
      captureStatus.className = "ghost-status capture-status error";
      return;
    }
    captureStatus.textContent = "Capturing screenshot...";
    captureStatus.className = "ghost-status capture-status";
    
    try {
      // Temporarily hide the modal overlay during capture
      const wasHidden = modal.classList.contains("hidden");
      if (!wasHidden) {
        modal.style.visibility = "hidden";
        modal.style.opacity = "0";
      }
      
      // Small delay to ensure modal is hidden before capture
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture the page (excluding the modal)
      const canvas = await html2canvas(document.body, { 
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      });
      
      // Restore modal visibility
      if (!wasHidden) {
        modal.style.visibility = "";
        modal.style.opacity = "";
      }
      
      addScreenshot(canvas.toDataURL("image/png"));
      captureStatus.textContent = "Screenshot captured!";
      captureStatus.className = "ghost-status capture-status success";
    } catch (error) {
      console.error("Screenshot failed", error);
      // Ensure modal is visible even if capture fails
      modal.style.visibility = "";
      modal.style.opacity = "";
      captureStatus.textContent = "Screenshot failed: " + error.message;
      captureStatus.className = "ghost-status capture-status error";
    }
  });

  // Detect from clipboard button
  detectClipboardBtn?.addEventListener("click", async () => {
    captureStatus.textContent = "Checking clipboard...";
    captureStatus.className = "ghost-status capture-status";
    
    const detected = await detectClipboardScreenshot();
    if (!detected) {
      captureStatus.textContent = "No screenshot found in clipboard. Take a screenshot first, then try again or paste (Ctrl+V / Cmd+V).";
      captureStatus.className = "ghost-status capture-status error";
    }
  });

  // Upload screenshot from file
  captureBtn?.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    screenshotUpload?.click();
  });

  // Double-click to upload
  captureBtn?.addEventListener("dblclick", () => {
    screenshotUpload?.click();
  });

  screenshotUpload?.addEventListener("change", (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let loadedCount = 0;
    let errorCount = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        errorCount++;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        addScreenshot(e.target.result);
        loadedCount++;
        if (loadedCount + errorCount === files.length) {
          if (errorCount > 0) {
            captureStatus.textContent = `Loaded ${loadedCount} image(s). ${errorCount} file(s) skipped (not images).`;
            captureStatus.className = "ghost-status capture-status";
          }
        }
      };
      reader.onerror = () => {
        errorCount++;
        if (loadedCount + errorCount === files.length) {
          captureStatus.textContent = `Failed to load some files. ${loadedCount} loaded, ${errorCount} failed.`;
          captureStatus.className = "ghost-status capture-status error";
        }
      };
      reader.readAsDataURL(file);
    });
  });

  // Auto-detect clipboard screenshot on any click in the modal
  let clipboardCheckAttempted = false;
  modal.addEventListener("click", async (e) => {
    // Only check if we don't already have screenshots and haven't checked yet
    if (state.screenshotData.length === 0 && !clipboardCheckAttempted) {
      clipboardCheckAttempted = true;
      captureStatus.textContent = "Checking clipboard...";
      captureStatus.className = "ghost-status capture-status";
      
      const detected = await detectClipboardScreenshot();
      if (!detected) {
        // If clipboard API didn't work, the paste handler will catch it
        captureStatus.textContent = "Take a screenshot, then paste here (Ctrl+V / Cmd+V) or click the button above";
        captureStatus.className = "ghost-status capture-status";
      }
    }
  }, { once: false });

  // Handle paste events - this is the most reliable method
  const handlePaste = async (e) => {
    if (modal.classList.contains("hidden")) return;
    
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        e.stopPropagation();
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          addScreenshot(event.target.result);
          captureStatus.textContent = "Screenshot detected!";
          captureStatus.className = "ghost-status capture-status success";
          clipboardCheckAttempted = true; // Mark as detected
        };
        reader.readAsDataURL(blob);
        return; // Found image, stop processing
      }
    }
  };

  // Listen for paste events on the modal and document
  modal.addEventListener("paste", handlePaste);
  document.addEventListener("paste", handlePaste);
  
  // Also add a focus handler to make paste work better
  modal.addEventListener("focus", () => {
    // Reset the check flag when modal gets focus
    clipboardCheckAttempted = false;
  });

  submitBtn.addEventListener("click", async () => {
    const summary = summaryInput ? summaryInput.value.trim() : "";
    const description = descriptionInput ? descriptionInput.value.trim() : "";
    
    // Get all fields from menu (initial panel)
    const issueType = menuIssueType ? menuIssueType.value.trim() : "Task";
    const portfolio = menuPortfolio ? menuPortfolio.value.trim() : "";
    const reporterSOEID = menuReporterSOEID ? menuReporterSOEID.value.trim() : "";
    const assigneeSOEID = menuAssigneeSOEID ? menuAssigneeSOEID.value.trim() : "";
    const reporter = menuReporter ? menuReporter.value.trim() : "";
    const plannedStart = menuPlannedStart ? menuPlannedStart.value : "";
    const plannedEnd = menuPlannedEnd ? menuPlannedEnd.value : "";
    const parentID = menuParentID ? menuParentID.value.trim() : "";
    const epicLink = menuEpicLink ? menuEpicLink.value.trim() : "";

    if (!summary && !description) {
      submitStatus.textContent = "Summary or description is required.";
      submitStatus.className = "ghost-status submit-status error";
      return;
    }

    submitStatus.textContent = "Submitting...";
    submitStatus.className = "ghost-status submit-status";

    try {
      const apiUrl = `${API_BASE}/submit-feedback`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: summary || description,
          issue_type: issueType,
          description: description,
          portfolio: portfolio || undefined,
          reporter_soeid: reporterSOEID || undefined,
          assignee_soeid: assigneeSOEID || undefined,
          reporter: reporter || undefined,
          planned_start: plannedStart || undefined,
          planned_end: plannedEnd || undefined,
          parent_id: parentID || undefined,
          epic_link: epicLink || undefined,
          url: window.location.href,
          userAgent: navigator.userAgent,
          screenshots: state.screenshotData, // Send as array
          screenshot: state.screenshotData.length > 0 ? state.screenshotData[0] : undefined, // Backward compatibility
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      submitStatus.textContent = `Feedback submitted! Ticket ID: ${data.ticket_id}`;
      submitStatus.className = "ghost-status submit-status success";
      
      // Clear all fields
      if (summaryInput) summaryInput.value = "";
      if (descriptionInput) descriptionInput.value = "";
      // Clear menu fields
      if (menuIssueType) menuIssueType.value = "Task";
      if (menuPortfolio) menuPortfolio.value = "";
      if (menuReporterSOEID) menuReporterSOEID.value = "";
      if (menuAssigneeSOEID) menuAssigneeSOEID.value = "";
      if (menuReporter) menuReporter.value = "";
      if (menuPlannedStart) menuPlannedStart.value = "";
      if (menuPlannedEnd) menuPlannedEnd.value = "";
      if (menuParentID) menuParentID.value = "";
      if (menuEpicLink) menuEpicLink.value = "";
      resetScreenshot();
      
      // Dispatch event to notify main page
      window.dispatchEvent(new CustomEvent("feedbackSubmitted", {
        detail: { ticket_id: data.ticket_id, timestamp: data.timestamp }
      }));
      
      setTimeout(() => {
        closeModal();
        submitStatus.textContent = "";
      }, 1800);
    } catch (error) {
      console.error("Submit error:", error);
      let errorMessage = error.message;
      
      // Provide more helpful error messages
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        errorMessage = "Cannot connect to backend. Make sure the Flask server is running on port 5000.";
      } else if (error.message.includes("CORS")) {
        errorMessage = "CORS error. Check backend CORS settings.";
      }
      
      submitStatus.textContent = errorMessage;
      submitStatus.className = "ghost-status submit-status error";
    }
  });

  // Expose methods globally for Launch Widget button
  window.citiGhostWidget = {
    openFeedback: (templateData) => {
      openFeedbackModal(templateData);
    },
    removeScreenshot: (index) => {
      removeScreenshot(index);
    }
  };

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
    openFeedback: (templateData) => openFeedbackModal(templateData),
    closeFeedback: closeModal,
  };

  document.dispatchEvent(
    new CustomEvent("citiGhostWidgetReady", {
      detail: window.citiGhostWidget,
    })
  );
})();
