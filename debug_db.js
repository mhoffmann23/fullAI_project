const mongoose = require('mongoose');

console.log('--- DIAGNOSTIKA PŘIPOJENÍ ---');
console.log('ENV MONGO_URI:', process.env.MONGO_URI ? 'Nastaveno (tajné)' : 'NENASTAVENO!');

if (!process.env.MONGO_URI) {
    console.error('CHYBA: Proměnná MONGO_URI není nastavena!');
    process.exit(1);
}

// Zkusíme se připojit
console.log('Pokus o připojení...');
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // 5 sekund timeout
})
.then(() => {
    console.log('✅ PŘIPOJENO! Databáze funguje.');
    process.exit(0);
})
.catch(err => {
    console.error('❌ CHYBA PŘIPOJENÍ:', err.message);
    if (err.message.includes('bad auth')) {
        console.log('TIP: Zkontroluj heslo a uživatelské jméno.');
    } else if (err.message.includes('cluster unavailable')) {
        console.log('TIP: Zkontroluj IP whitelist na Atlasu (0.0.0.0/0) a název clusteru.');
    }
    process.exit(1);
});
