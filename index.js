const serverless = require('serverless-http');
const express = require('express');
const app = express();
const bodyParser = require('express');
const request = require('request');
const AWS = require('aws-sdk');

const API_URL = 'https://41zjk8pe6k.execute-api.us-east-1.amazonaws.com/dev/'
const USUARIOS_TABLA = process.env.USUARIOS_TABLA;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({
    strict: false
}));

app.get('/', function (req, res) {
    var mensaje = {
        "GET_personas": API_URL + "personas",
        "GET_people": API_URL + "people",
        "GET_persona_id": API_URL + "personas/:id",
        "GET_people_id": API_URL + "people/:id",
        "GET_usuarios": API_URL + "usuarios",
        "GET_usuarios_id": API_URL + "usuarios/:idUsuario",
        "POST_usuario": API_URL + "usuarios",
        "POST_usuario_body": {
            "idUsuario": "1",
            "nombres": "Juan Carlos",
            "apellidos": "Galarza Smith",
            "email": "juancagalarza@gmail.com",
            "numero_contacto": "987654899"
        }
    }

    res.json(mensaje);
})

app.get('/personas', function (req, res) {
    request('https://swapi.py4e.com/api/people', function (err, response, body) {
        if (err) {
            res.err(err);
        } else {
            var result = JSON.parse(body).results;
            var resultadoPersonas = [];

            result.forEach(element => {
                var persona = {
                    nombre: element.name,
                    altura: element.height,
                    peso: element.mass,
                    color_pelo: element.hair_color,
                    color_piel: element.skin_color,
                    color_ojos: element.eye_color,
                    fecha_nacimiento: element.birth_year,
                    genero: element.gender,
                    mundo_natal: element.homeworld,
                    peliculas_aparicion: element.films,
                    especies: element.species,
                    vehiculos: element.vehicles,
                    naves_estelares: element.starships,
                    creado: element.created,
                    editado: element.edited,
                    url: element.url
                }

                resultadoPersonas.push(persona);
            });

            res.json(resultadoPersonas);
        }
    })
})

app.get('/people', function (req, res) {
    request("https://swapi.py4e.com/api/people/?page=2&format=json", function (err, response, body) {
        if (err) {
            res.err(err)
        } else {
            var result = JSON.parse(body).results;

            res.json(result);
        }
    })
})

app.get('/personas/:id', function (req, res) {
    var id = req.params.id;

    request('https://swapi.py4e.com/api/people/' + id + '', function (err, response, body) {
        if (err) {
            res.err(err);
        } else {
            var result = JSON.parse(body);

            var persona = {
                nombre: result.name,
                altura: result.height,
                peso: result.mass,
                color_pelo: result.hair_color,
                color_piel: result.skin_color,
                color_ojos: result.eye_color,
                fecha_nacimiento: result.birth_year,
                genero: result.gender,
                mundo_natal: result.homeworld,
                peliculas_aparicion: result.films,
                especies: result.species,
                vehiculos: result.vehicles,
                naves_estelares: result.starships,
                creado: result.created,
                editado: result.edited,
                url: result.url
            }

            res.json(persona);
        }
    })
})

app.get('/people/:id', function (req, res) {
    var id = req.params.id;

    request('https://swapi.py4e.com/api/people/' + id + '', function (err, response, body) {
        if (err) {
            res.err(err);
        } else {
            var result = JSON.parse(body);

            res.json(result);
        }
    })
})

app.get('/usuarios', function (req, res) {
    var nombres = req.query.nombres;

    const params = {
        Key: {
            nombres: {S: nombres}
        },
        TableName: USUARIOS_TABLA
    };

    dynamoDb.scan(params, (error, result) => {
        if (error) {
            res.status(400).json({
                error: 'No se puede obtener usuarios'
            });
        } else {
            res.json(result.Items);
        }
    });
})

app.get('/usuarios/:idUsuario', function (req, res) {
    const params = {
        TableName: USUARIOS_TABLA,
        Key: {
            idUsuario: req.params.idUsuario
        }
    }

    dynamoDb.get(params, (error, result) => {
        if (error) {
            res.status(400).json({
                error: 'No se puede obtener usuarios'
            });
        }

        if (result) {
            res.json(result);
        } else {
            res.status(404).json({
                error: "Usuario no encontrado"
            });
        }
    })
})

app.post('/usuarios', function (req, res) {
    const {
        idUsuario,
        nombres,
        apellidos,
        email,
        numero_contacto
    } = req.body;

    const params = {
        TableName: USUARIOS_TABLA,
        Item: {
            idUsuario: idUsuario,
            nombres: nombres,
            apellidos: apellidos,
            email: email,
            numero_contacto: numero_contacto
        },
    }

    dynamoDb.put(params, (error) => {
        if (error) {
            res.status(400).json({
                error
            })
        } else {
            res.json({
                idUsuario,
                nombres,
                apellidos,
                email,
                numero_contacto
            })
        }
    })
})

app.get('*', function (req, res) {
    res.status(404).json('La ruta no está habilitada');
});

app.get('*', function (req, res) {
    res.status(404).json('La ruta no está habilitada');
});


module.exports.handler = serverless(app);