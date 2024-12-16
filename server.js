const express = require('express');
const path = require('path');
const axios = require('axios'); // Import axios for API requests
const Trello = require('trello'); // Import the Trello package

const app = express();
const PORT = 3000;

// Track the start time of the server
const startTime = Date.now();

// Function to calculate uptime
function getUptime() {
    const currentTime = Date.now();
    const uptimeInSeconds = Math.floor((currentTime - startTime) / 1000);

    const days = Math.floor(uptimeInSeconds / (24 * 60 * 60));
    const hours = Math.floor((uptimeInSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptimeInSeconds % (60 * 60)) / 60);
    const seconds = uptimeInSeconds % 60;

    return { days, hours, minutes, seconds };
}

// Set up Trello client
const trello = new Trello('fd911dff64262e625925742d955842ce', 'ATTAa8e1400774c098878a9ed10d24b084048c9bc258f82723e504e5826e0761021122B16A39'); // Your API key and OAuth token
const boardId = 'uL6KV8Jv'; // Replace with your board's ID

// Function to get Trello cards
async function getTrelloCards() {
    try {
        console.log('Fetching Trello cards...');
        const cards = await trello.getCardsOnBoard(boardId); // Using Trello package method

        console.log(`Fetched ${cards.length} cards from Trello.`);
        return cards;
    } catch (error) {
        console.error("Error fetching Trello cards:", error);
        return [];
    }
}

// Function to fetch user avatar headshot from Roblox
async function getUserHeadshot(userId) {
    try {
        const { data } = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);
        return data.data[0].imageUrl;
    } catch (error) {
        console.error('Error fetching user headshot:', error.message);
        return null; // Return null if the headshot fetch fails
    }
}

function parseWeekTime(weekTime) {
    const timeParts = weekTime.match(/(\d+)\sday\(s\),\s(\d+)\shour\(s\),\s(\d+)\sminute\(s\),\sand\s(\d+)\ssecond\(s\)/);
    if (timeParts) {
        const days = parseInt(timeParts[1]);
        const hours = parseInt(timeParts[2]);
        const minutes = parseInt(timeParts[3]);
        const seconds = parseInt(timeParts[4]);
        return (days * 24 * 3600) + (hours * 3600) + (minutes * 60) + seconds;
    }
    return 0;
}

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML files
app.get('/', (req, res) => {
    console.log('Home page requested');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/statistics.html', (req, res) => {
    console.log('Statistics page requested');
    res.sendFile(path.join(__dirname, 'statistics.html'));
});

// API endpoint for guarding leaderboard
app.get('/api/guardingleaderboard', async (req, res) => {
    console.log('Guarding leaderboard API requested');
    
    // Fetch cards from Trello and sort them
    const cards = await getTrelloCards();
    
    if (!cards.length) {
        console.log('No cards found.');
        return res.json({ message: 'No cards found.' });
    }

    // Sort cards by week time
    console.log('Sorting cards by week time...');
    cards.sort((a, b) => {
        const timeA = parseWeekTime(a.desc);
        const timeB = parseWeekTime(b.desc);
        return timeB - timeA; // Sort in descending order (highest time first)
    });

    // Format cards into leaderboard data with headshot URLs
    const leaderboardData = [];
    for (const card of cards) {
        const discordId = card.desc.match(/Discord ID: (\d+)/) ? card.desc.match(/Discord ID: (\d+)/)[1] : 'N/A';
        const robloxId = card.desc.match(/User ID: (\d+)/) ? card.desc.match(/User ID: (\d+)/)[1] : 'N/A';
        const weekTime = card.desc.match(/Week Time: (.*)/) ? card.desc.match(/Week Time: (.*)/)[1] : 'N/A';
        
        // Fetch user headshot for the current Roblox ID
        const avatarUrl = await getUserHeadshot(robloxId);

        leaderboardData.push({
            name: card.name,
            discordId,
            robloxId,
            weekTime,
            avatarUrl, // Add avatar URL to the leaderboard data
        });
    }

    console.log('Returning leaderboard data...');
    
    // Send the leaderboard data as JSON
    res.json({ leaderboard: leaderboardData });
});

// API endpoint for uptime
app.get('/uptime', (req, res) => {
    console.log('Uptime requested');
    res.json({ uptime: getUptime() });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
