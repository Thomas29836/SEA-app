 // Variable pour suivre l'état du SEA
    let seaActive = true;

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
       document.getElementById(pageId).classList.add('active');

  // Activer l'onglet correspondant
  if (evt) {
    evt.target.classList.add('active');
  }
}

    // Soumission du formulaire SEA
    document.getElementById('seaForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Récupérer les données du formulaire
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);
      
      // Simulation de sauvegarde
      alert('SEA sauvegardé avec succès !');
      
       // Retourner à l'accueil␊
      showPage(null, 'accueil');
      
      // Réactiver l'onglet accueil
      document.querySelector('.nav-tab').classList.add('active');
    });

    // Fonctions pour la modal de désactivation
    function showDeactivateModal() {
      const modal = document.getElementById('deactivateModal');
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Empêcher le scroll
    }

    function closeDeactivateModal() {
      const modal = document.getElementById('deactivateModal');
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

    // Fermer la modal en cliquant en dehors
    document.getElementById('deactivateModal').addEventListener('click', function(e) {
      if (e.target === this) {
        closeDeactivateModal();
      }
    });

    // Fonctions pour les paramètres
    function resetSEA() {
      if (confirm('Êtes-vous sûr de vouloir réinitialiser votre SEA ?')) {
        alert('SEA réinitialisé !');
        seaActive = true;
        updateSeaStatus();
      }
    }

    function logout() {
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        alert('Déconnexion...');
        // Logique de déconnexion ici
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

    // Animation d'entrée
    document.addEventListener('DOMContentLoaded', function() {
      document.body.style.opacity = '0';
      setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s';
        document.body.style.opacity = '1';
      }, 100);
    });