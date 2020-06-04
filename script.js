var printings;
var cards = [];

function initPrintings(json) {
	printings = json;
}

function load(lines) {
	cards = [];
	let unrecognized = [];
	
	let viewer = document.getElementById('viewer');
	clear(viewer);
	
	for (let line of lines) {
		let trimmed = line.trim();
		if (trimmed && !trimmed.startsWith('#')) {
			if (printings[trimmed]) {
				let card = createCard(trimmed);
				cards.push(card);
			} else {
				unrecognized.push(line);
			}
		}
	}

	let message = document.getElementById('message');
	if (cards.length) {
		hide(message);
		for (let card of cards) {
			viewer.appendChild(card.node);
		}
		if (unrecognized.length) {
			showUnrecognizedCards(unrecognized);
		}
	} else {
		show(message);
		message.innerText = 'No cards found!';
	}
}

function clear(node) {
	while (node.firstChild) {
		node.lastChild.remove();
	}
}

function createCard(name) {
	let pic = document.createElement('img');
	
	let card = {
		name: name,
		index: 0,
		node: pic
	};
	
	pic.className = 'small';
	pic.src = getSrc(printings[card.name][0].id);
	pic.onclick = function(e) {
		rotateImage(card, e.shiftKey ? -1 : 1);
	};
	pic.onmouseover = function() {
		selected = card;
	}

	return card;
}

function rotateImage(card, dir) {
	let mod = printings[card.name].length
	card.index = (((card.index + dir) % mod) + mod) % mod;
	card.node.src = getSrc(printings[card.name][card.index].id);
}

function getSrc(id) {
	return `https://img.scryfall.com/cards/small/front/${id[0]}/${id[1]}/${id}.jpg`;
}

function showPrintingsDialog(card, pic) {
	let dialog = document.getElementById('printings')
	let list = document.getElementById('printingList');
	clear(list);
	let printingsOfCard = printings[card.name]
	for (let i = 0; i < printingsOfCard.length; i++) {
		let printing = printingsOfCard[i];
		let tag = document.createElement('div');
		tag.innerText = printing.code + ' #' + printing.number;
		tag.className = 'printingTag';
		tag.onclick = function() {
			card.index = i;
			pic.src = getSrc(printings[card.name][card.index].id);
			hide(dialog);
		};
		list.appendChild(tag);
	}
	show(dialog);
}

function showUnrecognizedCards(lines) {
	let list = document.getElementById('unrecognizedList');
	clear(list);
	for (let line of lines) {
		let li = document.createElement('li');
		li.innerText = line;
		list.appendChild(li);
	}
	show(document.getElementById('unrecognized'));
}

function closeDialog() {
	hide(document.getElementById('unrecognized'));
}

function handleFileSelect(e) {
	e.stopPropagation();
	e.preventDefault();
	var files = e.dataTransfer.files;
	for (let file of files) {
		var reader = new FileReader();
		reader.onload = function(e1) {
			load(e1.target.result.split(/\r?\n/));
		}
		reader.readAsText(file, 'UTF-8');
	}
}

function handleDragOver(e) {
	e.stopPropagation();
	e.preventDefault();
	e.dataTransfer.dropEffect = 'copy';
}

function show(node, state = false) {
	node.classList.toggle('hide', state);
}

function hide(node) {
	show(node, true);
}

window.onkeydown = function(e) {
	switch (e.key) {
		case 'ArrowLeft':
			rotateImage(selected, -1);
			break;
		case 'ArrowRight':
			rotateImage(selected, 1);
			break;
		case 'Enter':
			navigator.clipboard.writeText(cards.map(function(card) {
				let printing = printings[card.name][card.index];
				return card.name + ' (' + printing.code + ')';
			}).join('\n'));
			break;
		default:
	}
}
