# Discord Bot
## What it does
This discord bot is for automating matches for a graphic design competition. Once you register you can queue a match and if two people of the same rank are queued they are matched together. You move up a rank every 100 points, you gain 30 per win.
## How I made it
To first set up the bot I followed this tutorial: https://discordjs.guide/#before-you-begin <br/> Until slash commands and then started to set up a database using sql for the intial setup I relied on AI, but after this project I'm feeling confident in sql. After setting up the database I made 2 tables(one for queue and the other for players) which would add and remove from those tables in their respective commands. Then I made a function that's called every 5 seconds to check if 2 people in queue can be matched together and removes them from the table. Finally I added a way to see the leaderboard and a way for judges to delare a winner which would edit the point and rank totals.
