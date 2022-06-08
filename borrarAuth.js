const admin = require("firebase-admin");
const serviceAccount = require("./pos-firebase.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const borra = async () => {
	console.log("Inicio");
	const listUsersResult = await admin.auth().listUsers();
	let lista = [];
	let noLista = [];
	listUsersResult.users.forEach((userRecord) => {
		let e = userRecord.metadata.creationTime.substring(5, 16);
		console.log(e);
		if (e === "07 Jun 2022") {
			lista.push(userRecord.toJSON());
		} else {
			noLista.push(userRecord.toJSON());
		}
	});
	console.log("-", lista.length, noLista.length, listUsersResult.users.length);
	lista.map(async (socio) => {
		console.log(socio.uid);
		let uid = socio.uid;
		admin
			.auth()
			.deleteUser(uid)
			.then(() => {
				console.log("Successfully deleted user", socio.uid);
			})
			.catch((error) => {
				console.log("Error deleting user:", error);
			});
	});
	return;
};

borra();
