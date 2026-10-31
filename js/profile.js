// User Profile & Settings Script - Interactive Profile Editing & LocalStorage Persistence

document.addEventListener('DOMContentLoaded', () => {
  const DEFAULT_NAME = 'Mr. Sharma';
  const DEFAULT_ID = '#ALVI-889B-IND';

  // DOM Elements
  const profileNameEl = document.getElementById('profile-name');
  const profileIdEl = document.getElementById('profile-id');
  const profileAvatarEl = document.getElementById('profile-avatar-initials');

  const sidebarNameEl = document.getElementById('sidebar-profile-name');
  const sidebarIdEl = document.getElementById('sidebar-profile-id');
  const sidebarAvatarEl = document.getElementById('sidebar-avatar-initials');

  const editProfileBtn = document.getElementById('edit-profile-btn');
  const editModal = document.getElementById('edit-profile-modal');
  const editNameInput = document.getElementById('edit-name-input');
  const editIdInput = document.getElementById('edit-id-input');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const saveEditBtn = document.getElementById('save-edit-btn');
  const closeModalX = document.getElementById('close-modal-x');

  // Compute initials from full name (e.g., "Mr. Sharma" -> "MS")
  function getInitials(name) {
    if (!name || typeof name !== 'string') return 'MS';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Update DOM elements with current values
  function applyProfileValues(name, patientId) {
    const initials = getInitials(name);

    if (profileNameEl) profileNameEl.textContent = name;
    if (profileIdEl) profileIdEl.textContent = patientId;
    if (profileAvatarEl) profileAvatarEl.textContent = initials;

    if (sidebarNameEl) sidebarNameEl.textContent = name;
    if (sidebarIdEl) sidebarIdEl.textContent = `ID: ${patientId}`;
    if (sidebarAvatarEl) sidebarAvatarEl.textContent = initials;
  }

  // Read saved values from localStorage or fallback to defaults
  function loadSavedProfile() {
    const savedName = localStorage.getItem('alvi_user_name') || DEFAULT_NAME;
    const savedId = localStorage.getItem('alvi_user_id') || DEFAULT_ID;
    applyProfileValues(savedName, savedId);
  }

  // Open Modal
  function openModal() {
    const currentName = localStorage.getItem('alvi_user_name') || DEFAULT_NAME;
    const currentId = localStorage.getItem('alvi_user_id') || DEFAULT_ID;

    if (editNameInput) editNameInput.value = currentName;
    if (editIdInput) editIdInput.value = currentId;

    if (editModal) editModal.classList.remove('hidden');
    if (editNameInput) editNameInput.focus();
  }

  // Close Modal
  function closeModal() {
    if (editModal) editModal.classList.add('hidden');
  }

  // Save changes to localStorage and update UI
  function saveProfile() {
    const newName = editNameInput ? editNameInput.value.trim() : '';
    const newId = editIdInput ? editIdInput.value.trim() : '';

    const nameToSave = newName !== '' ? newName : DEFAULT_NAME;
    const idToSave = newId !== '' ? newId : DEFAULT_ID;

    localStorage.setItem('alvi_user_name', nameToSave);
    localStorage.setItem('alvi_user_id', idToSave);

    applyProfileValues(nameToSave, idToSave);
    closeModal();
  }

  // Event Listeners
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', openModal);
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', closeModal);
  }

  if (closeModalX) {
    closeModalX.addEventListener('click', closeModal);
  }

  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', saveProfile);
  }

  // Close modal on backdrop click
  if (editModal) {
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) {
        closeModal();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editModal && !editModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Hover effects on profile section cards
  const profileCards = document.querySelectorAll('#page-profile .grid > div');
  profileCards.forEach(card => {
    card.classList.add('transition-all', 'duration-200');
    card.addEventListener('mouseenter', () => {
      card.classList.add('border-indigo-300', 'shadow-md');
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('border-indigo-300', 'shadow-md');
    });
  });

  // Initialize on page load
  loadSavedProfile();
});
