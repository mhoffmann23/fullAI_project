const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('--- GENERÁTOR CONNECTION STRINGU PRO MONGODB ATLAS ---');
console.log('Tento nástroj ti pomůže vytvořit správný odkaz a ošetří speciální znaky v hesle.\n');

rl.question('1. Zadej své uživatelské jméno (Username): ', (username) => {
    rl.question('2. Zadej své heslo (Password): ', (password) => {
        rl.question('3. Zadej adresu clusteru (např. cluster0.abcde.mongodb.net): ', (cluster) => {
            
            // Ošetření speciálních znaků v hesle a jméně
            const encodedUser = encodeURIComponent(username.trim());
            const encodedPass = encodeURIComponent(password.trim());
            const cleanCluster = cluster.trim().replace('mongodb+srv://', '').replace('/', '');

            const connectionString = `mongodb+srv://${encodedUser}:${encodedPass}@${cleanCluster}/geo-shooter?retryWrites=true&w=majority`;

            console.log('\n---------------------------------------------------');
            console.log('✅ TVŮJ SPRÁVNÝ CONNECTION STRING:');
            console.log('---------------------------------------------------');
            console.log(connectionString);
            console.log('---------------------------------------------------');
            console.log('\nCO S TÍM DÁL?');
            console.log('1. Zkopíruj tento celý řádek.');
            console.log('2. Jdi na Render.com -> Dashboard -> Tvůj projekt -> Environment.');
            console.log('3. Uprav proměnnou MONGO_URI a vlož tam tento nový řetězec.');
            console.log('4. Ulož změny (Save Changes) - Render by měl aplikaci restartovat.');

            rl.close();
        });
    });
});
