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
        width: min(600px, 95%);
        max-height: 90vh;
        overflow-y: auto;
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
      .ghost-modal-body {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.5rem 0;
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
      .screenshot-preview-wrapper {
        position: relative;
        display: inline-block;
        width: 100%;
        max-width: 100%;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid ${COLORS.border};
        background: rgba(10, 20, 41, 0.8);
      }
      .screenshot-preview-img {
        width: 100%;
        height: auto;
        max-height: 300px;
        object-fit: contain;
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
            <label for="ghostIssueType">Issue Type *</label>
            <select id="ghostIssueType" class="ghost-select" required>
              <option value="">Select issue type...</option>
              <option value="Bug">🐛 Bug</option>
              <option value="Feature Request">✨ Feature Request</option>
              <option value="Performance">⚡ Performance Issue</option>
              <option value="UI/UX">🎨 UI/UX Improvement</option>
              <option value="Security">🔒 Security Concern</option>
              <option value="Data Issue">📊 Data Issue</option>
              <option value="Integration">🔗 Integration Problem</option>
              <option value="Other">📝 Other</option>
            </select>
          </div>
          
          <div class="form-row">
            <div class="form-field">
              <label for="ghostPriority">Priority *</label>
              <select id="ghostPriority" class="ghost-select" required>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div class="form-field">
              <label for="ghostCategory">Category/Tag</label>
              <select id="ghostCategory" class="ghost-select">
                <option value="">None</option>
                <option value="Trading">Trading</option>
                <option value="Reporting">Reporting</option>
                <option value="Authentication">Authentication</option>
                <option value="API">API</option>
                <option value="Dashboard">Dashboard</option>
                <option value="Mobile">Mobile</option>
                <option value="Backend">Backend</option>
                <option value="Frontend">Frontend</option>
              </select>
            </div>
          </div>

          <div class="form-field">
            <label for="ghostDescription">Description *</label>
            <textarea id="ghostDescription" class="ghost-textarea" placeholder="Brief description of the issue or request (will be used as Jira summary)" required></textarea>
            <small class="field-hint">Keep it concise - this becomes the Jira ticket title</small>
          </div>

          <div class="form-field">
            <label for="ghostDetails">Additional Details</label>
            <textarea id="ghostDetails" class="ghost-textarea" placeholder="Steps to reproduce, expected vs actual behavior, environment details, etc. (optional)"></textarea>
            <small class="field-hint">This will be included in the Jira ticket description</small>
          </div>

          <div class="ghost-modal-actions">
            <div class="screenshot-section">
              <div style="display: flex; gap: 0.5rem;">
                <button type="button" class="ghost-btn capture-btn" style="flex: 1;">📸 Capture Current Page</button>
                <button type="button" class="ghost-btn detect-clipboard-btn" style="flex: 1;">📋 Detect from Clipboard</button>
              </div>
              <div class="screenshot-instructions">
                <p><strong>Tip:</strong> Take a screenshot with your system tool (Win+Shift+S / Cmd+Shift+4), then click "Detect from Clipboard" or just paste (Ctrl+V / Cmd+V) anywhere in this form.</p>
              </div>
              <div class="screenshot-preview-container" id="screenshotPreview" style="display: none;">
                <div class="screenshot-preview-wrapper">
                  <img id="screenshotPreviewImg" src="" alt="Screenshot preview" class="screenshot-preview-img">
                  <button type="button" class="screenshot-delete-btn" id="screenshotDeleteBtn" title="Remove screenshot">×</button>
                </div>
              </div>
            </div>
            <input type="file" id="screenshotUpload" accept="image/*" style="display: none;">
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
  const screenshotPreview = modal.querySelector("#screenshotPreview");
  const screenshotPreviewImg = modal.querySelector("#screenshotPreviewImg");
  const screenshotDeleteBtn = modal.querySelector("#screenshotDeleteBtn");
  let captureCountdown = null;
  const submitBtn = modal.querySelector(".ghost-submit");
  const submitStatus = modal.querySelector(".submit-status");
  const descriptionInput = modal.querySelector("#ghostDescription");
  const detailsInput = modal.querySelector("#ghostDetails");
  const issueTypeInput = modal.querySelector("#ghostIssueType");
  const priorityInput = modal.querySelector("#ghostPriority");
  const categoryInput = modal.querySelector("#ghostCategory");
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
              setScreenshot(event.target.result);
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
    showMenu(false);
    // Focus the modal to enable paste events
    modal.focus();
    modal.setAttribute("tabindex", "-1");
    submitStatus.textContent = "";
    
    // Reset clipboard check flag
    clipboardCheckAttempted = false;
    
    // Clear any active countdown
    if (captureCountdown) {
      clearInterval(captureCountdown);
      captureCountdown = null;
    }
    
    // Show screenshot preview if exists
    if (state.screenshotData && screenshotPreviewImg) {
      screenshotPreviewImg.src = state.screenshotData;
      if (screenshotPreview) {
        screenshotPreview.style.display = "block";
      }
      captureStatus.textContent = "Screenshot ready.";
      captureStatus.className = "ghost-status capture-status success";
    } else {
      if (screenshotPreview) {
        screenshotPreview.style.display = "none";
      }
      captureStatus.textContent = "Click anywhere to detect screenshot from clipboard";
      captureStatus.className = "ghost-status capture-status";
    }
    
    // Apply template if provided
    if (templateData) {
      const descriptionField = modal.querySelector("#ghostDescription");
      const detailsField = modal.querySelector("#ghostDetails");
      const issueTypeField = modal.querySelector("#ghostIssueType");
      const priorityField = modal.querySelector("#ghostPriority");
      const categoryField = modal.querySelector("#ghostCategory");
      
      if (descriptionField && templateData.description) {
        descriptionField.value = templateData.description;
      }
      if (detailsField && templateData.details) {
        detailsField.value = templateData.details;
      }
      if (issueTypeField && templateData.issueType) {
        issueTypeField.value = templateData.issueType;
      }
      if (priorityField && templateData.priority) {
        priorityField.value = templateData.priority;
      }
      if (categoryField && templateData.category) {
        categoryField.value = templateData.category;
      }
      if (templateData.role) {
        state.role = templateData.role;
        roleSelect.value = templateData.role;
        updateRoleText(menu, modal);
      }
    } else {
      // Clear all fields if no template
      const descriptionField = modal.querySelector("#ghostDescription");
      const detailsField = modal.querySelector("#ghostDetails");
      const issueTypeField = modal.querySelector("#ghostIssueType");
      if (descriptionField) descriptionField.value = "";
      if (detailsField) detailsField.value = "";
      if (issueTypeField) issueTypeField.value = "";
    }
  };

  const closeModal = () => {
    modal.classList.add("hidden");
  };

  menu.addEventListener("click", (event) => {
    if (event.target.matches("[data-action='give-feedback']")) {
      openFeedbackModal();
    }
  });

  // Function to set screenshot and show preview
  const setScreenshot = (dataUrl) => {
    state.screenshotData = dataUrl;
    if (screenshotPreviewImg) {
      screenshotPreviewImg.src = dataUrl;
    }
    if (screenshotPreview) {
      screenshotPreview.style.display = "block";
    }
    captureStatus.textContent = "Screenshot ready.";
    captureStatus.className = "ghost-status capture-status success";
  };

  // Function to remove screenshot
  const removeScreenshot = () => {
    state.screenshotData = null;
    if (screenshotPreview) {
      screenshotPreview.style.display = "none";
    }
    if (screenshotPreviewImg) {
      screenshotPreviewImg.src = "";
    }
    if (screenshotUpload) {
      screenshotUpload.value = "";
    }
    captureStatus.textContent = "";
    captureStatus.className = "ghost-status capture-status";
  };

  const resetScreenshot = () => {
    removeScreenshot();
    if (captureCountdown) {
      clearInterval(captureCountdown);
      captureCountdown = null;
    }
  };

  cancelBtn.addEventListener("click", () => {
    closeModal();
    resetScreenshot();
    if (descriptionInput) descriptionInput.value = "";
    if (detailsInput) detailsInput.value = "";
    if (issueTypeInput) issueTypeInput.value = "";
  });

  closeBtn.addEventListener("click", () => {
    closeModal();
  });

  // Delete screenshot button
  screenshotDeleteBtn?.addEventListener("click", () => {
    removeScreenshot();
  });

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
      const canvas = await html2canvas(document.body, { 
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      setScreenshot(canvas.toDataURL("image/png"));
    } catch (error) {
      console.error("Screenshot failed", error);
      state.screenshotData = null;
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
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      captureStatus.textContent = "Please select an image file.";
      captureStatus.className = "ghost-status capture-status error";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshot(e.target.result);
    };
    reader.onerror = () => {
      captureStatus.textContent = "Failed to read file.";
      captureStatus.className = "ghost-status capture-status error";
    };
    reader.readAsDataURL(file);
  });

  // Auto-detect clipboard screenshot on any click in the modal
  let clipboardCheckAttempted = false;
  modal.addEventListener("click", async (e) => {
    // Only check if we don't already have a screenshot and haven't checked yet
    if (!state.screenshotData && !clipboardCheckAttempted) {
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
          setScreenshot(event.target.result);
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
    const issueType = issueTypeInput ? issueTypeInput.value.trim() : "";
    const priority = priorityInput ? priorityInput.value.trim() : "Medium";
    const category = categoryInput ? categoryInput.value.trim() : "";
    const description = descriptionInput ? descriptionInput.value.trim() : "";
    const details = detailsInput ? detailsInput.value.trim() : "";

    if (!issueType) {
      submitStatus.textContent = "Issue type is required.";
      submitStatus.className = "ghost-status submit-status error";
      return;
    }
    if (!description) {
      submitStatus.textContent = "Description is required.";
      submitStatus.className = "ghost-status submit-status error";
      return;
    }

    submitStatus.textContent = "Submitting...";
    submitStatus.className = "ghost-status submit-status";
    
    // Format description for Jira
    let jiraDescription = description;
    if (details) {
      jiraDescription = `${description}\n\n*Additional Details:*\n${details}`;
    }
    
    // Add tags/category
    const tags = [];
    if (category) tags.push(category);
    if (priority) tags.push(`Priority: ${priority}`);
    if (issueType) tags.push(issueType);
    
    const tagString = tags.length > 0 ? `\n\n*Tags:* ${tags.join(", ")}` : "";
    jiraDescription += tagString;
    jiraDescription += `\n\n*Submitted by:* ${state.role}`;
    jiraDescription += `\n*URL:* ${window.location.href}`;

    try {
      // Try both localhost and 127.0.0.1 for compatibility
      const apiUrl = "http://127.0.0.1:5000/submit-feedback";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: state.role,
          description: jiraDescription,
          issueType: issueType,
          priority: priority,
          category: category,
          url: window.location.href,
          userAgent: navigator.userAgent,
          screenshot: state.screenshotData,
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
      if (descriptionInput) descriptionInput.value = "";
      if (detailsInput) detailsInput.value = "";
      if (issueTypeInput) issueTypeInput.value = "";
      if (priorityInput) priorityInput.value = "Medium";
      if (categoryInput) categoryInput.value = "";
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
