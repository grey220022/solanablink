# Solana Action: Transfer SOL

This example demonstrates a Solana Action built with Node.js using the Express
framework. It provides an API endpoint for transferring SOL.

## Setup

Navigate to `./examples/express`.

Install dependencies:

```
npm install
```

Start the application:

```
npm start
```

The server will start running on http://localhost:8080.

The endpoint for the Action is: http://localhost:8080/api/actions/transfer-sol

You can test the Action on devnet as a Blink at https://dial.to/devnet:
https://www.dial.to/devnet?action=solana-action%3Ahttp%3A%2F%2Flocalhost%3A8080%2Fapi%2Factions%2Ftransfer-sol

https://dial.to/devnet?action=solana-action:http://localhost:3000/api/actions/transfer-sol

https://blink-sigma.vercel.app

https://dial.to/?action=solana-action%3Ahttp%3A%2F%2Flocalhost%3A3000%2Fapi%2Factions%2Ftransfer-sol

https://dial.to/devnet?action=solana-action:https://blink-sigma.vercel.app/api/actions/transfer-sol

https://dial.to/devnet?action=solana-action:https://blinksolanasim.fr/api/actions/transfer-sol
