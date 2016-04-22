$(function(){

	$(window).scroll(function(){
		$(this).scrollTop(0);
	});

	var board = [];

	var coords = [0, 0],
		tile = null;

	var ele = {
		page: $('#page'),
		game: $('#game'),
		board: $('#board'),
		map: $('#map'),
		sprite: $('#sprite')
	};

	var sounds = {};
	$('.sound').each(function(ele){
		sounds[this.id] = this;
	});
	console.log(sounds);

	var key = null,
		animating = false,
		running = false,
		victory = false,
		puzzle = false;

	var resetGame = function(){
		victory = false;
		running = true;
		coords = [0, 0];
		board = [
			[
				{
					type: "start",
					opened: true
				},
				{
					type: "event",
					event: "pop-quiz"
				},
				{
					type: "event",
					event: "video-challenge"
				},
			], [
				{
					type: "event",
					event: "pop-quiz"
				},
				{
					type: "event",
					event: "video-challenge"
				},
				{
					type: "event",
					event: "prize"
				},
			], [
				{
					type: "event",
					event: "video-challenge"
				},
				{
					type: "puzzle",
					event: "puzzle"
				},
				{
					type: "event",
					event: "enemy"
				},
			], [
				{
					type: "event",
					event: "points"
				},
				{
					type: "event",
					event: "prize"
				},
				{
					type: "event",
					event: "pop-quiz"
				}
			], [
				{
					type: "event",
					event: "enemy"
				},
				{
					type: "event",
					event: "pop-quiz"
				},
				{
					type: "finish"
				}
			]
		];
		tile = board[0][0];
		drawBoard();
		ele.sprite.css({
			top: '25px',
			left: '60px'
		});
		$('#title').fadeOut();
		sounds.title_theme.volume = 1;
		var fadeOutAudio = setInterval(function(){
			sounds.title_theme.volume -= 0.1;
			if(sounds.title_theme.volume < 0.1){
				clearInterval(fadeOutAudio);
				sounds.title_theme.pause();
			}
		}, 200)
	}

	var drawBoard = function(){
		var html = '',
			plot = [0, 0];
		board.forEach(function(row){
			html += '<div class="row">';
			row.forEach(function(col){
				//console.log(plot);
				var classes = ['col', col.type];

				if(coords[0] == plot[0] && coords[1] === plot[1]){
					classes.push('current');
				}
				if(col.opened){
					classes.push('opened');
				}
				if(col.event){
					classes.push(col.event);
				}


				html += '<div class="' + classes.join(' ') + '"></div>';
				plot[1]++;
			});
			html += '</div>';
			plot[1] = 0;
			plot[0]++
		});
		ele.map.html(html);
	};

	var lookupTile = function(plot){
		if(plot[0] < 0){
			throw new Error('cannot move up (off board)');
		}
		if(plot[0] > board.length-1){
			throw new Error('cannot move down (off board)');
		}
		if(plot[1] < 0){
			throw new Error('cannot move left (off board)');
		}
		if(plot[1] > board[plot[0]].length-1){
			throw new Error('cannot move right (off board)');
		}
		if(board[plot[0]][plot[1]].opened){
			// if we can move to this piece, then prevent the event
			throw new Error('cannot move to already visited tile');
		}
		return board[plot[0]][plot[1]];
	}

	var animateSprite = function(direction, callback){
		animating = true;
		sounds.travel.currentTime = 0;
		sounds.travel.play();
		ele.sprite.addClass(direction);
		ele.sprite.animate({
			top: coords[0] * 192 + 25,
			left: coords[1] * 226 + 60
		}, 2350, function(){
			animating = false;
			ele.sprite.removeClass('up down left right')
			sounds.travel.pause();
			return callback();
		});
	}

	var move = function(direction){
		if(!running || animating){
			return;
		}
		var dest = [0, 0];
		switch(direction){
			case "up":
				dest[0]--;
			break;
			case "down":
				dest[0]++;
			break;
			case "left":
				dest[1]--;
			break;
			case "right":
				dest[1]++;
			break;
		}
		console.log(coords, dest);
			calcDest = [
				coords[0] + dest[0],
				coords[1] + dest[1]
			];
		try{
			tile = lookupTile(calcDest);
		}catch(err){
			return console.log(err);
		}
		coords = calcDest;
		animateSprite(direction, function(){
			drawBoard();
			if(!tile.opened){
				tile.opened = true;
				switch(tile.type){
					case "event":
						var title = $('#' + tile.event);
						title.addClass('active');
						if(sounds['titles_' + tile.event]){
							sounds['titles_' + tile.event].play();
						}else{
							sounds.travel_stop.play();
						}
					break;
					case "puzzle":
						$('#puzzle').addClass('active');
						//sounds.titles_puzzle.play();
						sounds.travel_stop.play();
						puzzle = true;
					break;
					case "finish":
						victory = true;
						running = false;
						$('.titles.active').removeClass('active');
						$('#goal').addClass('active');
						sounds.travel_stop.play();
						console.log('FINISH');
					break;
				}
			}
		});
	};

	var showPuzzle = function(id){
		if(!puzzle){ return; }
		if(id < 1 || id > 5){ return console.log('Invalid puzzle provided:', id); }
		console.log('puzzle', id);
		$('#puzzleBg').show();
		$('.puzzleImg').fadeOut();
		$('#puzzle_' + id).fadeIn();
	}

	var scaleGame = function(){
		var heightDif = $(window).height() / 1037,
			widthDif = $(window).width() / 1570;

		ele.game.css({
			transform: 'scale(1)',
			right: 0,
			top: 0
		});
		ele.page.css({
			width: $(window).width(),
			top: 0
		});

		if(heightDif < 1 || widthDif < 1){
			var limit = 1;
			if(widthDif < heightDif){
				limit = widthDif;
			}else{
				limit = heightDif
			}
			ele.game.css({
				transform: 'scale(' + limit + ')',
			});
			var offset = ele.game.offset();
			if($(window).width() >= 1920){
				offset.left = 0;
			}
			ele.game.css({
				top: '-' + offset.top + 'px',
				right: offset.left + 'px'
			});
			ele.page.css({
				width: ele.game[0].getBoundingClientRect().width,
				top: ($(window).height() - ele.game[0].getBoundingClientRect().height)/2
			});
		}
	}
	$(window).resize(scaleGame);
	scaleGame();
	$(window).keydown(function(e){
		if(key !== null){
			return;
		}
		switch(e.keyCode){
			case 32:
				if(puzzle){
					$('#puzzleBg').hide();
					$('.puzzleImg').fadeOut();
					puzzle = false;
					return;
				}
				$('.titles.active').removeClass('active');
				if(!running){
					if(victory){
						victory = false;
						$('#title').fadeIn();
					}else{
						resetGame();
					}
				}
				return;
			break;
			case 37:
			case 65:
				key = 'left'
			break;
			case 38:
			case 47:
				key = 'up'
			break;
			case 39:
			case 68:
				key = 'right';
			break;
			case 40:
			case 123:
				key = 'down';
			break;
			case 17:
				return $('#sponsorship').fadeToggle();
			break;
			case 49:
			case 50:
			case 51:
			case 52:
			case 53:
			case 54:
			case 55:
			case 56:
			case 57:
				return showPuzzle(e.keyCode-48);
			break;
			default:
				return console.log('Keypress', e.keyCode);
			break;
		}
		move(key);
	});
	$(window).keyup(function(e){
		key = null;
	});
});