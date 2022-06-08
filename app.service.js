const serv = require("./util.service.js");
const valid = require("./valida.service.js");

async function app() {
	const lista = await serv.leeFile();
	await serv.creaArchivo(lista, "carga");
	const listaValida = await valid.validaSociosCarga(lista);
	await serv.creaArchivo(listaValida, "cargaValidada");
	let authSocios = [];
	let newSocios = [];
	let newCodSoc = [];
	try {
		await Promise.all(
			listaValida.map(async (socio) => {
				let respAuth = await serv.creaSocAuth(socio);
				if (respAuth.flag === false) return;
				socio.uid = respAuth.uid;
				authSocios.push(socio);
				console.log("paso 1", socio.uid);
				let respSocio = await serv.newSocio(socio);
				console.log(respSocio.flag, respSocio);
				if (respSocio.flag === false) return;
				newSocios.push(respSocio.socio);
				console.log("paso 2", respSocio.socio.uid);
				let respCodAfilia = await serv.crearBaseAfiliados(socio);
				if (respCodAfilia.flag === false) return;
				newCodSoc.push(respCodAfilia.socio);
				console.log("Paso 3", respCodAfilia.socio.token);
				return;
			})
		);
		Promise.all(authSocios, newSocios, newCodSoc);
		console.log("OK");
		return;
	} catch (error) {
		console.log(error);
		return;
	}
}

app();
