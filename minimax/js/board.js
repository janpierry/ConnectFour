/**
 * Creates an instance of Board.
 * 
 * @constructor
 * @this {Board}
 * @param {Game} game The main-game object. 
 * @param {array} field The field containing our situation.
 * @param {number} player The current player.
 */
function Board(game, field, player) {
    this.game = game
    this.field = field;
    this.player = player;
}

/**
 * Determines if situation is finished.
 *
 * @param {number} depth
 * @param {number} score
 * @return {boolean}
 */
Board.prototype.isFinished = function(depth, score) {
    if (depth == 0 || score == this.game.score || score == -this.game.score || this.isFull()) {
        return true;
    }
    return false;
}

/**
 * Place in current board.
 *
 * @param {number} column
 * @return {boolean} 
 */
Board.prototype.place = function(column) {
    // Check if column valid
    // 1. not empty 2. not exceeding the board size
    if (this.field[0][column] == null && column >= 0 && column < this.game.columns) {
        // Bottom to top
        for (var y = this.game.rows - 1; y >= 0; y--) {
            if (this.field[y][column] == null) {
                this.field[y][column] = this.player; // Set current player coin
                break; // Break from loop after inserting
            }
        }
        this.player = this.game.switchRound(this.player);
        return true;
    } else {
        return false;
    }
}

/**
 * Return a score for various positions (either horizontal, vertical or diagonal by moving through our board).
 *
 * @param {number} row
 * @param {number} column
 * @param {number} delta_y
 * @param {number} delta_x
 * @return {number}
 */
Board.prototype.scorePosition = function(row, column, delta_y, delta_x) {
    var human_points = 0;
    var computer_points = 0;

    // Save winning positions to arrays for later usage
    this.game.winning_array_human = [];
    this.game.winning_array_cpu = [];

    // Determine score through amount of available chips
    for (var i = 0; i < 4; i++) {
        if (this.field[row][column] == 0) {
            this.game.winning_array_human.push([row, column]);
            human_points++; // Add for each human chip
        } else if (this.field[row][column] == 1) {
            this.game.winning_array_cpu.push([row, column]);
            computer_points++; // Add for each computer chip
        }

        // Moving through our board
        row += delta_y;
        column += delta_x;
    }

    // Marking winning/returning score
    if (human_points == 4) {
        this.game.winning_array = this.game.winning_array_human;
        // Computer won (100000)
        return -this.game.score;
    } else if (computer_points == 4) {
        this.game.winning_array = this.game.winning_array_cpu;
        // Human won (-100000)
        return this.game.score;
    } else {
        // Return normal points
        return computer_points;
    }
}

// Retorna uma pontuação a ser considerada como "Payoff" do jogo
Board.prototype.score = function() {
    var pontos = 0;
    var pontosNaVertical = 0;
    var pontosNaHorizontal = 0;
    var pontosNaDiagonalEsqBai = 0;
    var pontosNaDiagonalDirBai = 0;
   
    // Pontos na Vertical
    for (var linha = 0; linha < this.game.rows - 3; linha++) {
        for (var coluna = 0; coluna < this.game.columns; coluna++) {
            var score = this.scorePosition(linha, coluna, 1, 0);
            if (score == this.game.score) return this.game.score;
            if (score == -this.game.score) return -this.game.score;
            pontosNaVertical += score;
        }            
    }

    
    // Pontos na Horizontal
    for (var linha = 0; linha < this.game.rows; linha++) {
        for (var coluna = 0; coluna < this.game.columns - 3; coluna++) { 
            var score = this.scorePosition(linha, coluna, 0, 1);   
            if (score == this.game.score) return this.game.score;
            if (score == -this.game.score) return -this.game.score;
            pontosNaHorizontal += score;
        } 
    }


    // Pontos na Diagonal da Esquerda para Baixo 
    for (var linha = 0; linha < this.game.rows - 3; linha++) {
        for (var coluna = 0; coluna < this.game.columns - 3; coluna++) {
            var score = this.scorePosition(linha, coluna, 1, 1);
            if (score == this.game.score) return this.game.score;
            if (score == -this.game.score) return -this.game.score;
            pontosNaDiagonalEsqBai += score;
        }            
    }

    // Pontos na Diagonal da Direita para Baixo
    for (var linha = 3; linha < this.game.rows; linha++) {
        for (var coluna = 0; coluna <= this.game.columns - 4; coluna++) {
            var score = this.scorePosition(linha, coluna, -1, +1);
            if (score == this.game.score) return this.game.score;
            if (score == -this.game.score) return -this.game.score;
            pontosNaDiagonalDirBai += score;
        }

    }

    pontos = pontosNaVertical + pontosNaHorizontal + pontosNaDiagonalEsqBai + pontosNaDiagonalDirBai;
    return pontos;
}

/**
 * Determines if board is full.
 *
 * @return {boolean}
 */
Board.prototype.isFull = function() {
    for (var i = 0; i < this.game.columns; i++) {
        if (this.field[0][i] == null) {
            return false;
        }
    }
    return true;
}

/**
 * Returns a copy of our board.
 *
 * @return {Board}
 */
Board.prototype.copy = function() {
    var new_board = new Array();
    for (var i = 0; i < this.field.length; i++) {
        new_board.push(this.field[i].slice());
    }
    return new Board(this.game, new_board, this.player);
}
