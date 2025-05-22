document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const createTicketModal = document.getElementById('create-ticket-modal');
    const ticketDetailsModal = document.getElementById('ticket-details-modal');
    const openCreateTicketModalBtn = document.getElementById('open-create-ticket-modal-btn');
    const closeCreateModalBtn = document.getElementById('close-create-modal-btn');
    const closeDetailsModalBtn = document.getElementById('close-details-modal-btn');
    const createTicketForm = document.getElementById('create-ticket-form');
    const ticketListDiv = document.getElementById('ticket-list');

    // Ticket Details Modal Elements
    const detailsTicketTitle = document.getElementById('details-ticket-title');
    const detailsTicketId = document.getElementById('details-ticket-id');
    const detailsTicketStatus = document.getElementById('details-ticket-status');
    const detailsTicketReported = document.getElementById('details-ticket-reported');
    const detailsTicketDescription = document.getElementById('details-ticket-description');
    const detailsTicketNotesList = document.getElementById('details-ticket-notes');
    const newNoteText = document.getElementById('new-note-text');
    const addNoteBtn = document.getElementById('add-note-btn');
    const closeTicketBtn = document.getElementById('close-ticket-btn');

    // Character Info Elements
    const charNameSpan = document.getElementById('char-name'); // For editable name
    const charLevelSpan = document.getElementById('char-level');
    const charXPSpan = document.getElementById('char-xp');
    const xpToNextLevelSpan = document.getElementById('xp-to-next-level');
    const charGoldSpan = document.getElementById('char-gold');
    const charWeaponSpan = document.getElementById('char-weapon');
    const charArmorSpan = document.getElementById('char-armor');

    // RPG Shop Elements
    const rpgShopSection = document.getElementById('rpg-shop');
    const toggleShopBtn = document.getElementById('toggle-shop-btn');
    const closeShopBtn = document.getElementById('close-shop-btn');
    const shopItemsContainer = document.querySelector('.shop-items');

    // Boss DOM Elements
    const bossNameSpan = document.getElementById('boss-name');
    const bossStatusSpan = document.getElementById('boss-status');
    const attackBossBtn = document.getElementById('attack-boss-btn');
    const bossCooldownMessage = document.getElementById('boss-cooldown-message');
    const bossBattleLog = document.getElementById('boss-battle-log');

    // Game State Variables
    let tickets = [];
    let character = {
        name: "Hero",
        level: 1,
        xp: 0,
        gold: 0,
        weapon: { name: "Stick", bonus: 1 },
        armor: { name: "Rags", bonus: 1 }
    };
    let currentOpenTicketId = null;
    let lastBossAttemptDate = null;

    const bossNames = [
        "Shadowfang",
        "Ironclaw",
        "Blazewing",
        "Venomspike",
        "Grimjaw",
        "Stormbreaker",
        "Frostmaw",
        "Dreadscale",
        "Nightshade",
        "Thunderfist",
        "Bonecrusher",
        "Firelash",
        "Darkhowl",
        "Skullrend",
        "Terrorgaze",
        "Bloodfang",
        "Stonehide",
        "Voidreaper",
        "Hellstorm",
        "Steelshadow",
        "Cybervoid",
        "NeonMatrix",
        "QuantumHex",
        "DataWraith",
        "PixelPhantom",
        "CircuitBreaker",
        "NanoScourge",
        "SynthReaper",
        "ByteStorm",
        "CodeSpecter",
        "Firewall Phantom",
        "Malware Marauder",
        "Phishmaster",
        "Crypto Kraken",
        "ZeroDay Wraith",
        "Trojan Titan",
        "Botnet Baron",
        "Ransom Reaper",
        "Spyware Specter",
        "Rootkit Rogue",
        "DDoS Demon",
        "Cipher Sentinel",
        "Exploit Entity",
        "Packet Predator",
        "Hash Hunter",
        "Backdoor Beast",
        "Sandbox Savage",
        "Trojan Tormentor",
        "Worm Warden",
        "Privilege Phantom"
      ];

    // Game Constants
    const XP_PER_TICKET = 50;
    const GOLD_PER_LEVEL = 100;
    const XP_BASE_NEXT_LEVEL = 100;
    const BOSS_XP_REWARD = 250;
    const BOSS_GOLD_REWARD = 300;
    const BOSS_DEFENSE_THRESHOLD = 35 + character.level;
    const BOSS_NAME = bossNames[Math.floor(Math.random() * bossNames.length)];

    // --- Utility Functions ---
    function getXPForNextLevel(level) {
        return XP_BASE_NEXT_LEVEL * Math.pow(level, 1.5);
    }

    function saveState() {
        localStorage.setItem('tickets', JSON.stringify(tickets));
        localStorage.setItem('character', JSON.stringify(character));
        localStorage.setItem('lastBossAttemptDate', lastBossAttemptDate);
    }

    function loadState() {
        const savedTickets = localStorage.getItem('tickets');
        const savedCharacter = localStorage.getItem('character');
        const savedLastBossAttemptDate = localStorage.getItem('lastBossAttemptDate');

        if (savedTickets) {
            tickets = JSON.parse(savedTickets);
        }
        if (savedCharacter) {
            const loadedChar = JSON.parse(savedCharacter);
            character = { // Ensure default structure and override with loaded data
                name: "Hero",
                level: 1,
                xp: 0,
                gold: 0,
                weapon: { name: "Stick", bonus: 1 },
                armor: { name: "Rags", bonus: 1 },
                ...loadedChar
            };
        }
        if (savedLastBossAttemptDate) {
            lastBossAttemptDate = savedLastBossAttemptDate;
        }
        updateCharacterDisplay();
        renderTickets();
        updateBossDisplay();
    }

    // --- Character Functions ---
    function updateCharacterDisplay() {
        charNameSpan.textContent = character.name; // Update name here
        charLevelSpan.textContent = character.level;
        charXPSpan.textContent = Math.floor(character.xp);
        xpToNextLevelSpan.textContent = Math.floor(getXPForNextLevel(character.level));
        charGoldSpan.textContent = character.gold;
        charWeaponSpan.textContent = `${character.weapon.name} (+${character.weapon.bonus} ATK)`;
        charArmorSpan.textContent = `${character.armor.name} (+${character.armor.bonus} DEF)`;
    }

    function addXP(amount, source = "Ticket") {
        character.xp += amount;
        const xpNeeded = getXPForNextLevel(character.level);
        if (character.xp >= xpNeeded) {
            levelUp(); // This will also call updateCharacterDisplay and saveState through its chain
        } else {
            updateCharacterDisplay();
            saveState();
        }
    }
    
    function addGold(amount) {
        character.gold += amount;
        // updateCharacterDisplay() and saveState() are typically called by the function that awards gold (e.g., levelUp, attemptBossBattle)
    }

    function levelUp() {
        const xpNeeded = getXPForNextLevel(character.level);
        character.xp -= xpNeeded;
        if(character.xp < 0) character.xp = 0;

        character.level++;
        const goldEarned = GOLD_PER_LEVEL * (character.level -1); // More gold for higher levels
        addGold(goldEarned);
        
        alert(`Congratulations! You've reached Level ${character.level}! You earned ${goldEarned} Gold.`);

        // Check for multi-level ups
        const newXpNeeded = getXPForNextLevel(character.level);
        if (character.xp >= newXpNeeded && character.level < 99) { // Cap level if desired
            levelUp(); // Recursive call
        } else {
            updateCharacterDisplay();
            saveState();
        }
    }

    // --- Editable Character Name Logic ---
    function makeNameEditable() {
        const currentName = charNameSpan.textContent;
        charNameSpan.innerHTML = ''; // Clear the span

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = currentName;
        nameInput.className = 'char-name-input';
        nameInput.maxLength = 20;

        nameInput.addEventListener('blur', saveName);
        nameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                nameInput.blur();
            } else if (event.key === 'Escape') {
                charNameSpan.textContent = currentName; // Restore original, don't save
            }
        });

        charNameSpan.appendChild(nameInput);
        nameInput.focus();
        nameInput.select();
    }

    function saveName(event) {
        const inputField = event.target;
        let newName = inputField.value.trim();

        if (newName === "") {
            newName = "Hero"; // Default if empty
        }
        character.name = newName;
        charNameSpan.textContent = character.name; // Update span
        saveState(); // Save the new name
    }

    // --- Ticket Functions ---
    function renderTickets() {
        ticketListDiv.innerHTML = ''; // Clear existing tickets

        // Calculate open and closed ticket counts
        const openTickets = tickets.filter(ticket => ticket.status !== 'Closed');
        const closedTickets = tickets.filter(ticket => ticket.status === 'Closed');

        // Update the chart with real counts
        renderTicketChart(openTickets.length, closedTickets.length);

        if (openTickets.length === 0) {
            ticketListDiv.innerHTML = '<p>No active tickets. Create one or check the archive!</p>';
            return;
        }

        openTickets.forEach(ticket => {
            const ticketDiv = document.createElement('div');
            ticketDiv.classList.add('ticket-item');
            ticketDiv.dataset.id = ticket.id;
            let reportedDateDisplay = new Date(ticket.reportedDate).toLocaleDateString();
            let extraInfo = `<p>Reported: ${reportedDateDisplay}</p>`;

            ticketDiv.innerHTML = `
                <h3>${ticket.title}</h3>
                <p>ID: ${ticket.id}</p>
                <p>Status: <span class="status-${ticket.status.toLowerCase()}">${ticket.status}</span></p>
                ${extraInfo}
            `;
            ticketDiv.addEventListener('click', () => openTicketDetails(ticket.id));
            ticketListDiv.appendChild(ticketDiv);
        });
    }

    function createTicket(title, description) {
        const newTicket = {
            id: `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title,
            description,
            status: 'Open',
            reportedDate: new Date().toISOString(),
            notes: []
        };
        tickets.unshift(newTicket);
        saveState();
        renderTickets();
    }

    function addNoteToTicket(ticketId, noteText) {
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket && noteText.trim() !== '') {
            ticket.notes.push({
                text: noteText.trim(),
                date: new Date().toISOString()
            });
            saveState();
            populateTicketDetails(ticketId);
        }
    }

    function closeTicket(ticketId) {
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket && ticket.status === 'Open') {
            ticket.status = 'Closed';
            ticket.closedDate = new Date().toISOString();
            addLogEntry(`Ticket "${ticket.title}" closed! You earned ${XP_PER_TICKET} XP!`, "log-info", bossBattleLog); // Use common log
            addXP(XP_PER_TICKET, "Ticket"); // This will handle saveState and updateCharacterDisplay
            renderTickets();
            closeDetailsModal();
        } else if (ticket && ticket.status === 'Closed') {
            alert('This ticket is already closed.');
        }
    }

    // --- Modal Functions ---
    function openCreateTicketModal() {
        createTicketForm.reset();
        createTicketModal.style.display = 'block';
    }

    function closeCreateModal() {
        createTicketModal.style.display = 'none';
    }

    function populateTicketDetails(ticketId) {
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        currentOpenTicketId = ticketId;
        detailsTicketTitle.textContent = ticket.title;
        detailsTicketId.textContent = ticket.id;
        detailsTicketStatus.textContent = ticket.status;
        detailsTicketStatus.className = `status-${ticket.status.toLowerCase()}`;
        detailsTicketReported.textContent = new Date(ticket.reportedDate).toLocaleString();
        detailsTicketDescription.textContent = ticket.description;

        detailsTicketNotesList.innerHTML = '';
        if (ticket.notes.length > 0) {
            ticket.notes.forEach(note => {
                const li = document.createElement('li');
                li.innerHTML = `${note.text} <span class="note-meta">- ${new Date(note.date).toLocaleString()}</span>`;
                detailsTicketNotesList.appendChild(li);
            });
        } else {
            detailsTicketNotesList.innerHTML = '<li>No notes yet.</li>';
        }
        closeTicketBtn.disabled = ticket.status === 'Closed';
        closeTicketBtn.textContent = ticket.status === 'Closed' ? 'Ticket Already Closed' : 'Close Ticket & Claim XP';

        // Add this block to show resolution time if ticket is closed
        const resolutionTimeElem = document.getElementById('details-ticket-resolution-time');
        if (ticket.status === 'Closed' && ticket.closedDate && ticket.reportedDate) {
            const reported = new Date(ticket.reportedDate).getTime();
            const closed = new Date(ticket.closedDate).getTime();
            const diffMs = closed - reported;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            resolutionTimeElem.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        } else {
            resolutionTimeElem.textContent = '--';
        }
    }

    function openTicketDetails(ticketId) {
        populateTicketDetails(ticketId);
        ticketDetailsModal.style.display = 'block';
    }

    function closeDetailsModal() {
        ticketDetailsModal.style.display = 'none';
        currentOpenTicketId = null;
    }

    // --- RPG Shop Functions ---
    function toggleShop() {
        if (rpgShopSection.style.display === 'none') {
            rpgShopSection.style.display = 'block';
            toggleShopBtn.textContent = 'Close Shop';
        } else {
            rpgShopSection.style.display = 'none';
            toggleShopBtn.textContent = 'Visit Shop';
        }
    }

    function buyItem(itemElement) {
        const type = itemElement.dataset.type;
        const name = itemElement.dataset.name;
        const cost = parseInt(itemElement.dataset.cost);
        const bonus = parseInt(itemElement.dataset.bonus);

        if (character.gold >= cost) {
            if (type === "weapon") {
                if (character.weapon.name === name) {
                    alert("You already own this weapon!"); return;
                }
                character.weapon = { name, bonus };
            } else if (type === "armor") {
                 if (character.armor.name === name) {
                    alert("You already own this armor!"); return;
                }
                character.armor = { name, bonus };
            }
            character.gold -= cost; // Use addGold(-cost) if you prefer, but direct subtraction is fine.
            alert(`You bought ${name} for ${cost} Gold!`);
            updateCharacterDisplay();
            saveState();
        } else {
            alert("Not enough gold!");
        }
    }

    // --- Boss Battle Functions ---
    function addLogEntry(message, type = "log-info", logElement = bossBattleLog) {
        const entry = document.createElement('div');
        entry.classList.add('log-entry', type);
        entry.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
        logElement.insertBefore(entry, logElement.firstChild);
        if (logElement.children.length > 10) {
            logElement.removeChild(logElement.lastChild);
        }
    }







/////////////////////////////////////////////////  BOSS BATTLE TIME FUNCTIONS ///////////////////////////////////////


    function updateBossDisplay() {
        if (!bossNameSpan) return; // Guard if boss elements aren't on page for some reason
        bossNameSpan.textContent = BOSS_NAME;
    
        // ---- TEMPORARY 1-MINUTE COOLDOWN LOGIC FOR TESTING ----
        const now = Date.now();
        const lastAttempt = Number(localStorage.getItem('lastBossAttemptTimestamp')) || 0;
        const oneMinute = 60 * 1000;
    
        if (now - lastAttempt < oneMinute) {
            attackBossBtn.disabled = true;
            bossCooldownMessage.textContent = "You have already challenged the boss recently. Try again in 1 minute!";
            bossStatusSpan.textContent = "Resting after the last challenge.";
        } else {
            attackBossBtn.disabled = false;
            bossCooldownMessage.textContent = "";
            bossStatusSpan.textContent = "Waiting for a challenger...";
        }
    
        // ---- ORIGINAL DAILY COOLDOWN LOGIC ----
        /*
        const today = new Date().toDateString();
        if (lastBossAttemptDate === today) {
            attackBossBtn.disabled = true;
            bossCooldownMessage.textContent = "You have already challenged the boss today. Return tomorrow!";
            bossStatusSpan.textContent = "Resting after the last challenge.";
        } else {
            attackBossBtn.disabled = false;
            bossCooldownMessage.textContent = "";
            bossStatusSpan.textContent = "Waiting for a challenger...";
        }
        */
    }
    
    function attemptBossBattle() {
        // ---- TEMPORARY 1-MINUTE COOLDOWN LOGIC FOR TESTING ----
        const now = Date.now();
        const lastAttempt = Number(localStorage.getItem('lastBossAttemptTimestamp')) || 0;
        const oneMinute = 60 * 1000;
    
        if (now - lastAttempt < oneMinute) {
            addLogEntry("You can only attempt to defeat the boss once per minute (testing mode).", "log-fail");
            return;
        }
    
        // Store timestamp for cooldown tracking
        localStorage.setItem('lastBossAttemptTimestamp', now);
    
        // ---- ORIGINAL DAILY COOLDOWN LOGIC ----
        /*
        const today = new Date().toDateString();
        if (lastBossAttemptDate === today) {
            addLogEntry("You can only attempt to defeat the boss once per day.", "log-fail");
            return;
        }
    
        lastBossAttemptDate = today;
        */
    
        attackBossBtn.disabled = true;
        bossCooldownMessage.textContent = "You have challenged the boss. Return in 1 minute!";
        bossBattleLog.innerHTML = '';
    
        addLogEntry(`You gather your courage to face ${BOSS_NAME}...`, "log-info");
        const playerEffectivePower = character.level + character.weapon.bonus + character.armor.bonus;
        addLogEntry(`Your effective power: ${playerEffectivePower} (Lvl:${character.level} + Wpn:${character.weapon.bonus} + Arm:${character.armor.bonus})`, "log-info");
        addLogEntry(`${BOSS_NAME}'s defense threshold: ${BOSS_DEFENSE_THRESHOLD}`, "log-info");
    
        setTimeout(() => {
            if (playerEffectivePower > BOSS_DEFENSE_THRESHOLD) {
                addLogEntry(`${BOSS_NAME} has been defeated!`, "log-success");
                addLogEntry(`You earned ${BOSS_XP_REWARD} XP and ${BOSS_GOLD_REWARD} Gold!`, "log-success");
                addGold(BOSS_GOLD_REWARD);
                addXP(BOSS_XP_REWARD, "Boss");
                bossStatusSpan.textContent = "Defeated! Will return shortly.";
            } else {
                const powerDifference = BOSS_DEFENSE_THRESHOLD - playerEffectivePower;
                addLogEntry(`${BOSS_NAME} shrugs off your attack! You were not strong enough (by ${powerDifference} power).`, "log-fail");
                addLogEntry("No rewards gained. Train harder and try again soon!", "log-fail");
                bossStatusSpan.textContent = "Victorious! Awaits a stronger challenger.";
                saveState();
                updateCharacterDisplay();
            }
        }, 1500);
    }




function renderTicketChart(openCount, closedCount) {
    const ctx = document.getElementById('ticketChart').getContext('2d');
    if (window.ticketChartInstance) {
        window.ticketChartInstance.destroy();
    }
    window.ticketChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Open Tickets', 'Closed Tickets'],
            datasets: [{
                data: [openCount, closedCount],
                backgroundColor: ['#36a2eb', '#4caf50'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

renderTicketChart(5, 12);








    // --- Event Listeners ---
    openCreateTicketModalBtn.addEventListener('click', openCreateTicketModal);
    closeCreateModalBtn.addEventListener('click', closeCreateModal);
    closeDetailsModalBtn.addEventListener('click', closeDetailsModal);

    createTicketForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('ticket-title').value;
        const description = document.getElementById('ticket-description').value;
        if (title.trim() && description.trim()) {
            createTicket(title, description);
            closeCreateModal();
        } else {
            alert('Please fill in both title and description.');
        }
    });

    addNoteBtn.addEventListener('click', () => {
        if (currentOpenTicketId && newNoteText.value.trim() !== '') {
            addNoteToTicket(currentOpenTicketId, newNoteText.value);
            newNoteText.value = '';
        }
    });

    closeTicketBtn.addEventListener('click', () => {
        if (currentOpenTicketId) {
            closeTicket(currentOpenTicketId);
        }
    });

    toggleShopBtn.addEventListener('click', toggleShop);
    closeShopBtn.addEventListener('click', toggleShop);

    shopItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-item-btn')) {
            buyItem(e.target.closest('.shop-item'));
        }
    });

    // Listener for editable character name
    charNameSpan.addEventListener('click', () => {
        if (!charNameSpan.querySelector('input')) {
            makeNameEditable();
        }
    });

    // Listener for boss attack button
    if (attackBossBtn) { // Check if the element exists before adding listener
        attackBossBtn.addEventListener('click', attemptBossBattle);
    }


    // Close modals if user clicks outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target === createTicketModal) {
            closeCreateModal();
        }
        if (event.target === ticketDetailsModal) {
            closeDetailsModal();
        }
    });

    // --- Initial Load ---
    loadState();
});

function updateAverageResolutionTime() {
    // Get all closed tickets with both reportedDate and closedDate
    const closedTickets = tickets.filter(ticket => ticket.status === 'Closed' && ticket.closedDate && ticket.reportedDate);
    if (closedTickets.length === 0) {
        document.getElementById('avg-resolution-value').textContent = '--';
        return;
    }
    // Calculate total resolution time in milliseconds
    const totalMs = closedTickets.reduce((sum, t) => {
        const reported = new Date(t.reportedDate).getTime();
        const closed = new Date(t.closedDate).getTime();
        return sum + (closed - reported);
    }, 0);
    const avgMs = totalMs / closedTickets.length;
    const avgHours = avgMs / (1000 * 60 * 60);
    const hours = Math.floor(avgHours);
    const minutes = Math.round((avgHours - hours) * 60);
    document.getElementById('avg-resolution-value').textContent =
        hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}