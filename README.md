# BethPage Tee Time Bot

## Setup

You need npm installed, and Node v20.x or above and npm installed globally. I suggest you use [nvm](https://github.com/creationix/nvm) for node version management. [Configure nvm](#configuring-nvm).

For Windows, install [gitbash](https://git-scm.com/downloads) and [nvm-windows](https://github.com/coreybutler/nvm-windows).

Open a terminal and run these commands sequentially:

```bash
nvm install 22.9
cd golf_bot
nvm use
npm install
```

## Usage

After installing node (you only have to do this once) and running npm install on the project from the terminal (everything happens in the terminal)
You need to update values in the constants.js file relevant to what tee time you want to book.

Here's the list of constants you may want to update:

```
LOGIN_CREDENTIALS
TEE_TIME_DATE
TEE_TIME_PLAYER_SIZE
TEE_TIME_COURSE
```

Wait **30 seconds** before the tee times come out at 7:00PM, then run the command in your terminal

```bash
node index
```

This should launch a browser and start the bot's goal of booking a tee time for you
