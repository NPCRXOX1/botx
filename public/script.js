const apiKey = 'fd911dff64262e625925742d955842ce'; // Replace with your API key
const apiToken = 'ATTAa8e1400774c098878a9ed10d24b084048c9bc258f82723e504e5826e0761021122B16A39'; // Replace with your OAuth token
const boardId = '2GxX62J6'; // Replace with your board's ID

// Fetch cards from the Trello board
async function getTrelloCards() {
    console.log("Fetching Trello cards...");
    try {
        const response = await fetch(`https://api.trello.com/1/boards/${boardId}/cards?key=${apiKey}&token=${apiToken}`);
        
        if (!response.ok) {
            console.error("Failed to fetch data from Trello:", response.statusText);
            return null;
        }

        const cards = await response.json();
        console.log(`Successfully fetched ${cards.length} cards from Trello.`);
        return cards;
    } catch (error) {
        console.error("Error fetching Trello cards:", error);
        return null;
    }
}

// Parse the week time string and convert it to total seconds
function parseWeekTime(weekTime) {
    console.log("Parsing week time:", weekTime);
    const timeParts = weekTime.match(/(\d+)\sday\(s\),\s(\d+)\shour\(s\),\s(\d+)\sminute\(s\),\sand\s(\d+)\ssecond\(s\)/);
    
    if (timeParts) {
        const days = parseInt(timeParts[1]);
        const hours = parseInt(timeParts[2]);
        const minutes = parseInt(timeParts[3]);
        const seconds = parseInt(timeParts[4]);

        const totalSeconds = (days * 24 * 3600) + (hours * 3600) + (minutes * 60) + seconds;
        console.log(`Parsed time for ${weekTime}: ${totalSeconds} seconds.`);
        return totalSeconds;
    }

    console.log("Failed to parse week time:", weekTime);
    return 0;
}

// Load and display the leaderboard by fetching, sorting, and displaying Trello cards
async function loadLeaderboard() {
    console.log("Loading leaderboard...");
    const cards = await getTrelloCards();

    if (!cards) {
        console.error("No cards fetched. Exiting leaderboard load.");
        return;
    }

    console.log("Sorting cards by week time...");
    cards.sort((a, b) => {
        const timeA = parseWeekTime(a.desc);
        const timeB = parseWeekTime(b.desc);
        return timeB - timeA; // Sort in descending order (highest time first)
    });
    console.log("Cards sorted by week time.");

    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = ''; // Clear existing cards
    console.log("Populating leaderboard with sorted cards...");

    cards.forEach(card => {
        console.log(`Displaying card: ${card.name}`);
        const cardElement = document.createElement('div');
        cardElement.classList.add('leaderboard-card');
        cardElement.innerHTML = `
            <div class="leaderboard-card-img">
                <img src="https://via.placeholder.com/100" alt="${card.name}">
            </div>
            <div class="leaderboard-card-details">
                <h3>${card.name}</h3>
                <p><strong>Discord ID:</strong> ${card.desc.match(/Discord ID: (\d+)/)[1]}</p>
                <p><strong>Roblox ID:</strong> ${card.desc.match(/Roblox ID: (\d+)/)[1]}</p>
                <p><strong>Week Time:</strong> ${card.desc.match(/Week Time: (.*)/)[1]}</p>
            </div>
        `;
        leaderboard.appendChild(cardElement);
    });

    console.log("Leaderboard populated.");
}

// Initialize leaderboard on page load
window.onload = () => {
    console.log("Page loaded, initializing leaderboard...");
    loadLeaderboard();
};
