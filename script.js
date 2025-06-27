 // Variable pour suivre l'état du SEA
    let seaActive = false;
    let currentPocketIndex = -1;

// Format date as DD/MM/YYYY
function formatDateDisplay(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Calculate remaining months until the given date
function monthsUntil(dateStr) {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  const today = new Date();
  let months = (target.getFullYear() - today.getFullYear()) * 12 +
               (target.getMonth() - today.getMonth());
  if (target.getDate() > today.getDate()) {
    months += 1;
  }
  return months < 0 ? 0 : months;
}

function updateTotals() {
  const pockets = JSON.parse(localStorage.getItem('pockets') || '[]');
  const totalSaved = pockets.reduce((sum, p) => sum + (p.saved || 0), 0);
  const totalGoals = pockets.reduce((sum, p) => sum + (p.goal || 0), 0);
  const totalMonthly = pockets.reduce((sum, p) => sum + (p.monthly || 0), 0);
  const savedEl = document.getElementById('totalSavedAmount');
  const goalsEl = document.getElementById('totalGoalsAmount');
  const monthlyEl = document.getElementById('totalMonthlyAmount');
  if (savedEl) savedEl.textContent = `${totalSaved}€`;
  if (goalsEl) goalsEl.textContent = `sur ${totalGoals}€ d'objectifs`;
  if (monthlyEl) monthlyEl.textContent = `${totalMonthly}€/mois`;
}

    // Navigation entre les pages
function showPage(evt, pageId) {
  // Masquer toutes les pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Désactiver tous les onglets
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Afficher la page sélectionnée
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
  }

  // Activer l'onglet correspondant
  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add('active');
  }
}

// Soumission du formulaire SEA (si présent)
const seaForm = document.getElementById('seaForm');
if (seaForm) {
  seaForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    // Simulation de sauvegarde
    alert('SEA sauvegardé avec succès !');

    // Retourner à l'accueil
    showPage(null, 'accueil');

    // Réactiver l'onglet accueil
    document.querySelector('.nav-tab').classList.add('active');
  });
}

    // Fonctions pour la modal de désactivation
    function showDeactivateModal() {
      const modal = document.getElementById('deactivateModal');
      if (!modal) return;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Empêcher le scroll
    }

    function closeDeactivateModal() {
      const modal = document.getElementById('deactivateModal');
      if (!modal) return;
      modal.classList.remove('active');
      document.body.style.overflow = ''; // Rétablir le scroll
    }

 function confirmDeactivateSEA() {
  seaActive = false;
  updateSeaStatus();
  closeDeactivateModal();
  alert('SEA désactivé avec succès !');
}

    // Fonction pour mettre à jour l'affichage du statut SEA
      function updateSeaStatus() {
        const statusCard = document.getElementById('seaStatusCard');
        const statusIcon = document.getElementById('seaStatusIcon');
        const statusTitle = document.getElementById('seaStatusTitle');
        const statusText = document.getElementById('seaStatusText');
        const toggleBtn = document.getElementById('toggleSeaBtn');
        if (!statusCard || !statusIcon || !statusTitle || !statusText || !toggleBtn) {
          return;
        }

      if (seaActive) {
        // SEA actif
        statusCard.style.background = '#f0fdf4';
        statusCard.style.borderColor = '#bbf7d0';
        statusIcon.style.color = '#16a34a';
        statusIcon.textContent = '✅';
        statusTitle.style.color = '#166534';
        statusTitle.textContent = 'SEA Actif';
        statusText.style.color = '#15803d';
        statusText.textContent = 'Votre épargne automatisée fonctionne parfaitement';
        toggleBtn.className = 'btn btn-danger';
        toggleBtn.innerHTML = '❌ Désactiver';
        toggleBtn.onclick = showDeactivateModal;
      } else {
        // SEA inactif
        statusCard.style.background = '#fef2f2';
        statusCard.style.borderColor = '#fecaca';
        statusIcon.style.color = '#dc2626';
        statusIcon.textContent = '❌';
        statusTitle.style.color = '#991b1b';
        statusTitle.textContent = 'SEA Inactif';
        statusText.style.color = '#dc2626';
        statusText.textContent = 'Votre épargne automatisée est suspendue';
        toggleBtn.className = 'btn btn-primary';
        toggleBtn.innerHTML = '✅ Réactiver';
        toggleBtn.onclick = reactivateSEA;
      }
    }

    // Fonction pour réactiver le SEA
 function reactivateSEA() {
      seaActive = true;
      updateSeaStatus();
      alert('SEA réactivé avec succès !');
    }

    // Afficher les poches d'épargne depuis localStorage
function displayPockets() {
      const container = document.getElementById('pocketsContainer');
      if (!container) return;
      container.innerHTML = '';
      const pockets = JSON.parse(localStorage.getItem('pockets') || '[]');

        pockets.forEach((pocket, index) => {
          const card = document.createElement('div');
          card.className = 'card pocket-card';
          card.addEventListener('click', () => showPocketDetail(index));

        const title = document.createElement('h5');
        title.className = 'pocket-title';
        title.textContent = pocket.name;

        const monthly = document.createElement('p');
        monthly.textContent = `${pocket.monthly}€/mois`;

        const progressWrapper = document.createElement('div');
        progressWrapper.className = 'progress-wrapper';
        const progress = document.createElement('div');
        progress.className = 'progress';
        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        const percent = pocket.goal ? Math.min(100, (pocket.saved / pocket.goal) * 100) : 0;
        bar.style.width = percent + '%';
        progress.appendChild(bar);
        const percentLabel = document.createElement('span');
        percentLabel.className = 'progress-percent';
        percentLabel.textContent = percent.toFixed(0) + '%';
        progressWrapper.appendChild(progress);
        progressWrapper.appendChild(percentLabel);

        const amountsRow = document.createElement('div');
        amountsRow.className = 'amounts-row';

        const savedCol = document.createElement('div');
        const savedLabel = document.createElement('p');
        savedLabel.textContent = 'Épargné';
        const savedAmount = document.createElement('p');
        savedAmount.className = 'saved-amount';
        savedAmount.textContent = `${pocket.saved}€`;
        savedCol.appendChild(savedLabel);
        savedCol.appendChild(savedAmount);

        const goalCol = document.createElement('div');
        const goalLabel = document.createElement('p');
        goalLabel.textContent = 'Objectif';
        const goalAmount = document.createElement('p');
        goalAmount.className = 'goal-amount';
        goalAmount.textContent = `${pocket.goal}€`;
        goalCol.appendChild(goalLabel);
        goalCol.appendChild(goalAmount);

        amountsRow.appendChild(savedCol);
        amountsRow.appendChild(goalCol);

        const deadline = document.createElement('p');
        deadline.className = 'deadline';
        deadline.textContent = `Échéance : ${formatDateDisplay(pocket.deadline)}`;

        card.appendChild(title);
        card.appendChild(monthly);
        card.appendChild(progressWrapper);
        card.appendChild(amountsRow);
        card.appendChild(deadline);

      container.appendChild(card);
    });

  updateTotals();
}

function showPocketDetail(index) {
  const pockets = JSON.parse(localStorage.getItem('pockets') || '[]');
  const pocket = pockets[index];
  if (!pocket) return;
  currentPocketIndex = index;
  document.getElementById('detailName').textContent = pocket.name;
  document.getElementById('detailSaved').textContent = pocket.saved + '€';
  document.getElementById('detailGoal').textContent = pocket.goal + '€';
  const remaining = Math.max(0, (pocket.goal || 0) - (pocket.saved || 0));
  document.getElementById('detailRemaining').textContent = remaining > 0 ? `${remaining}€ restants` : 'Objectif atteint';
  document.getElementById('detailDeadline').textContent = formatDateDisplay(pocket.deadline);
  const monthsLeft = monthsUntil(pocket.deadline);
  document.getElementById('detailMonthsLeft').textContent = monthsLeft > 0 ? `${monthsLeft} mois restants` : 'Échéance atteinte';
  const percent = pocket.goal ? Math.min(100, (pocket.saved / pocket.goal) * 100) : 0;
  document.getElementById('detailProgressBar').style.width = percent + '%';
  document.getElementById('detailProgressPercent').textContent = percent.toFixed(0) + '%';
  document.getElementById('detailFrom').textContent = pocket.from || '-';
  document.getElementById('detailTo').textContent = pocket.to || '-';
  showPage(null, 'pocketDetail');
}

function renderPockets() {
  const container = document.getElementById('pocketsConfigContainer');
  if (!container) return;
  container.innerHTML = '';
  const pockets = JSON.parse(localStorage.getItem('pockets') || '[]');

  pockets.forEach((pocket, index) => {
    const card = document.createElement('div');
    card.className = 'card pocket-card';

    const title = document.createElement('h5');
    title.className = 'pocket-title';
    title.textContent = pocket.name;

    const monthly = document.createElement('p');
    monthly.textContent = `${pocket.monthly}€/mois`;

    const progressWrapper = document.createElement('div');
    progressWrapper.className = 'progress-wrapper';
    const progress = document.createElement('div');
    progress.className = 'progress';
    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    const percent = pocket.goal ? Math.min(100, (pocket.saved / pocket.goal) * 100) : 0;
    bar.style.width = percent + '%';
    progress.appendChild(bar);
    const percentLabel = document.createElement('span');
    percentLabel.className = 'progress-percent';
    percentLabel.textContent = percent.toFixed(0) + '%';
    progressWrapper.appendChild(progress);
    progressWrapper.appendChild(percentLabel);

    const amountsRow = document.createElement('div');
    amountsRow.className = 'amounts-row';

    const savedCol = document.createElement('div');
    const savedLabel = document.createElement('p');
    savedLabel.textContent = 'Épargné';
    const savedAmount = document.createElement('p');
    savedAmount.className = 'saved-amount';
    savedAmount.textContent = `${pocket.saved}€`;
    savedCol.appendChild(savedLabel);
    savedCol.appendChild(savedAmount);

    const goalCol = document.createElement('div');
    const goalLabel = document.createElement('p');
    goalLabel.textContent = 'Objectif';
    const goalAmount = document.createElement('p');
    goalAmount.className = 'goal-amount';
    goalAmount.textContent = `${pocket.goal}€`;
    goalCol.appendChild(goalLabel);
    goalCol.appendChild(goalAmount);

    amountsRow.appendChild(savedCol);
    amountsRow.appendChild(goalCol);

    const deadline = document.createElement('p');
    deadline.className = 'deadline';
    deadline.textContent = `Échéance : ${formatDateDisplay(pocket.deadline)}`;

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '0.5rem';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary btn-sm';
    editBtn.textContent = '✏️';
    editBtn.onclick = () => openPocketForm(index);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.textContent = '🗑️';
    deleteBtn.onclick = () => deletePocket(index);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(title);
    card.appendChild(monthly);
    card.appendChild(progressWrapper);
    card.appendChild(amountsRow);
    card.appendChild(deadline);
    card.appendChild(actions);

    container.appendChild(card);
  });
}

function openPocketForm(index = -1) {
  const form = document.getElementById('pocketForm');
  form.dataset.index = index;
  form.reset();

  // Stocker la page de retour apres sauvegarde
  const detailActive = document.getElementById('pocketDetail')?.classList.contains('active');
  form.dataset.returnTo = detailActive ? 'detail' : 'home';

  if (index > -1) {
    const pockets = JSON.parse(localStorage.getItem('pockets') || '[]');
    const p = pockets[index];
    if (p) {
      document.getElementById('pocketName').value = p.name || '';
      document.getElementById('pocketGoal').value = p.goal || '';
      document.getElementById('pocketMonthly').value = p.monthly || '';
      document.getElementById('pocketFrom').value = p.from || '';
      document.getElementById('pocketTo').value = p.to || '';
      document.getElementById('pocketDeadline').value = p.deadline || '';
    }
  }

  document.getElementById('pocketModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePocketForm() {
  document.getElementById('pocketModal').classList.remove('active');
  document.body.style.overflow = '';
}

function savePocket(e) {
  e.preventDefault();
  const pockets = JSON.parse(localStorage.getItem('pockets') || '[]');
  const index = parseInt(e.target.dataset.index, 10);

  const returnTo = e.target.dataset.returnTo || 'home';

  const data = {
    name: document.getElementById('pocketName').value.trim(),
    goal: parseFloat(document.getElementById('pocketGoal').value) || 0,
    monthly: parseFloat(document.getElementById('pocketMonthly').value) || 0,
    from: document.getElementById('pocketFrom').value,
    to: document.getElementById('pocketTo').value,
    deadline: document.getElementById('pocketDeadline').value,
  };

  if (index >= 0 && pockets[index]) {
    data.saved = pockets[index].saved || 0;
    pockets[index] = { ...pockets[index], ...data };
  } else {
    data.saved = 0;
    pockets.push(data);
  }

  localStorage.setItem('pockets', JSON.stringify(pockets));
  closePocketForm();
  displayPockets();
  renderPockets();
  if (returnTo === 'detail' && index >= 0) {
    showPocketDetail(index);
  } else {
    showPage(null, 'accueil');
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector('.nav-tab').classList.add('active');
  }
}

function deletePocket(index) {
  if (!confirm('Supprimer cette poche ?')) return;
  const pockets = JSON.parse(localStorage.getItem('pockets') || '[]');
  pockets.splice(index, 1);
  localStorage.setItem('pockets', JSON.stringify(pockets));
  displayPockets();
  renderPockets();
  if (document.getElementById('pocketDetail') &&
      document.getElementById('pocketDetail').classList.contains('active')) {
    showPage(null, 'accueil');
  }
}

// Calcul automatique du montant mensuel
function calculateMonthly() {
  const goal = parseFloat(document.getElementById('pocketGoal').value) || 0;
  const deadlineStr = document.getElementById('pocketDeadline').value;

  if (!goal || !deadlineStr) {
    alert("Veuillez d'abord saisir un objectif et une échéance");
    return;
  }

  const deadline = new Date(deadlineStr);
  const today = new Date();

  let months =
    (deadline.getFullYear() - today.getFullYear()) * 12 +
    (deadline.getMonth() - today.getMonth()) +
    1;

  if (months <= 0) {
    months = 1;
  }

  const monthly = Math.ceil(goal / months);
  document.getElementById('pocketMonthly').value = monthly;
}

// Remplir automatiquement le nom de la poche
function setPocketName(name) {
  document.getElementById('pocketName').value = name;
}

    // Fermer la modal en cliquant en dehors
      const deactivateModalEl = document.getElementById('deactivateModal');
      if (deactivateModalEl) {
        deactivateModalEl.addEventListener('click', function(e) {
          if (e.target === this) {
            closeDeactivateModal();
          }
        });
      }

    // Fonctions pour les paramètres
function resetSEA() {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser votre SEA ?')) {
    // Nettoyer le stockage local
    localStorage.removeItem('pockets');
    localStorage.removeItem('pocketDates');
    localStorage.removeItem('history');

    // Remise à zéro des paramètres du SEA
    seaActive = false;

    const montant = document.getElementById('montant');
    const jour = document.getElementById('jour');
    const depart = document.getElementById('compteDepart');
    const destination = document.getElementById('destination');

    if (montant) montant.value = 200;
    if (jour) jour.selectedIndex = 0;
    if (depart) depart.selectedIndex = 0;
    if (destination) destination.selectedIndex = 0;

    updateSeaStatus();

    // Rafraîchir l'affichage
    if (typeof renderPockets === 'function') {
      renderPockets();
    }
    if (typeof renderHistory === 'function') {
      renderHistory();
    }
    if (typeof displayPockets === 'function') {
      displayPockets();
    }

    alert('SEA réinitialisé !');

      // Retourner à la page d'accueil
      showPage(null, 'accueil');
      document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.nav-tab')[0].classList.add('active');
  }
}

    // Gestion de l'édition des informations utilisateur
    let originalUserData = {};
    let isEditingUser = false;

    function toggleUserEdit() {
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const editBtn = document.getElementById('editUserBtn');
      const formActions = document.getElementById('userFormActions');

      if (!isEditingUser) {
        // Sauvegarder les valeurs originales
        originalUserData = {
          name: nameInput.value,
          email: emailInput.value
        };

        // Activer l'édition
        nameInput.disabled = false;
        emailInput.disabled = false;
        nameInput.focus();
        
        // Changer le bouton
        editBtn.innerHTML = '❌ Annuler';
        editBtn.classList.remove('btn-secondary');
        editBtn.classList.add('btn-primary');
        
        // Afficher les boutons d'action
        formActions.style.display = 'flex';
        
        isEditingUser = true;
      } else {
        cancelUserEdit();
      }
    }

    function cancelUserEdit() {
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const editBtn = document.getElementById('editUserBtn');
      const formActions = document.getElementById('userFormActions');

      // Restaurer les valeurs originales
      nameInput.value = originalUserData.name;
      emailInput.value = originalUserData.email;

      // Désactiver l'édition
      nameInput.disabled = true;
      emailInput.disabled = true;
      
      // Restaurer le bouton
      editBtn.innerHTML = '✏️ Modifier';
      editBtn.classList.remove('btn-primary');
      editBtn.classList.add('btn-secondary');
      
      // Masquer les boutons d'action
      formActions.style.display = 'none';
      
      isEditingUser = false;
    }

    function saveUserInfo() {
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const editBtn = document.getElementById('editUserBtn');
      const formActions = document.getElementById('userFormActions');

      // Validation simple
      if (!nameInput.value.trim()) {
        alert('Le nom ne peut pas être vide');
        nameInput.focus();
        return;
      }

      if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
        alert('Veuillez entrer une adresse email valide');
        emailInput.focus();
        return;
      }

      // Simulation de sauvegarde
      alert('Informations mises à jour avec succès !');

      // Désactiver l'édition
      nameInput.disabled = true;
      emailInput.disabled = true;
      
      // Restaurer le bouton
      editBtn.innerHTML = '✏️ Modifier';
      editBtn.classList.remove('btn-primary');
      editBtn.classList.add('btn-secondary');
      
      // Masquer les boutons d'action
      formActions.style.display = 'none';
      
      isEditingUser = false;

      // Ici vous pourriez ajouter la logique pour envoyer les données au serveur
      console.log('Nouvelles données utilisateur:', {
        name: nameInput.value,
        email: emailInput.value
      });
    }

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Gestion de la connexion simple
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  document.getElementById('loginPage').style.display = 'none';
  document.querySelector('header').style.display = '';
  document.querySelector('nav.nav-tabs').style.display = '';
  document.querySelector('.content').style.display = '';

  showPage(null, 'accueil');
  document.querySelector('.nav-tab').classList.add('active');
});

// Changement vers la page d'inscription
document.getElementById('showRegisterLink').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('registerPage').style.display = '';
});

// Retour à la page de connexion
document.getElementById('showLoginLink').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('registerPage').style.display = 'none';
  document.getElementById('loginPage').style.display = '';
});

// Gestion simple de l'inscription
document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault();
  alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
  document.getElementById('registerPage').style.display = 'none';
  document.getElementById('loginPage').style.display = '';
});

    // Animation d'entrée
document.addEventListener('DOMContentLoaded', function() {
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.3s';
    document.body.style.opacity = '1';
  }, 100);

  // Initialiser l'état du SEA lors du chargement
  updateSeaStatus();
  displayPockets();
  renderPockets();

  const addBtn = document.getElementById('addPocketBtn');
  const form = document.getElementById('pocketForm');
  if (addBtn) {
    addBtn.addEventListener('click', () => openPocketForm());
  }
  if (form) {
    form.addEventListener('submit', savePocket);
  }

  const homeAddPocketBtn = document.getElementById('homeAddPocketBtn');
  if (homeAddPocketBtn) {
    homeAddPocketBtn.addEventListener('click', () => openPocketForm());
  }

  const refreshAccountsBtn = document.getElementById('refreshAccountsBtn');
  if (refreshAccountsBtn) {
    refreshAccountsBtn.addEventListener('click', updateBankAccounts);
  }

  const editDetailBtn = document.getElementById('detailEditBtn');
  const deleteDetailBtn = document.getElementById('detailDeleteBtn');
  const backDetailBtn = document.getElementById('detailBackBtn');
  if (editDetailBtn) {
    editDetailBtn.addEventListener('click', () => openPocketForm(currentPocketIndex));
  }
  if (deleteDetailBtn) {
    deleteDetailBtn.addEventListener('click', () => deletePocket(currentPocketIndex));
  }
  if (backDetailBtn) {
    backDetailBtn.addEventListener('click', () => showPage(null, 'accueil'));
  }

  const modal = document.getElementById('pocketModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closePocketForm();
      }
    });
  }
});

// Fonctions utilitaires par défaut si absentes
function renderHistory() {}

// Stub for refreshing bank accounts
function updateBankAccounts() {
  alert('Mise à jour des comptes bancaires...');
}

// Exposer les fonctions globalement pour les gestionnaires inline
window.showPage = showPage;
window.showDeactivateModal = showDeactivateModal;
window.closeDeactivateModal = closeDeactivateModal;
window.confirmDeactivateSEA = confirmDeactivateSEA;
window.reactivateSEA = reactivateSEA;
window.resetSEA = resetSEA;
window.logout = logout;
window.toggleUserEdit = toggleUserEdit;
window.cancelUserEdit = cancelUserEdit;
window.saveUserInfo = saveUserInfo;
window.openPocketForm = openPocketForm;
window.closePocketForm = closePocketForm;
window.savePocket = savePocket;
window.deletePocket = deletePocket;
window.calculateMonthly = calculateMonthly;
window.setPocketName = setPocketName;
window.showPocketDetail = showPocketDetail;
window.updateBankAccounts = updateBankAccounts;