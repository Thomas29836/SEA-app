 // Variable pour suivre l'état du SEA
let seaActive = false;
let currentPocketIndex = -1;
let userId = null;
let pockets = [];
let accounts = [];
const accountColors = [
  '#f87171',
  '#fb923c',
  '#facc15',
  '#4ade80',
  '#2dd4bf',
  '#60a5fa',
  '#818cf8',
  '#a78bfa',
  '#f472b6',
  '#94a3b8'
];

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

// Format numbers with comma as thousands separator
function formatNumber(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US');
}

async function loadPockets() {
  const { data, error } = await supabase
    .from('pockets')
    .select('*')
    .eq('user_id', userId)
    .order('id');
  pockets = error ? [] : data || [];
}

async function loadAccounts() {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('id');
  accounts = error ? [] : data || [];
}

async function initData() {
  await Promise.all([loadPockets(), loadAccounts()]);
  updateTotals();
  displayPockets();
  renderPockets();
  populateAccountSelects();
  populateHistoryPocketFilter();
  renderHomeHistory();
}

function updateTotals() {
  const totalSaved = pockets.reduce((sum, p) => sum + (p.saved || 0), 0);
  const totalGoals = pockets.reduce((sum, p) => sum + (p.goal || 0), 0);
  const totalMonthly = pockets
    .filter(p => !(p.goal && p.saved >= p.goal))
    .reduce((sum, p) => sum + (p.monthly || 0), 0);
  const savedEl = document.getElementById('totalSavedAmount');
  const goalsEl = document.getElementById('totalGoalsAmount');
  const monthlyEl = document.getElementById('totalMonthlyAmount');
  const progressEl = document.getElementById('overallProgressPercent');
  const progressBarEl = document.getElementById('overallProgressBar');
  if (savedEl) savedEl.textContent = `${formatNumber(totalSaved)}€`;
  if (goalsEl) goalsEl.textContent = `sur ${formatNumber(totalGoals)}€ d'objectifs`;
  if (monthlyEl) monthlyEl.textContent = `${formatNumber(totalMonthly)}€/mois`;
  const percent = totalGoals ? Math.min(100, (totalSaved / totalGoals) * 100) : 0;
  if (progressEl) progressEl.textContent = percent.toFixed(0) + '%';
  if (progressBarEl) progressBarEl.style.width = percent + '%';
}

// Check if a pocket reached its goal and adjust global monthly budget
function checkGoalCompletion(index) {
  const pocket = pockets[index];
  if (!pocket || !pocket.goal) return;
  if (pocket.saved >= pocket.goal && pocket.monthly > 0) {
    const removed = pocket.monthly;
    // Update pocket monthly amount in Supabase
    supabase.from('pockets').update({ monthly: 0 }).eq('id', pocket.id);
    pocket.monthly = 0;
    const totalRemaining = pockets.reduce((sum, p) => sum + (p.monthly || 0), 0);
    alert(
      `La poche "${pocket.name}" a atteint son objectif de ${formatNumber(pocket.goal)}€.` +
      `\nMontant mensuel retiré : ${formatNumber(removed)}€.` +
      `\nBudget mensuel restant : ${formatNumber(totalRemaining)}€.`
    );
  }
}

// Offer to update monthly amount after a change in savings
async function promptMonthlyUpdate(index) {
  const pocket = pockets[index];
  if (!pocket || !pocket.goal || !pocket.deadline) return;
  const remaining = Math.max(0, (pocket.goal || 0) - (pocket.saved || 0));
  const months = monthsUntil(pocket.deadline) || 1;
  if (remaining <= 0 || months <= 0) return;
  const newMonthly = Math.ceil(remaining / months);
  if (newMonthly === pocket.monthly) return;
  if (confirm(`Mettre à jour le montant mensuel à ${formatNumber(newMonthly)}€ ?`)) {
    const { error } = await supabase
      .from('pockets')
      .update({ monthly: newMonthly })
      .eq('id', pocket.id);
    if (!error) {
      pocket.monthly = newMonthly;
      showPocketDetail(index);
      displayPockets();
      renderPockets();
      updateTotals();
    } else {
      alert("Erreur lors de la mise à jour du montant mensuel");
    }
  }
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

    // Réactiver l'onglet accueil␊
    document.querySelector('.nav-tab')?.classList.add('active');
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

    // Afficher les poches d'épargne depuis Supabase
function displayPockets() {
      const container = document.getElementById('pocketsContainer');
      if (!container) return;
      container.innerHTML = '';

        pockets.forEach((pocket, index) => {
          const card = document.createElement('div');
          card.className = 'card pocket-card';
          card.addEventListener('click', () => showPocketDetail(index));

        const title = document.createElement('h5');
        title.className = 'pocket-title';
        title.textContent = pocket.name;

        const monthly = document.createElement('p');
        monthly.textContent = `${formatNumber(pocket.monthly)}€/mois`;

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
        savedAmount.textContent = `${formatNumber(pocket.saved)}€`;
        savedCol.appendChild(savedLabel);
        savedCol.appendChild(savedAmount);

        const goalCol = document.createElement('div');
        const goalLabel = document.createElement('p');
        goalLabel.textContent = 'Objectif';
        const goalAmount = document.createElement('p');
        goalAmount.className = 'goal-amount';
        goalAmount.textContent = `${formatNumber(pocket.goal)}€`;
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
  populateHistoryPocketFilter();
  renderHomeHistory();
}

function showPocketDetail(index) {
  const pocket = pockets[index];
  if (!pocket) return;
  currentPocketIndex = index;
  document.getElementById('detailName').textContent = pocket.name;
  document.getElementById('detailMonthly').textContent = `${formatNumber(pocket.monthly)}€/mois`;
  document.getElementById('detailSaved').textContent = formatNumber(pocket.saved) + '€';
  document.getElementById('detailGoal').textContent = formatNumber(pocket.goal) + '€';
  const remaining = Math.max(0, (pocket.goal || 0) - (pocket.saved || 0));
  document.getElementById('detailRemaining').textContent = remaining > 0 ? `${formatNumber(remaining)}€ restants` : 'Objectif atteint';
  document.getElementById('detailDeadline').textContent = formatDateDisplay(pocket.deadline);
  const monthsLeft = monthsUntil(pocket.deadline);
  document.getElementById('detailMonthsLeft').textContent = monthsLeft > 0 ? `${monthsLeft} mois restants` : 'Échéance atteinte';
  const percent = pocket.goal ? Math.min(100, (pocket.saved / pocket.goal) * 100) : 0;
  document.getElementById('detailProgressBar').style.width = percent + '%';
  document.getElementById('detailProgressPercent').textContent = percent.toFixed(0) + '%';
  document.getElementById('detailFrom').textContent = pocket.from || '-';
  document.getElementById('detailTo').textContent = pocket.to || '-';
  showPage(null, 'pocketDetail');
  renderHistory(index, 1);
}

function renderPockets() {
  const container = document.getElementById('pocketsConfigContainer');
  if (!container) return;
  container.innerHTML = '';

  pockets.forEach((pocket, index) => {
    const card = document.createElement('div');
    card.className = 'card pocket-card';

    const title = document.createElement('h5');
    title.className = 'pocket-title';
    title.textContent = pocket.name;

    const monthly = document.createElement('p');
    monthly.textContent = `${formatNumber(pocket.monthly)}€/mois`;

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
    savedAmount.textContent = `${formatNumber(pocket.saved)}€`;
    savedCol.appendChild(savedLabel);
    savedCol.appendChild(savedAmount);

    const goalCol = document.createElement('div');
    const goalLabel = document.createElement('p');
    goalLabel.textContent = 'Objectif';
    const goalAmount = document.createElement('p');
    goalAmount.className = 'goal-amount';
    goalAmount.textContent = `${formatNumber(pocket.goal)}€`;
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

  populateAccountSelects();

  // Stocker la page de retour apres sauvegarde
  const detailActive = document.getElementById('pocketDetail')?.classList.contains('active');
  form.dataset.returnTo = detailActive ? 'detail' : 'home';

  if (index > -1) {
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

async function savePocket(e) {
  e.preventDefault();
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
    const { error } = await supabase
      .from('pockets')
      .update({ ...data })
      .eq('id', pockets[index].id);
    if (error) {
      alert("Erreur lors de l'enregistrement de la poche");
      console.error('Supabase error', error);
      return;
    }
    pockets[index] = { ...pockets[index], ...data };
  } else {
    data.saved = 0;
    const { data: created, error } = await supabase
      .from('pockets')
      .insert([{ ...data, user_id: userId, history: [] }])
      .select()
      .single();
    if (error) {
      alert("Erreur lors de la création de la poche");
      console.error('Supabase error', error);
      return;
    }
    if (created) pockets.push(created);
  }

  closePocketForm();
  displayPockets();
  renderPockets();
  populateHistoryPocketFilter();
  renderHomeHistory();
  if (returnTo === 'detail' && index >= 0) {
    showPocketDetail(index);
  } else {
    showPage(null, 'accueil');
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    tabs[0]?.classList.add('active');
  }
}

async function deletePocket(index) {
  if (!confirm('Supprimer cette poche ?')) return;
  const pocket = pockets[index];
  if (!pocket) return;
  const { error } = await supabase.from('pockets').delete().eq('id', pocket.id);
  if (error) {
    alert("Erreur lors de la suppression de la poche");
    console.error('Supabase error', error);
    return;
  }
  pockets.splice(index, 1);
  displayPockets();
  renderPockets();
  populateHistoryPocketFilter();
  renderHomeHistory();
  if (document.getElementById('pocketDetail') &&
      document.getElementById('pocketDetail').classList.contains('active')) {
    showPage(null, 'accueil');
  }
}

async function addMoney(index, amount = null, description = null, date = null) {
  if (amount === null) {
    amount = parseFloat(prompt('Montant à ajouter :'));
  }
  if (isNaN(amount) || amount <= 0) return;
  if (description === null) {
    description = prompt('Description', 'épargne automatique') || '';
  }
  const pocket = pockets[index];
  if (!pocket) return;
  const newSaved = (pocket.saved || 0) + amount;
  const history = pocket.history || [];
  const txDate = date ? new Date(date).toISOString() : new Date().toISOString();
  history.unshift({
    type: 'deposit',
    amount,
    date: txDate,
    description
  });
  const { error, data: updated } = await supabase
    .from('pockets')
    .update({ saved: newSaved, history })
    .eq('id', pocket.id)
    .select()
    .single();
  if (!error && updated) pockets[index] = updated;
  showPocketDetail(index);
  displayPockets();
  renderPockets();
  checkGoalCompletion(index);
  updateTotals();
  renderHomeHistory();
  await promptMonthlyUpdate(index);
}

async function withdrawMoney(index, amount = null, description = null, date = null) {
  if (amount === null) {
    amount = parseFloat(prompt('Montant à retirer :'));
  }
  if (isNaN(amount) || amount <= 0) return;
  if (description === null) {
    description = prompt('Description (optionnel)') || '';
  }
  const pocket = pockets[index];
  if (!pocket) return;
  const newSaved = Math.max(0, (pocket.saved || 0) - amount);
  const history = pocket.history || [];
  const txDate = date ? new Date(date).toISOString() : new Date().toISOString();
  history.unshift({
    type: 'withdraw',
    amount,
    date: txDate,
    description
  });
  const { error, data: updated } = await supabase
    .from('pockets')
    .update({ saved: newSaved, history })
    .eq('id', pocket.id)
    .select()
    .single();
  if (!error && updated) pockets[index] = updated;
  showPocketDetail(index);
  displayPockets();
  renderPockets();
  updateTotals();
  renderHomeHistory();
  await promptMonthlyUpdate(index);
}


function openMoneyForm(type) {
  const modal = document.getElementById('moneyModal');
  const form = document.getElementById('moneyForm');
  const remainingEl = document.getElementById('moneyRemaining');
  if (!modal || !form) return;
  form.dataset.type = type;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  document.getElementById('moneyModalTitle').textContent =
    type === 'deposit' ? "Ajouter de l'argent" : "Retirer de l'argent";
  form.reset();
  const dateInput = document.getElementById('moneyDate');
  if (dateInput) {
    dateInput.value = new Date().toISOString().substring(0, 10);
  }
  if (remainingEl) {
    if (type === 'deposit') {
      const pocket = pockets[currentPocketIndex];
      if (pocket && pocket.goal) {
        const remaining = Math.max(0, pocket.goal - (pocket.saved || 0));
        remainingEl.textContent =
          remaining <= 0
            ? 'Objectif déjà atteint'
            : `Il reste ${formatNumber(remaining)}€ avant d\'atteindre l\'objectif`;
        remainingEl.style.display = 'block';
      } else {
        remainingEl.textContent = '';
        remainingEl.style.display = 'none';
      }
    } else {
      remainingEl.textContent = '';
      remainingEl.style.display = 'none';
    }
  }
}

function closeMoneyForm() {
  const modal = document.getElementById('moneyModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function submitMoneyForm(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('moneyAmount').value);
  if (isNaN(amount) || amount <= 0) return;
  const desc = document.getElementById('moneyDescription').value.trim();
  const dateStr = document.getElementById('moneyDate').value;
  const type = e.target.dataset.type;
  const date = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();
    if (type === 'withdraw') {
      withdrawMoney(currentPocketIndex, amount, desc, date);
    } else {
      addMoney(currentPocketIndex, amount, desc, date);
    }
    closeMoneyForm();
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
async function resetSEA() {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser votre SEA ?')) {
    // Supprimer les données de l'utilisateur dans Supabase
    const { error: pocketError } = await supabase.from('pockets').delete().eq('user_id', userId);
    const { error: accountError } = await supabase.from('accounts').delete().eq('user_id', userId);
    if (pocketError || accountError) {
      alert('Erreur lors de la réinitialisation du SEA');
      console.error('Supabase error', pocketError || accountError);
      return;
    }
    pockets = [];
    accounts = [];

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
    populateHistoryPocketFilter();
    renderHomeHistory();

    alert('SEA réinitialisé !');

      // Retourner à la page d'accueil
      showPage(null, 'accueil');
      const tabs = document.querySelectorAll('.nav-tab');
      tabs.forEach(tab => tab.classList.remove('active'));
      tabs[0]?.classList.add('active');
  }
}

// Déconnexion de l'utilisateur
async function logout() {
  await supabase.auth.signOut();
  userId = null;
  pockets = [];
  accounts = [];

  // Masquer les sections réservées aux utilisateurs connectés
  const navTabs = document.querySelector('.nav-tabs');
  const content = document.querySelector('.content');
  if (navTabs) navTabs.style.display = 'none';
  if (content) content.style.display = 'none';

  // Afficher l'écran de connexion
  const loginPage = document.getElementById('loginPage');
  const registerPage = document.getElementById('registerPage');
  if (loginPage) loginPage.style.display = '';
  if (registerPage) registerPage.style.display = 'none';

  // Réinitialiser l'onglet actif
  document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
  showPage(null, 'accueil');

  alert('Vous avez été déconnecté avec succès');
}

    // Gestion de l'édition des informations utilisateur
    let originalUserData = {};
    let isEditingUser = false;

    function setUserInfoFields(user) {
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      if (!nameInput || !emailInput || !user) return;
      nameInput.value = user.user_metadata?.name || '';
      emailInput.value = user.email || '';
      originalUserData = { name: nameInput.value, email: emailInput.value };
    }

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
        editBtn.style.display = 'none';
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
editBtn.style.display = '';
      
      // Masquer les boutons d'action
      formActions.style.display = 'none';
      
      isEditingUser = false;
    }

    async function saveUserInfo() {
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

      // Mise à jour des informations dans Supabase
      const { error, data: updatedUser } = await supabase.auth.updateUser({
        email: emailInput.value,
        data: { name: nameInput.value }
      });

      if (error) {
        alert("Erreur lors de la mise à jour : " + error.message);
        return;
      }

      alert('Informations mises à jour avec succès !');

      // Désactiver l\'édition
      nameInput.disabled = true;
      emailInput.disabled = true;

      // Restaurer le bouton
      editBtn.innerHTML = '✏️ Modifier';
      editBtn.classList.remove('btn-primary');
      editBtn.classList.add('btn-secondary');
      editBtn.style.display = '';

      // Masquer les boutons d\'action
      formActions.style.display = 'none';

      isEditingUser = false;

      // Mettre à jour les valeurs originales
      originalUserData = {
        name: updatedUser.user.user_metadata?.name || nameInput.value,
        email: updatedUser.user.email
      };
    }

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Connexion via Supabase Auth
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert('Erreur de connexion : ' + error.message);
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  userId = user.id;
  setUserInfoFields(user);
  await initData();

  document.getElementById('loginPage').style.display = 'none';
  const navTabs = document.querySelector('.nav-tabs');
  if (navTabs) navTabs.style.display = 'flex';
  document.querySelector('.content').style.display = '';

  showPage(null, 'accueil');
  document.querySelector('.nav-tab')?.classList.add('active');
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

// Inscription via Supabase Auth
document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (error) {
    alert("Erreur d'inscription : " + error.message);
    return;
  }

  // Mettre à jour les champs utilisateur si la session est immédiatement disponible
  if (data && data.user) {
    setUserInfoFields(data.user);
  }

  alert("Inscription réussie ! Vérifiez vos emails pour confirmer.");
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

  // Afficher la bonne interface selon l'état de connexion
  const navTabs = document.querySelector('.nav-tabs');
  const content = document.querySelector('.content');
  const loginPage = document.getElementById('loginPage');
  const registerPage = document.getElementById('registerPage');

  supabase.auth.getSession().then(({ data: { session } }) => {
    const logged = !!session;

    if (logged) {
      userId = session.user.id;
      setUserInfoFields(session.user);
      initData();
      if (navTabs) navTabs.style.display = 'flex';
      if (content) content.style.display = '';
      if (loginPage) loginPage.style.display = 'none';
      if (registerPage) registerPage.style.display = 'none';
      showPage(null, 'accueil');
      document.querySelector('.nav-tab')?.classList.add('active');
    } else {
      if (navTabs) navTabs.style.display = 'none';
      if (content) content.style.display = 'none';
      if (loginPage) loginPage.style.display = '';
      if (registerPage) registerPage.style.display = 'none';
    }
  });

  // Initialiser l'état du SEA lors du chargement
  updateSeaStatus();

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
    refreshAccountsBtn.addEventListener('click', openBankAccountsModal);
  }

  // Mettre à jour les comptes destinataires lorsqu'on change le compte prélevé
  const fromSelectEl = document.getElementById('pocketFrom');
  if (fromSelectEl) {
    fromSelectEl.addEventListener('change', populateAccountSelects);
  }

  populateHistoryPocketFilter();
  renderHomeHistory();
  document.getElementById('historyTypeFilter')?.addEventListener('change', () => renderHomeHistory());
  document.getElementById('historyPocketFilter')?.addEventListener('change', () => renderHomeHistory());

    const editDetailBtn = document.getElementById('detailEditBtn');
    const deleteDetailBtn = document.getElementById('detailDeleteBtn');
    const backDetailBtn = document.getElementById('detailBackBtn');
    const settingsBackBtn = document.getElementById('settingsBackBtn');
    const addMoneyBtn = document.getElementById('addMoneyBtn');
    const withdrawMoneyBtn = document.getElementById('withdrawMoneyBtn');
    const moneyForm = document.getElementById('moneyForm');
    const cancelMoneyBtn = document.getElementById('cancelMoneyBtn');
    const moneyModal = document.getElementById('moneyModal');
    if (editDetailBtn) {
      editDetailBtn.addEventListener('click', () => openPocketForm(currentPocketIndex));
    }
    if (deleteDetailBtn) {
      deleteDetailBtn.addEventListener('click', () => deletePocket(currentPocketIndex));
    }
  if (backDetailBtn) {
    backDetailBtn.addEventListener('click', () => showPage(null, 'accueil'));
  }
    if (settingsBackBtn) {
      settingsBackBtn.addEventListener('click', () => {
        showPage(null, 'accueil');
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        tabs[0]?.classList.add('active');
      });
    }

    if (addMoneyBtn) {
      addMoneyBtn.addEventListener('click', () => openMoneyForm('deposit'));
    }
    if (withdrawMoneyBtn) {
      withdrawMoneyBtn.addEventListener('click', () => openMoneyForm('withdraw'));
    }
  const modal = document.getElementById('pocketModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closePocketForm();
      }
    });
  }

    if (moneyForm) moneyForm.addEventListener('submit', submitMoneyForm);
    if (cancelMoneyBtn) cancelMoneyBtn.addEventListener('click', closeMoneyForm);
    if (moneyModal) {
      moneyModal.addEventListener('click', function(e) {
        if (e.target === this) {
          closeMoneyForm();
        }
      });
    }
  const addAccountBtn = document.getElementById('addAccountBtn');
  const accountForm = document.getElementById('accountForm');
  const cancelAccountBtn = document.getElementById('cancelAccountBtn');
  const closeAccountsBtn = document.getElementById('closeAccountsBtn');
  const accountsModal = document.getElementById('accountsModal');
  if (addAccountBtn) addAccountBtn.addEventListener('click', () => openAccountForm());
  if (accountForm) accountForm.addEventListener('submit', saveAccount);
  if (cancelAccountBtn) cancelAccountBtn.addEventListener('click', closeAccountForm);
  if (closeAccountsBtn) closeAccountsBtn.addEventListener('click', closeBankAccountsModal);
  if (accountsModal) {
    accountsModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeBankAccountsModal();
      }
    });
  }
});

// Afficher l'historique des transactions pour une poche
function renderHistory(index = currentPocketIndex, page = 1) {
  const pocket = pockets[index];
  if (!pocket) return;

  const history = pocket.history || [];
  const tbody = document.querySelector('#historyTable tbody');
  const pagination = document.getElementById('historyPagination');
  if (!tbody || !pagination) return;

  const perPage = 5;
  const totalPages = Math.ceil(history.length / perPage) || 1;
  page = Math.min(Math.max(1, page), totalPages);

  tbody.innerHTML = '';
  history.slice((page - 1) * perPage, (page - 1) * perPage + perPage)
    .forEach(item => {
      const tr = document.createElement('tr');
      const typeTd = document.createElement('td');
      typeTd.textContent = item.type === 'deposit' ? 'Dépôt' : 'Retrait';
      const amountTd = document.createElement('td');
      amountTd.textContent = `${item.type === 'deposit' ? '+' : '-'}${formatNumber(item.amount)}€`;
      amountTd.className = item.type === 'deposit' ? 'tx-deposit' : 'tx-withdraw';
      const dateTd = document.createElement('td');
      dateTd.textContent = new Date(item.date).toLocaleDateString('fr-FR');
      const descTd = document.createElement('td');
      descTd.textContent = item.description || '';
      tr.appendChild(typeTd);
      tr.appendChild(amountTd);
      tr.appendChild(dateTd);
      tr.appendChild(descTd);
      tbody.appendChild(tr);
    });

  pagination.innerHTML = '';
  if (totalPages > 1) {
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      if (i === page) btn.classList.add('active');
      btn.addEventListener('click', () => renderHistory(index, i));
      pagination.appendChild(btn);
    }
  }
}

function populateHistoryPocketFilter() {
  const select = document.getElementById('historyPocketFilter');
  if (!select) return;
  select.innerHTML = '<option value="all">Toutes les poches</option>';
  pockets.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = p.name;
    select.appendChild(opt);
  });
}

function populateAccountSelects() {
  const fromSelect = document.getElementById('pocketFrom');
  const toSelect = document.getElementById('pocketTo');
  if (!fromSelect || !toSelect) return;

  const selectedFrom = fromSelect.value; // valeur actuellement choisie
  const selectedTo = toSelect.value;

  // Réinitialiser les listes
  fromSelect.innerHTML = '<option value="">--Choisissez un compte--</option>';
  toSelect.innerHTML =
    '<option value="">--Choisissez le compte destinataire--</option>';

  const categories = [
    { type: 'courant', label: 'Compte courant' },
    { type: 'epargne', label: 'Épargne' },
    { type: 'investissement', label: 'Investissement' }
  ];

  // Fonction utilitaire pour appliquer la couleur à une option
  const styleOption = (opt, color) => {
    if (color) {
      opt.style.backgroundImage = `radial-gradient(circle, ${color} 40%, transparent 41%)`;
      opt.style.backgroundPosition = '0.5rem center';
      opt.style.backgroundSize = '0.6rem 0.6rem';
      opt.style.backgroundRepeat = 'no-repeat';
      opt.style.paddingLeft = '1.2rem';
    }
  };

  // Remplir la liste des comptes à prélever
  categories.forEach(cat => {
    const group = document.createElement('optgroup');
    group.label = cat.label;
    accounts
      .filter(a => a.type === cat.type)
      .forEach(acc => {
        const opt = document.createElement('option');
        opt.value = acc.name;
        opt.textContent = acc.bank ? `${acc.name} - ${acc.bank}` : acc.name;
        styleOption(opt, acc.color);
        group.appendChild(opt);
      });
    if (group.children.length) fromSelect.appendChild(group);
  });

  // Conserver la valeur de départ si possible
  if (selectedFrom) fromSelect.value = selectedFrom;

  const exclude = fromSelect.value; // compte à exclure côté destinataire

  // Remplir la liste des comptes destinataires en excluant le compte prélevé
  categories.forEach(cat => {
    const group = document.createElement('optgroup');
    group.label = cat.label;
    accounts
      .filter(a => a.type === cat.type && a.name !== exclude)
      .forEach(acc => {
        const opt = document.createElement('option');
        opt.value = acc.name;
        opt.textContent = acc.bank ? `${acc.name} - ${acc.bank}` : acc.name;
        styleOption(opt, acc.color);
        group.appendChild(opt);
      });
    if (group.children.length) toSelect.appendChild(group);
  });

  // Restaurer la sélection du compte destinataire si elle reste valide
  if (selectedTo && selectedTo !== exclude) {
    toSelect.value = selectedTo;
  }
}

function renderHomeHistory(page = 1) {
  const typeFilter = document.getElementById('historyTypeFilter')?.value || 'all';
  const pocketFilter = document.getElementById('historyPocketFilter')?.value || 'all';

  let txs = [];
  pockets.forEach((p, index) => {
    if (pocketFilter === 'all' || pocketFilter == index) {
      (p.history || []).forEach(t => {
        if (typeFilter === 'all' || t.type === typeFilter) {
          txs.push(t);
        }
      });
    }
  });

  txs.sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalDeposits = txs.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = txs.filter(t => t.type === 'withdraw').reduce((s, t) => s + t.amount, 0);
  const net = totalDeposits - totalWithdrawals;

  const depositsEl = document.getElementById('historyDeposits');
  const withdrawalsEl = document.getElementById('historyWithdrawals');
  const netEl = document.getElementById('historyNet');
  if (depositsEl) depositsEl.textContent = `${formatNumber(totalDeposits)}€`;
  if (withdrawalsEl) withdrawalsEl.textContent = `${formatNumber(totalWithdrawals)}€`;
  if (netEl) netEl.textContent = `${formatNumber(net)}€`;

  const tbody = document.querySelector('#homeHistoryTable tbody');
  const pagination = document.getElementById('homeHistoryPagination');
  if (!tbody || !pagination) return;

  const perPage = 5;
  const totalPages = Math.ceil(txs.length / perPage) || 1;
  page = Math.min(Math.max(1, page), totalPages);

  tbody.innerHTML = '';
  txs.slice((page - 1) * perPage, (page - 1) * perPage + perPage).forEach(item => {
    const tr = document.createElement('tr');
    const typeTd = document.createElement('td');
    typeTd.textContent = item.type === 'deposit' ? 'Dépôt' : 'Retrait';
    const amountTd = document.createElement('td');
    amountTd.textContent = `${item.type === 'deposit' ? '+' : '-'}${formatNumber(item.amount)}€`;
    amountTd.className = item.type === 'deposit' ? 'tx-deposit' : 'tx-withdraw';
    const dateTd = document.createElement('td');
    dateTd.textContent = new Date(item.date).toLocaleDateString('fr-FR');
    const descTd = document.createElement('td');
    descTd.textContent = item.description || '';
    tr.appendChild(typeTd);
    tr.appendChild(amountTd);
    tr.appendChild(dateTd);
    tr.appendChild(descTd);
    tbody.appendChild(tr);
  });

  pagination.innerHTML = '';
  if (totalPages > 1) {
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      if (i === page) btn.classList.add('active');
      btn.addEventListener('click', () => renderHomeHistory(i));
      pagination.appendChild(btn);
    }
  }
}

// Stub for refreshing bank accounts
function renderAccountColors() {
  const container = document.getElementById('accountColorChoices');
  if (!container) return;
  container.innerHTML = '';
  accountColors.forEach(color => {
    const label = document.createElement('label');
    label.className = 'color-option';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'accountColor';
    input.value = color;
    const span = document.createElement('span');
    span.style.backgroundColor = color;
    label.appendChild(input);
    label.appendChild(span);
    container.appendChild(label);
  });
}

function updateAccountsSummary(accounts) {
  const countEl = document.getElementById('accountsCount');
  const totalEl = document.getElementById('accountsTotal');
  const total = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  if (countEl) countEl.textContent = accounts.length;
  if (totalEl) totalEl.textContent = formatNumber(total) + '€';
}

function renderAccounts() {
  const listEl = document.getElementById('accountsList');
  if (!listEl) return;
  listEl.innerHTML = '';
  accounts.forEach((acc, i) => {
    const item = document.createElement('div');
    item.className = 'account-item';

    const color = document.createElement('span');
    color.className = 'account-color';
    color.style.backgroundColor = acc.color;
    item.appendChild(color);

    const wrapper = document.createElement('div');
    wrapper.className = 'account-wrapper';

    const info = document.createElement('div');
    info.className = 'account-info';
    const name = document.createElement('span');
    name.className = 'account-name';
    name.textContent = acc.name;
    const bank = document.createElement('span');
    bank.className = 'account-bank';
    bank.textContent = acc.bank;
    info.appendChild(name);
    info.appendChild(bank);

    const money = document.createElement('div');
    money.className = 'account-money';
    const balance = document.createElement('span');
    balance.className = 'account-balance';
    balance.textContent = formatNumber(acc.balance) + '€';
    const badge = document.createElement('span');
    badge.className = 'account-badge';
    badge.textContent = acc.type;
    money.appendChild(balance);
    money.appendChild(badge);

    const actions = document.createElement('div');
    actions.className = 'account-actions';
    const edit = document.createElement('button');
    edit.className = 'icon-btn';
    edit.textContent = '✏️';
    edit.addEventListener('click', () => openAccountForm(i));
    const del = document.createElement('button');
    del.className = 'icon-btn delete';
    del.textContent = '🗑️';
    del.addEventListener('click', () => deleteAccount(i));
    actions.appendChild(edit);
    actions.appendChild(del);

    wrapper.appendChild(info);
    wrapper.appendChild(money);
    wrapper.appendChild(actions);

    item.appendChild(wrapper);
    listEl.appendChild(item);
  });
  updateAccountsSummary(accounts);
}

function openBankAccountsModal() {
  const modal = document.getElementById('accountsModal');
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  renderAccountColors();
  renderAccounts();
}

function closeBankAccountsModal() {
  const modal = document.getElementById('accountsModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
  closeAccountForm();
}

function openAccountForm(index = -1) {
  const formSection = document.getElementById('accountFormSection');
  const listSection = document.getElementById('accountsListSection');
  const form = document.getElementById('accountForm');
  if (!formSection || !listSection || !form) return;
  formSection.style.display = 'block';
  listSection.style.display = 'none';
  form.dataset.index = index;
  form.reset();
  renderAccountColors();
   if (index >= 0) {
    const a = accounts[index];
    if (a) {
      document.getElementById('accountName').value = a.name;
      document.getElementById('accountBank').value = a.bank;
      document.getElementById('accountBalance').value = a.balance;
      document.getElementById('accountType').value = a.type;
      const colorInput = document.querySelector(`input[name='accountColor'][value='${a.color}']`);
      if (colorInput) colorInput.checked = true;
    }
  }
}

function closeAccountForm() {
  const formSection = document.getElementById('accountFormSection');
  const listSection = document.getElementById('accountsListSection');
  if (formSection && listSection) {
    formSection.style.display = 'none';
    listSection.style.display = 'block';
  }
}

async function saveAccount(e) {
  e.preventDefault();
  const form = e.target;
  const index = parseInt(form.dataset.index, 10);
  const colorInput = document.querySelector('input[name="accountColor"]:checked');
  const data = {
    name: document.getElementById('accountName').value.trim(),
    bank: document.getElementById('accountBank').value.trim(),
    balance: parseFloat(document.getElementById('accountBalance').value) || 0,
    type: document.getElementById('accountType').value,
    color: colorInput ? colorInput.value : accountColors[0]
  };
  if (index >= 0) {
    const { error } = await supabase
      .from('accounts')
      .update({ ...data })
      .eq('id', accounts[index].id);
    if (error) {
      alert("Erreur lors de l'enregistrement du compte");
      console.error('Supabase error', error);
      return;
    }
    accounts[index] = { ...accounts[index], ...data };
  } else {
    const { data: created, error } = await supabase
      .from('accounts')
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();
    if (error) {
      alert("Erreur lors de la création du compte");
      console.error('Supabase error', error);
      return;
    }
    if (created) accounts.push(created);
  }
  closeAccountForm();
  renderAccounts();
  populateAccountSelects();
}

async function deleteAccount(index) {
  if (!confirm('Supprimer ce compte ?')) return;
  const account = accounts[index];
  if (!account) return;
  const { error } = await supabase.from('accounts').delete().eq('id', account.id);
  if (error) {
    alert("Erreur lors de la suppression du compte");
    console.error('Supabase error', error);
    return;
  }
  accounts.splice(index, 1);
  renderAccounts();
  populateAccountSelects();
}

// Navigate to the settings page from the shortcut icon
function goToSettings() {
  showPage(null, 'parametres');
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  tabs[1]?.classList.add('active');
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
window.openBankAccountsModal = openBankAccountsModal;
window.closeBankAccountsModal = closeBankAccountsModal;
window.openAccountForm = openAccountForm;
window.saveAccount = saveAccount;
window.deleteAccount = deleteAccount;
window.goToSettings = goToSettings;
window.addMoney = addMoney;
window.withdrawMoney = withdrawMoney;
window.openMoneyForm = openMoneyForm;
window.closeMoneyForm = closeMoneyForm;
window.renderHomeHistory = renderHomeHistory;