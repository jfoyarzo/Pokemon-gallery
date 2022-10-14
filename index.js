//Se inicializan constantes con los módulos de Node a utilizar
const axios = require('axios')
const http = require('http')
const fs = require('fs')

//Se define una variable global como un arreglo vacío, que luego será populado por los datos
let pokemonesAll = []

//Se define una clase para poder instanciar el objeto y sumarlo al arreglo
class Pokemon {
    constructor(img,nombre){
        this.img = img
        this.nombre = nombre
    }
}

//Función asíncrona para obtener la info principal del primer endpoint
const getPokemon = async() =>{
    const {data} = await axios.get('https://pokeapi.co/api/v2/pokemon/?limit=130')
    return data.results
}

//Función asíncrona para obtener los detalles de cada pokemon
const getDetalles = async(nombre)=>{
    const {data} = await axios.get(`https://pokeapi.co/api/v2/pokemon/${nombre}`)
    return data
}

//Ejecución de la promesa, para luego procesar el resultado y popular el arreglo 'pokemonesAll' con las promesas correspondientes a cada pokemon
getPokemon().then((result)=>{
    result.forEach(e => {
        let nom = e.name                
            pokemonesAll.push(getDetalles(nom))       
    });
})

//Se crea el servidor con 'http'
http.createServer((req,res)=>{

    //Habilitación de ruta raíz para devolver el contenido del archivo 'index.html'
    if(req.url == '/'){
        fs.readFile('index.html', 'utf-8', (err, data)=>{
            res.writeHead(200, {"Content-Type": "text/html"})
            res.end(data)
        })
    }

    //Habilitación de ruta para entregar los resultados en formato Json
    if(req.url == '/pokemones'){       
        
            //Se ejecutan mediante 'Promise.all' las promesas guardadas en 'pokemonesAll', para luego extraer la información necesaria e instanciar el objeto Pokemon en la variable 'template', la cual es posteriormente guardada en el arreglo 'resultado'.
            Promise.all(pokemonesAll).then((result)=>{
                let resultado = []
                
                result.forEach((e)=>{
                    let template = new Pokemon(e.sprites.front_default, e.name)
                    resultado.push(template)
                })              
                
                //Se formatea el contenido del arreglo a Json mediante el método 'stringify' y se devuelve en la respuesta con la cabecera correspondiente
                let resJson = JSON.stringify(resultado)                
                res.writeHead(200, {'Content-Type':'application/json'})
                res.end(resJson)
            })
        
    }
})
.listen(3000, ()=>console.log('Servidor levantado y listo para entregar resultados'))