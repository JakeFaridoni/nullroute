# Ideas

Ideas to implement (eventually).

---

## Refactor Log in Flow

The log in flow starts with registration, but should start with log in instead.
Change to:

1. Load log in screen
2. Prompt user for log in/register
3. User enters information and logs in


## Admin/GM Page

Admin/GM specific UI for world events and global messages.
Accessed through a specific log in or separate page?
- [ ] ~~Specific Log in~~
- [x] Separate Page

How to Access:
1. DOMAIN/admin
2. Log in w/ admin credentials
3. Voila

### Content:

This panel should not have the players terminal/ip tracker/inbox layout.
Instead it is for altering the world as a whole and as such should not have any regular gameplay elements: no connecting, no hacking, etc.

Content:
- Stock Market Monitor
    > View current and previous stock prices, most valuable stocks, and most purchased stocks.\
    > System for suspicious player stock purchases (TBD):
    > 1. Automatically send warning message
    > 2. If purchases persist, reduce player clearence by 2, autosell player stocks, initiate fail sequence
- World Event Monitor w/ god powers
    > Both procedurally generated and custom made events.\
    > World events influence the stock market, therefore it should include a "Stock Market Effects" area before events are dispatched
- Message System (Global/Individual)
    > Send global messages (to all) and individual messages (input player ID).\
    > These messages should have a title section and message section; structured like the welcome message.\
    > Customizable sign-off handle Ex: "- SPY" or "- ADMIN"
- Player Monitor w/ god powers 
    > Alter player stats (not handle/password) database (add admin password confirmation for these actions)
- Server Monitor
    > Server status, server restart button, etc.

## Global Company Servers

Global company servers are the servers every player can access.

### Behaviors:

Global company servers should:
- Serve as multiplayer areas where players can (kind of) interact
- Be excluded from basic contracts
    > Low clearance contracts
- Be included in complex/high-risk contracts
- Be updated with every player action
    > Ex: One player deletes a file, it deletes for all (exclude player contract files)
- Have security systems interactable with every connected player at the same time
    > Ex: One player blinds the monitor, the monitor goes down for all connected players\
    > OR\
    > One player can enable security systems through a difficult minigame

### Player Interactions:

Players can connect to these servers and:
- View other players connected to the server through a command
- Interact with the server while others are connected
    > Ex: Deleting, planting, etc...
- Complete a very difficult minigame to start a trace on other players
    > This should only be allowed through a specific complex/high-risk contract

## NULLROUTE

NULLROUTE is the way the main way the player starts their interactions with the world.

### HACKNODE

Multiplyer 1V1 or 2V2 battles with multiple game modes.
Option in NULLROUTE menu.

Not hosted on IPs, but rather a NULLROUTE internal server with randomly generated nodes with unique names (4 letters).
> Example Nodes Names: DESK, RAIN, DARK, etc...

Players cannot connect to any IPs or outside nodes until game is finished or player exists the game via command (TBD).

Players have new command list for multiplayer:
1. SCAN
    > Scans nearby nodes and marks FRIENDLY/UNKOWN/DISCOVERED/HOSTILE\
    > USE: SCAN

2. ANALYZE
    > Used while connected UNKOWN nodes to determine HOSTILE/DISCOVERED\
    > USE: ANALYZE

3. PLANT
    > Used while connected any node to establish backdoor access into that node\
    > USE: PLANT

4. TRAP
    > Used while connected to a node to prevent a PLANT, sends player trying to plant back to their home node\
    > USE: TRAP

4. ENTER
    > Used to enter backdoors made with plant, if not given a node name ENTER lists all nodes with a backdoor\
    > USE: ENTER [ NODE NAME ]

5. FRAG
    > Used while connected to a node with another player to send an enemy back to their home node\
    > Takes 5-10 seconds\
    > USE: FRAG

6. DEFRAG
    > Used to counter FRAG and move to a nearby DISCOVERED/FRIENDLY node\
    > Takes 3 seconds\
    > USE: DEFRAG

7. HOP
    > Used to navigate to nearby nodes\
    > USE: HOP [ NODE NAME ]

8. HIDE
    > Used to hide on a node (presence unkown to enemies); cannot use other commands (except UNHIDE) while hidden\
    > USE: HIDE

9. UNHIDE
    > Used after hiding to unhide

How to Access:
1. Connect to NULLROUTE
2. Select HACKNODE
3. Pick gamemode or go back
4. If gamemode is picked, create/join lobby
5. Once all neccessary players are in, start game

Game modes:
1. CTF (1 Defense, 1 Offense)
    > Win: Set increase to balance\
    > Loss: No effect

2. High-risk CTF (1 Defense, 1 Offense)
    > Win: Gain almost all of the losing players balance (Losing players bal - 500 CR)\
    > Loss: Lose all balance to winning player (safety net of 500 CR)

3. Team CTF (Both play offense and defense) ?
    > 2 teams\
    > One player on each team plays offense, one plays defense\
    > Win: Set increase to balance\
    > Loss: No effect

4. High-risk Team CTF (Both play offense and defense) ?
    > 2 teams\
    > One player on each team plays offense, one plays defense\
    > Win: Gain almost all of the losing players balance (Losing players bal - 500 CR)\
    > Loss: Lose all balance to winning player (safety net of 500 CR)


