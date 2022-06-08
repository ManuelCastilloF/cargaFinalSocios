const admin = require("firebase-admin");
const moment = require("moment-timezone");
const uuid = require("uuid");
const fs = require("fs");
const ObjectsToCsv = require("objects-to-csv");
const serviceAccount = require("./pos-firebase.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

// const moment = require("moment");
const db = admin.firestore();

exports.creaSocAuth = async (socio) => {
	try {
		const socioRecord = await admin.auth().createUser({
			email: socio.email,
			emailVerified: false,
			password: "demo12",
			displayName: socio.nombres,
			disabled: false,
		});
		console.log(socioRecord.uid);
		let uid = socioRecord.uid;
		return { flag: true, uid };
	} catch (error) {
		console.error("auth", error);
		return { flag: false };
	}
};

exports.newSocio = async (socio) => {
	try {
		socio.fRegistro = moment.tz(moment(), "America/Lima").format("YYYY/MM/DD");
		await db.collection("socios").doc(socio.uid).set(socio);
		return { flag: true, socio };
	} catch (error) {
		console.error("newSocio", error);
		return { flag: false };
	}
};

exports.crearBaseAfiliados = async (socio) => {
	const max = 999999;
	const min = 100000;
	let id = socio.uid;
	// ---- generamos claves de 6 digitos ( 10000 >=clave <= 999 999)
	let clave = Math.floor(Math.random() * (max - min + 1) + min);
	// --- genramos token alfanumerico
	let token = uuid.v4();
	let url = `https://zona-privada.coopeconti.pe/afilia/paso1/${token}`;
	socio.idSocio = id;
	socio.clave = clave;
	socio.token = token;
	socio.url = url;
	socio.flag = false;
	socio.fEnviado = "";
	socio.enviado = false;
	socio.grupoEnvio = "nuevo";
	socio.contador = 0;
	try {
		await db.collection("codAfilia").doc(token).set(socio);
		return { flag: true, socio };
	} catch (error) {
		console.error("codAfil", error);
		return { flag: false };
	}
};

exports.leeFile = async () => {
	const dataArray = fs.readFileSync("./socios.txt", "utf-8");
	const cargaInicial = await crearJson(dataArray, "|");
	console.log(cargaInicial.length);
	return cargaInicial;
};

async function crearJson(array, spTab) {
	// console.log(array);
	var jArray = [];
	var arrayOne = array.split(/;?\r\n|;?\n|;?\r/);

	var header = arrayOne[0].split(spTab);
	var noOfRow = arrayOne.length;
	var noOfCol = header.length;
	for (let i = 1; i < noOfRow - 1; i++) {
		var obj = {};
		var myNewLine = arrayOne[i].split(spTab);
		for (let j = 0; j < noOfCol; j++) {
			var headerText = header[j];
			var valueText = myNewLine[j];
			obj[headerText] = valueText;
		}
		jArray.push(obj);
	}
	return jArray;
}

exports.creaArchivo = async (data, nombre) => {
	const csvData = new ObjectsToCsv(data);
	await csvData.toDisk(`${nombre}.csv`);
};

exports.hayarDiferentes = async (data1, data2, valor) => {
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
};
