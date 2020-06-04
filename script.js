var printings;
var cards = [];

function initPrintings(json) {
	printings = json;
}

function load(lines) {
	cards = [];
	let unrecognized = [];
	for (let line of lines) {
		let trimmed = line.trim();
		if (trimmed && !trimmed.startsWith('#')) {
			if (printings[trimmed]) {
				cards.push({ name: trimmed, index: 0 });
			} else {
				unrecognized.push(line);
			}
		}
	}

	let message = document.getElementById('message');
	if (cards.length) {
		hide(message);
		loadImages();
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

function loadImages(card) {
	let viewer = document.getElementById('viewer');
	clear(viewer);
	for (let card of cards) {
		let pic = document.createElement('img');
		pic.className = 'small';
		pic.src = getSrc(printings[card.name][0].id);
		pic.onclick = function(e) {
			if (e.ctrlKey) {
				selected = card;
				showPrintingsDialog(card, pic);
			} else {
				let mod = printings[card.name].length
				let dir = e.shiftKey ? -1 : 1;
				card.index = (((card.index + dir) % mod) + mod) % mod;
				pic.src = getSrc(printings[card.name][card.index].id);
			}
		};
		viewer.appendChild(pic);
	}
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
		case 'Enter':
			navigator.clipboard.writeText(cards.map(function(card) {
				let printing = printings[card.name][card.index];
				return card.name + ' (' + printing.code + ')';
			}).join('\n'));
		default:
	}
}
