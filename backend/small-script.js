const bcrypt = require("bcrypt");

const saltRounds = 10;
const text = process.argv[2]; // Get input from command-line arguments

if (!text) {
    console.error("Please provide a string to hash.");
    process.exit(1);
}

async function hashText(input) {
    try {
        const hashedText = await bcrypt.hash(input, saltRounds);
        console.log("Original Text:", input);
        console.log("Hashed Text:", hashedText);
    } catch (error) {
        console.error("Error hashing text:", error);
    }
}

hashText(text);
