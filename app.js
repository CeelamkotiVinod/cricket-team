const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async (request, response) => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// GET ALL PLAYERS LIST
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
    SELECT
    *
    FROM
    cricket_team
    ORDER BY player_id;
    `;
  const cricketTeamArray = await db.all(getAllPlayersQuery);
  response.send(cricketTeamArray);
});

// ADD A PLAYER
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO
    cricket_team (player_name, jersey_number, role)
    
    VALUES (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );
    `;
  const dbResponse = await db.run(addPlayerQuery);
  const player_id = dbResponse.lastID;
  //   console.log(player_id);
  response.send("Player Added to Team");
});

// GET SPECIFIC PLAYER DETAILS
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
    *
    FROM
    cricket_team
    WHERE player_id = ${playerId};
    `;
  const player = await db.get(getPlayerQuery);
  response.send(player);
});

// UPDATE SPECIFIC PLAYER
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `
    UPDATE
    cricket_team
    SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    WHERE player_id = ${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// DELETE PLAYER API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE
  FROM
  cricket_team
  WHERE player_id = ${playerId};
  `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
