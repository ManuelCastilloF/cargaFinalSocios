const yup = require("yup");

exports.validaSociosCarga = async (data) => {
	const schema = yup.object().shape({
		apellidos: yup.string().required(),
		celular: yup.number().required(),
		codCliente: yup.number().required(),
		email: yup.string().email().required(),
		nombres: yup.string().required(),
		nroDoc: yup.number().required(),
		tipoDoc: yup.string().required(),
	});
	let lista = [];
	let malos = [];
	data.forEach(async (element) => {
		let res = schema.isValidSync(element);
		if (res) {
			lista.push(element);
		} else {
			malos.push(element);
		}
	});
	await Promise.all(lista, malos);
	return lista;
};
