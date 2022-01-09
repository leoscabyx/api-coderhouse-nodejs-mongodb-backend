process.on('message', (cant) => {
    // console.log(typeof cant)
    const numAleatorios = {}
    for (let i = 0; i < cant; i++) {
        const numAleatorio = Math.ceil(Math.random() * 1000)
        if(numAleatorios.hasOwnProperty(numAleatorio)){
            numAleatorios[numAleatorio] += 1;
        }else{
            numAleatorios[numAleatorio] = 1;
        }
    }
    process.send(numAleatorios)
    process.exit()
})

process.send('listo')