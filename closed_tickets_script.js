document.addEventListener('DOMContentLoaded', () => {
    const closedTicketListDiv = document.getElementById('closed-ticket-list');
    const ticketDetailsModal = document.getElementById('ticket-details-modal');
    const closeDetailsModalBtn = document.getElementById('close-details-modal-btn');

    // Ticket Details Modal Elements
    const detailsTicketTitle = document.getElementById('details-ticket-title');
    const detailsTicketId = document.getElementById('details-ticket-id');
    const detailsTicketStatus = document.getElementById('details-ticket-status');
    const detailsTicketReported = document.getElementById('details-ticket-reported');
    const detailsTicketClosed = document.getElementById('details-ticket-closed');
    const detailsTicketDescription = document.getElementById('details-ticket-description');
    const detailsTicketNotesList = document.getElementById('details-ticket-notes');

    // Load tickets from localStorage
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const closedTickets = tickets.filter(ticket => ticket.status === 'Closed');


    function renderClosedTickets() {
        if (closedTickets.length === 0) {
            closedTicketListDiv.innerHTML = '<p>No closed tickets yet.</p>';
            return;
        }

        closedTickets.forEach(ticket => {
            const ticketDiv = document.createElement('div');
            ticketDiv.classList.add('ticket-item');
            ticketDiv.dataset.id = ticket.id;

            ticketDiv.innerHTML = `
                <h3>${ticket.title}</h3>
                <p>ID: ${ticket.id}</p>
                <p>Status: <span class="status-closed">${ticket.status}</span></p>
                <p>Closed: ${new Date(ticket.closedDate).toLocaleDateString()}</p>
            `;

            ticketDiv.addEventListener('click', () => openTicketDetails(ticket));
            closedTicketListDiv.appendChild(ticketDiv);
        });
    }

    function openTicketDetails(ticket) {
        detailsTicketTitle.textContent = ticket.title;
        detailsTicketId.textContent = ticket.id;
        detailsTicketStatus.textContent = ticket.status;
        detailsTicketReported.textContent = new Date(ticket.reportedDate).toLocaleString();
        detailsTicketClosed.textContent = ticket.closedDate
            ? new Date(ticket.closedDate).toLocaleString()
            : 'Unknown';
        detailsTicketDescription.textContent = ticket.description;

        detailsTicketNotesList.innerHTML = '';
        if (ticket.notes && ticket.notes.length > 0) {
            ticket.notes.forEach(note => {
                const li = document.createElement('li');
                li.innerHTML = `${note.text} <span class="note-meta">- ${new Date(note.date).toLocaleString()}</span>`;
                detailsTicketNotesList.appendChild(li);
            });
        } else {
            detailsTicketNotesList.innerHTML = '<li>No notes available.</li>';
        }

        ticketDetailsModal.style.display = 'block';
    }

    function closeModal() {
        ticketDetailsModal.style.display = 'none';
    }

    // Event listeners
    closeDetailsModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === ticketDetailsModal) closeModal();
    });

    // Render on load
    renderClosedTickets();
});

