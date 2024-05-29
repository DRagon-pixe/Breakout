import { Actor, CollisionType, Color, Engine, Font, FontUnit, Label, Loader, Sound, vec} from "excalibur"

// 1 - Criar uma instancia de Engine, que representa o jogo
const game = new Engine({
	width: 800,
	height: 600
})

// 2 - Criar barra do player
const barra = new Actor({
	x: 150,
	// game.drawHeight - altura do game
	y: game.drawHeight - 40,
	width: 250,
	height: 20,
	color: Color.Chartreuse,
	name: "BarraJogador"
})

barra.body.collisionType = CollisionType.Fixed

let coresBolinha = [
	Color.Black,
	Color.White,
	Color.Yellow,
	Color.Transparent,
	Color.Red,
	Color.Orange,
	Color.Azure
]

let numeroCores = coresBolinha.length

// Insere o Actor barra - player, no game
game.add(barra)

// 3 - Movimentar a barra de acordo com a posição do mouse
game.input.pointers.primary.on("move", (event) => {
	barra.pos.x = event.worldPos.x
})

// 4 - Criar o Actor bolinha
const bolinha = new Actor({
	x: Math.trunc(Math.random() * game.drawWidth),
	y: 300,
	radius: 10,
	color: Color.Red
})

bolinha.body.collisionType = CollisionType.Passive

// 5 - Criar movimentação bolinha
const velocidadeBolinha = vec(750, 750)

// Após 1 segundo (100ms), define a velocidade da bolinha em x e y = 100
setTimeout(() => {
	bolinha.vel = velocidadeBolinha
}, 1000)

// 6 - Fazer bolinha rebater na parede
bolinha.on("postupdate", () => {
	// Se a bolinha colidir com o lado esquerdo
	if (bolinha.pos.x < bolinha.width / 2) {
		bolinha.vel.x = velocidadeBolinha.x
	}

	// Se a bolinha colidir com o lado direito
	if (bolinha.pos.x + bolinha.width / 2 > game.drawWidth) {
		bolinha.vel.x = -velocidadeBolinha.x
	}

	// Se a bolinha colidir com a parte superioir
	if (bolinha.pos.y < bolinha.height / 2) {
		bolinha.vel.y = velocidadeBolinha.y
	}

	// Se a bolinha colidir com a parte inferior
	// if (bolinha.pos.y + bolinha.height / 2 > game.drawHeight) {
	// 	bolinha.vel.y = -velocidadeBolinha.y
	// }
})

// Insere bolinha no game
game.add(bolinha)

// 7 - Criar os blocos
const padding = 20

const xoffset = 65
const yoffset = 20

const colunas = 5
const linhas = 5

const corBloco = [Color.Red, Color.Orange, Color.Yellow, Color.Green, Color.Blue]

const larguraBloco = (game.drawWidth / colunas) - padding - (padding / colunas)
const alturaBloco = 30

const listaBloco: Actor[] = []

// Renderização dos bloquinhos

// Renderiza 3 linhas
for(let j = 0; j < linhas; j++) {

	// Renderiza 5 bloquinhos
	for(let i =0; i < colunas; i++) {
		listaBloco.push(
			new Actor({
				x:xoffset + i * (larguraBloco + padding) + padding,
				y: yoffset + j * (alturaBloco + padding) + padding,
				width: larguraBloco,
				height: alturaBloco,
				color: corBloco[j]
			})
		)
	}

}

listaBloco.forEach( bloco => {
	// Define o tipo de colisor de cada bloco
	bloco.body.collisionType = CollisionType.Active

	// Adiciona cada bloco no game
	game.add(bloco)
})

// let pontos = 0

// const textoPontos = new Text({
// 	text: "Hello World",
// 	font: new Font({ size: 30})
// })

// const objetoTexto = new Actor({
// 	x: game.drawWidth - 80,
// 	y: game.drawHeight - 15
// })

// objetoTexto.graphics.use(textoPontos)

// game.add(objetoTexto)

// Quando colidir, ativa o som
const bateu = new Sound('./src/soound/BATER.wav');
const dead = new Sound('./src/soound/Morreu.wav');
const victory = new Sound('./src/soound/Victory.wav')
const carrega = new Loader([bateu, dead, victory])

let pontos = 0
const textoPontos = new Label({
	text: pontos.toString(),
	font: new Font({
		size: 40,
		color: Color.White,
		strokeColor: Color.Black,
		unit: FontUnit.Px
	}),
	pos: vec(725, 525)
})

game.add(textoPontos)

let colidindo: boolean = false

bolinha.on("collisionstart", (event) => {
	// erificar se a bolinha colidiu com algum bloco destrutivel
	// console.log("Colidiu com: ", event.other);

	
	// Se o elemento colidido for um bloco da lista de blocos (destrutivel)
	if (listaBloco.includes(event.other)) {
		// Destruir o bloco colidido
		event.other.kill()
		
		// Adiciona um ponto
		pontos++

		bolinha.color = coresBolinha [Math.trunc( Math.random() * numeroCores)]
		
		// Atualiza valor do placar - textoPontos
		textoPontos.text = pontos.toString();
		
		bateu.play(1.0)
	}

	if (pontos >= 25) {
		victory.play(1.0)
		alert("Você venceu!!!")
		window.location.reload()
	}
	
	// Rebater a bolinha - Inverter as direções x e y
	// "minimum translation vector" is a vector 'normalize()'
	let interseccao = event.contact.mtv.normalize()
	
	// Se não tá colidindo
	// colididindo == false => !colidindo
	console.log("Colidindo:", colidindo);
	
	
	if (!colidindo) {
		colidindo = true
		
		// interseccao.x e interseccao.y
		// O maior representa o eixo onde houve o contato
		if ( Math.abs(interseccao.x) > Math.abs(interseccao.y)) {
			// bolinha.vel.x = -bolinha.vel.x
			// bolinha.vel.x *= -1
			console.log("Eixo X");
			
			bolinha.vel.x = bolinha.vel.x * -1
		} else {
			// bolinha.vel.y = -bolinha.vel.y
			// bolinha.vel.y *= -1
			bolinha.vel.y = bolinha.vel.y * -1
			console.log("Eixo Y");
		}
	}
})

bolinha.on("collisionend", () => {
	colidindo = false
})

// bolinha.on("collisionstart", () => {
	// 	console.log("colidiu")
	// })
	
	bolinha.on("exitviewport", () => {
		dead.play(1.0)
		alert("E MORREU")
		window.location.reload()
	})
	
	
	// Inicia o game
	
	await game.start(carrega)