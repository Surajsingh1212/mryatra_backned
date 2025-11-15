const bcrypt = require("bcrypt");

async function makeHash() {
    const password = "Aavyamryatra@230623";  // correct password
    const hashed = await bcrypt.hash(password, 10);
    console.log("Your hashed password: ", hashed);
}
makeHash();

