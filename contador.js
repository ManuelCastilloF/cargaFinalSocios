const admin = require("firebase-admin");
const ObjectsToCsv = require("objects-to-csv");
const serviceAccount = require("./pos-firebase.json");
const fs = require("fs");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

// const moment = require("moment");
const db = admin.firestore();

async function creaArchivo(data, nombre) {
	try {
		let csvData = new ObjectsToCsv(data);
		await csvData.toDisk(`${nombre}.csv`);
	} catch (error) {
		console.log(error);
	}
}

async function hayarDiferentes(data1, data2, valor) {
	let diferentes = [],
		iguales = [];
	data1.forEach(async (e) => {
		let flag = false;
		data2.forEach((e2) => {
			if (e2[valor] === e[valor]) {
				iguales.push(e);
				flag = true;
			}
		});
		if (!flag) diferentes.push(e);
	});
	console.log("dif", diferentes.length, "iguales", iguales.length);
	return diferentes;
}

async function data() {
	try {
		const querySocios = await db.collection("socios").get();
		const queryCodAfilia = await db.collection("codAfilia").get();
		const querySocAuth = await admin.auth().listUsers();
		const socios = await Promise.all(
			querySocios.docs.map(async (socio) => ({
				id: socio.id,
				...socio.data(),
			}))
		);
		const codAfilia = await Promise.all(
			queryCodAfilia.docs.map(async (socio) => ({
				id: socio.id,
				...socio.data(),
			}))
		);
		const socAuth = await Promise.all(
			querySocAuth.users.map(async (socio) => socio)
		);
		// await Promise.all(socios, codAfilia, socAuth);
		return { socios, codAfilia, socAuth };
	} catch (error) {
		console.log(error.message);
		return;
	}
}

async function contar() {
	const resp = await data();
	const { socios, codAfilia, socAuth } = resp;

	fs.writeFileSync("./json/socios.json", JSON.stringify(socios));
	fs.writeFileSync("./json/codAfilia.json", JSON.stringify(codAfilia));
	fs.writeFileSync("./json/socAuth.json", JSON.stringify(socAuth));

	await creaArchivo(socios, "./csv/socios");
	await creaArchivo(codAfilia, "./csv/codAfilia");
	await creaArchivo(socAuth, "./csv/socAuth");
	console.log(
		`T Socios: ${socios.length} , T CodAuth: ${codAfilia.length}, T SocAuth: ${socAuth.length}`
	);
	console.log(":) ok");
	const resp1 = await hayarDiferentes(socios, codAfilia, "uid");
	// console.log(resp1);
	const resp2 = await hayarDiferentes(socAuth, socios, "uid");
	const resp3 = await hayarDiferentes(socAuth, codAfilia, "uid");
	const resp4 = await hayarDiferentes(resp3, resp2, "uid");
}

contar();
