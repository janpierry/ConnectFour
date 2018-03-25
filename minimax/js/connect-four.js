// Jogo criado por Gimu. Disponibilizado no GitHub: https://github.com/Gimu/connect-four-js/
// Modificado por Jan e Fran para trabalho da disciplina de Sistemas Inteligentes

function Game() {
    this.rows = 6; // Altura
    this.columns = 7; // Largura
    this.status = 0; // Status do jogo: 0 = running, 1 = won, 2 = lost, 3 = tie
    this.depth = 6; // Profundidade da busca (escolhida por padrão como 6)
    this.score = 100000, // Win/loss score
    this.round = 0; // 0: Human, 1: Computer
    this.winning_array = []; // Winning (chips) array
    this.iterations = 0; // Contador de iterações
    
    that = this;

    that.init();
}

//Inicia o jogo
Game.prototype.init = function() {
    // Generate 'real' board
    // Create 2-dimensional array
    var game_board = new Array(that.rows);
    for (var i = 0; i < game_board.length; i++) {
        game_board[i] = new Array(that.columns);

        for (var j = 0; j < game_board[i].length; j++) {
            game_board[i][j] = null;
        }
    }

    // Create from board object (see board.js)
    this.board = new Board(this, game_board, 0);

    // Generate visual board
    var game_board = "<col/><col/><col/><col/><col/><col/><col/>";
    for (var i = 0; i < that.rows; i++) {
        game_board += "<tr>";
        for (var j = 0; j < that.columns; j++) {
            game_board += "<td class='empty'></td>";
        }
        game_board += "</tr>";
    }

    document.getElementById('game_board').innerHTML = game_board;

    // Action listeners
    var td = document.getElementById('game_board').getElementsByTagName("td");

    for (var i = 0; i < td.length; i++) {
        if (td[i].addEventListener) {
            td[i].addEventListener('click', that.act, false);
        } else if (td[i].attachEvent) {
            td[i].attachEvent('click', that.act)
        }
    }
}

/**
 * On-click event
 */
Game.prototype.act = function(e) {
    var element = e.target || window.event.srcElement;

    // Check if not in animation and start with human
    if (!($('#coin').is(":animated"))) {
        if (that.round == 0) {
            that.place(element.cellIndex);
        }
    }
}

/**
 * Place coin
 */
Game.prototype.place = function(column) {
    // If not finished
    if (that.board.score() != that.score && that.board.score() != -that.score && !that.board.isFull()) {
        for (var y = that.rows - 1; y >= 0; y--) {
            if (document.getElementById('game_board').rows[y].cells[column].className == 'empty') {
                if (that.round == 1) {
                    var coin_x = column * 51;
                    var coin_y = y * 51;
                    $('#coin').attr('class', 'cpu-coin').css({'left': coin_x}).fadeIn('fast').animate({'top': coin_y + 'px'}, 700, 'easeOutBounce', function() {
                        document.getElementById('game_board').rows[y].cells[column].className = 'coin cpu-coin';
                        $('#coin').hide().css({'top': '0px'});
                        
                        if (!that.board.place(column)) {
                            return alert("Invalid move!");
                        }

                        that.round = that.switchRound(that.round);
                        that.updateStatus();
                    });
                } else {
                    var coin_x = column * 51;
                    var coin_y = y * 51;
                    $('#coin').attr('class', 'human-coin').css({'left': coin_x}).fadeIn('fast').animate({'top': coin_y + 'px'}, 700, 'easeOutBounce', function() {
                        document.getElementById('game_board').rows[y].cells[column].className = 'coin human-coin';
                        $('#coin').hide().css({'top': '0px'});
                        that.generateComputerDecision();
                        
                        if (!that.board.place(column)) {
                            return alert("Invalid move!");
                        }

                        that.round = that.switchRound(that.round);
                        that.updateStatus();
                    });
                }
                break;
            }
        }
    }
}

// Gera a decisão do Computador
Game.prototype.generateComputerDecision = function() {
    if (that.board.score() != that.score && that.board.score() != -that.score && !that.board.isFull()) {
        that.iterations = 0; // Reset iteration count
        document.getElementById('loading').style.display = "block"; // Loading message

        // AI is thinking
        setTimeout(function() {
            // Pega o tempo em que o Computador começa a pensar
            var startzeit = new Date().getTime();

            // Chama o método que vai decidir a jogada da máquina segundo o algoritmo Minimax
            var ai_move = that.funcaoMax(that.board, that.depth);
	    
            // Como o fim do algoritmo, ele pega o tempo denovo e diminui dele o tempo anteriormente medido, tendo assim, o tempo que o Computador levou para pensar na jogada
            var laufzeit = new Date().getTime() - startzeit;
            document.getElementById('ai-time').innerHTML = laufzeit.toFixed(2) + 'ms';

            // Place ai decision
            that.place(ai_move[0]);

            // Debug
            document.getElementById('ai-iterations').innerHTML = that.iterations;

            document.getElementById('loading').style.display = "none"; // Remove loading message
        }, 100);
    }
}

//Algoritmo Minimax
  /* 

    * Funciona da seguinte forma, a função funcaoMax vai, para cada uma das jogadas possíveis, chamar a função funcaoMin, passando como parâmetro o tabuleiro após a jogada possível e a profundidade (depth) - 1. A função min vai agir de forma semelhante, ou seja, vai ser uma chamada recursiva até a profundidade definida (no caso 6). No fim da recursão, as funções vão retornando seus min/max para que a função acima decida qual deve ser retornado.

  */
//Função Max
Game.prototype.funcaoMax = function(board, depth) {
    // Calcula a pontuação do tabuleiro
    var score = board.score();

    // Verifica se com isso o jogo acabou para parar de buscar
    if (board.isFinished(depth, score)) return [null, score];

    // Cria um array max cuja posição 0 é null para indicar que ainda nao tem nenhum e a pontuação é -999999 para garantir que o próximo será maior que ele
    var max = [null, -99999];

    // Verifica cada possibilidade de jogada
    for (var column = 0; column < that.columns; column++) {
        var new_board = board.copy(); // Cria uma cópia do tabuleiro

        if (new_board.place(column)) {

            that.iterations++; // Aumenta o número de iterações para comparar com o algoritmo de Poda
	    
	    //Chama a função min
            var next_move = that.funcaoMin(new_board, depth - 1); // Chamada recursiva

            // Verifica se o resultado do min (next_move) é maior do que o atual candidato a max
            if (max[0] == null || next_move[1] > max[1]) {
                max[0] = column;
                max[1] = next_move[1];
            }
        }
    }

    return max;
}


//Função Min
Game.prototype.funcaoMin = function(board, depth) {
    // Calcula a pontuação do tabuleiro
    var score = board.score();

    // Verifica se com isso o jogo acabou para parar de buscar
    if (board.isFinished(depth, score)) return [null, score];

    // Cria um array min cuja posição 0 é null para indicar que ainda nao tem nenhum e a pontuação é 999999 para garantir que o próximo será menor que ele
    var min = [null, 99999];

    // Verifica cada possibilidade de jogada
    for (var column = 0; column < that.columns; column++) {
        var new_board = board.copy(); // Cria uma cópia do tabuleiro

        if (new_board.place(column)) {

            that.iterations++; // Aumenta o número de iterações para comparar com o algoritmo de Poda

	    // Chama a função max
            var next_move = that.funcaoMax(new_board, depth - 1); // Chamada recursiva

            // Dessa vez é verificado se o resultado do max é menor que o atual min
            if (min[0] == null || next_move[1] < min[1]) {
                min[0] = column;
                min[1] = next_move[1];
            }
        }
    }

    return min;
}

Game.prototype.switchRound = function(round) {
    // 0 Human, 1 Computer
    if (round == 0) {
        return 1;
    } else {
        return 0;
    }
}

Game.prototype.updateStatus = function() {
    // Human won
    if (that.board.score() == -that.score) {
        that.status = 1;
        that.markWin();
        alert("You have won!");
    }

    // Computer won
    if (that.board.score() == that.score) {
        that.status = 2;
        that.markWin();
        alert("You have lost!");
    }

    // Tie
    if (that.board.isFull()) {
        that.status = 3;
        alert("Tie!");
    }

    var html = document.getElementById('status');
    if (that.status == 0) {
        html.className = "status-running";
        html.innerHTML = "running";
    } else if (that.status == 1) {
        html.className = "status-won";
        html.innerHTML = "won";
    } else if (that.status == 2) {
        html.className = "status-lost";
        html.innerHTML = "lost";
    } else {
        html.className = "status-tie";
        html.innerHTML = "tie";
    }
}

Game.prototype.markWin = function() {
    for (var i = 0; i < that.winning_array.length; i++) {
        var name = document.getElementById('game_board').rows[that.winning_array[i][0]].cells[that.winning_array[i][1]].className;
        document.getElementById('game_board').rows[that.winning_array[i][0]].cells[that.winning_array[i][1]].className = name + " win";
    }
}

Game.prototype.restartGame = function() {
    if (confirm('Game is going to be restarted.\nAre you sure?')) {
        var depth = 6;
        that.depth = depth;
        that.status = 0;
        that.round = 0;
        that.init();
        document.getElementById('ai-iterations').innerHTML = "?";
        document.getElementById('ai-time').innerHTML = "?";
        document.getElementById('game_board').className = "";
        that.updateStatus();

        // Re-assign hover
        $('td').hover(function() {
            $(this).parents('table').find('col:eq('+$(this).index()+')').toggleClass('hover');
        });
    }
}

/**
 * Start game
 */
function Start() {
    window.Game = new Game();

    // Hover background, now using jQuery
    $('td').hover(function() {
        $(this).parents('table').find('col:eq('+$(this).index()+')').toggleClass('hover');
    });
}

window.onload = function() {
    Start()
};
