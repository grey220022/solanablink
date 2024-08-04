const cors = require("cors");
const {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    clusterApiUrl,
    LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
const {
    ACTIONS_CORS_HEADERS_MIDDLEWARE,
    createPostResponse,
} = require("@solana/actions");

require('dotenv').config();

const express = require('express');
const app = express();
const { sql } = require('@vercel/postgres');

const bodyParser = require('body-parser');
const path = require('path');


const DEFAULT_SOL_ADDRESS = "ETbH41Y1Kup7Py968a14LLXoTJyywbtDtN4RjrSzg7ye";
const DEFAULT_SOL_AMOUNT = 1;
const SOLANA_ENDPOINT_URL =
    "https://solana-mainnet.core.chainstack.com/2d5a510af78204f8796a6e6f56c026db";
const connection = new Connection(SOLANA_ENDPOINT_URL, "confirmed");
//const connection = new Connection(clusterApiUrl("devnet"));


// Create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });
//const BASE_URL = `http://blinksolanasim.fr`;
const BASE_URL = `https://blink.solanasim.com`;
//const BASE_URL = `http://localhost:3000`;

app.use(express.static('public'));
app.use(express.json());
app.use(cors(ACTIONS_CORS_HEADERS_MIDDLEWARE));

// Routes
app.get("/actions.json", getActionsJson);
app.get("/api/actions/transfer-sol", getTransferSol);
app.post("/api/actions/transfer-sol", postTransferSol);

// Route handlers
function getActionsJson(req, res) {
    const payload = {
        rules: [
            { pathPattern: "/*", apiPath: "/api/actions/*" },
            { pathPattern: "/api/actions/**", apiPath: "/api/actions/**" },
        ],
    };
    res.json(payload);
}

function validatedQueryParams(query) {
    let toPubkey = new PublicKey(DEFAULT_SOL_ADDRESS);
    let amount = DEFAULT_SOL_AMOUNT;

    if (query.to) {
        try {
            toPubkey = new PublicKey(query.to);
        } catch (err) {
            throw new Error("Invalid input query parameter: to");
        }
    }

    try {
        if (query.amount) {
            amount = parseFloat(query.amount);
        }
        if (amount <= 0) throw new Error("amount is too small");
    } catch (err) {
        throw new Error("Invalid input query parameter: amount");
    }

    return { amount, toPubkey };
}

async function getTransferSol(req, res) {
    console.log("getTransferSol");
    try {
        const { toPubkey } = validatedQueryParams(req.query);
        const baseHref = `${BASE_URL}/api/actions/transfer-sol?to=${DEFAULT_SOL_ADDRESS}`;

        const payload = {
            title: "Solana SIM Coupon",
            icon: "https://coral-nearby-pigeon-319.mypinata.cloud/ipfs/QmdPTeyyo8SjndfS2bSpRTkFF3U9vpAxQ8VDZyzhHeVz3H",
            description: "For Solana Mobile holders: 0.01 SOL for 2 free months of Solana SIM! \nFor non-Solana Mobile holders: 0.01 SOL for 1 free month of Solana SIM.",
            links: {
                actions: [
                    { label: "Buy Solana SIM Coupon with 0.01 SOL", href: `${baseHref}&amount=0.01` },
                ],
            },
        };
        res.json(payload);
    } catch (err) {
        console.log("err", err);
        console.error(err);
        // handleError(res, err);
        res.status(500).json({ message: err?.message || err });
    }
}

async function postTransferSol(req, res) {
    console.log("postTransferSol");
    try {
        const { amount, toPubkey } = validatedQueryParams(req.query);
        const { account } = req.body;

        if (!account) {
            throw new Error('Invalid "account" provided');
        }

        const fromPubkey = new PublicKey(account);
        const minimumBalance = await connection.getMinimumBalanceForRentExemption(
            0,
        );
        /*
        if (amount * LAMPORTS_PER_SOL < minimumBalance) {
          throw new Error(`Account may not be rent exempt: ${toPubkey.toBase58()}`);
        }*/

        // create an instruction to transfer native SOL from one wallet to another
        const transferSolInstruction = SystemProgram.transfer({
            fromPubkey: fromPubkey,
            toPubkey: toPubkey,
            lamports: amount * LAMPORTS_PER_SOL,
        });

        const { blockhash, lastValidBlockHeight } =
            await connection.getLatestBlockhash();

        // create a legacy transaction
        const transaction = new Transaction({
            feePayer: fromPubkey,
            blockhash,
            lastValidBlockHeight,
        }).add(transferSolInstruction);

        // versioned transactions are also supported
        // const transaction = new VersionedTransaction(
        //   new TransactionMessage({
        //     payerKey: fromPubkey,
        //     recentBlockhash: blockhash,
        //     instructions: [transferSolInstruction],
        //   }).compileToV0Message(),
        //   // note: you can also use `compileToLegacyMessage`
        // );
        console.log("transaction", transaction);
        console.log("before send");
        const payload = await createPostResponse({
            fields: {
                transaction,
                message: `Successfully purchased Solana SIM Coupon. We will airdrop the coupon to your wallet soon.`,
            },
            // note: no additional signers are needed
            // signers: [],
        });
        res.json(payload);
    } catch (err) {
        res.status(400).json({ error: err.message || "An unknown error occurred" });
    }
}

app.listen(3000, () => console.log('Server ready on port 3000.'));

module.exports = app;
