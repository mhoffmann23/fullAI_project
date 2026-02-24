const mongoose = require('mongoose');

// Přečti URI z argumentu příkazové řádky nebo proměnné prostředí
const uri = process.argv[2] || process.env.MONGO_URI;

if (!uri) {
    console.error('CHYBA: Musíš zadat connection string!');
    console.log('Použití: node test-atlas.js "mongodb+srv://..."');
    process.exit(1);
}

console.log('---------------------------------------------------');
console.log('TEST PŘIPOJENÍ K MONGODB ATLAS');
console.log('---------------------------------------------------');
console.log(`Zkouším se připojit k: ${uri.replace(/:([^:@]+)@/, ':****@')}`); // Skryje heslo v logu

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    console.log('\n✅ ÚSPĚCH! Připojení funguje.');
    console.log('Databáze je dostupná a přihlašovací údaje jsou správné.');
    mongoose.connection.close();
})
.catch(err => {
    console.log('\n❌ CHYBA PŘIPOJENÍ:');
    console.log(err.message);
    
    console.log('\nMOŽNÉ PŘÍČINY:');
    if (err.message.includes('bad auth')) {
        console.log('1. Špatné heslo nebo uživatelské jméno.');
        console.log('   - Zkontroluj, zda jsi v URL nahradil <password> skutečným heslem.');
        console.log('   - Pokud máš v hesle speciální znaky (@, :, /), musí být tzv. URL encoded.');
    } else if (err.message.includes('ECONNREFUSED') || err.message.includes('cluster unavailable')) {
        console.log('2. IP adresa je blokovaná (Network Access).');
        console.log('   - Jdi na MongoDB Atlas -> Network Access.');
        console.log('   - Ujisti se, že tam máš IP adresu "0.0.0.0/0" (Allow Access from Anywhere).');
    } else {
        console.log('3. Jiná chyba sítě nebo nastavení firewallu.');
    }
});
