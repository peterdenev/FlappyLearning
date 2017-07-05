var Neuvol;

var _win = false;
var _winScore = 340000;

var _min = 1;
var _max = 99;

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Player{
    constructor(){
        this.alive = true;
        this.nextDirection = 0;
        this.nextMax = _max;
        this.nextMin = _min;
    }
    isDead(lastKnownNumber) {
        return lastKnownNumber > this.nextMax || lastKnownNumber < this.nextMin;
    }
    nextUp(lastKnownNumber){
        this.lastDirection = 1;
        this.nextMin = lastKnownNumber + 1;
        this.nextMax = _max;
    }
    nextDown(lastKnownNumber){
        this.lastDirection = -1;
        this.nextMin = 1;
        this.nextMax = lastKnownNumber - 1;
    }


}

class Game{
    constructor(){ 
        this.generation = 0;
        this.maxScore = 0;
    }

    start(){
        this.interval = 0;
        this.score = 0;
        this.knownNumbers = [];
        // this.genNextNumber();
        this.players = [];
        this.gen = Neuvol.nextGeneration();
        for(var i in this.gen){
            var p = new Player();
            this.players.push(p);
        }
        this.generation++;
        this.alives = this.players.length;
    }

    genNextNumber(){
        let nextNum = 0;
        while(nextNum == this.lastKnownNumber || nextNum == 0){
            nextNum = getRandomInt(_min, _max);
        }
        this.lastKnownNumber = nextNum;
        this.knownNumbers.push(this.lastKnownNumber);
        return this.lastKnownNumber;
    }

    isItEnd(){
        for(var i in this.players){
            if(this.players[i].alive){
                return false;
            }
        }
        return true;
    }

    display(){
        console.log({
            numbers: this.knownNumbers.join(', '),
            alive: this.alives,
            generation: this.generation,
            score: this.score,
            maxScore: this.maxScore
        });
    }

    step(lastNum){
        var upCounts = 0;
        var downCounts = 0;

        for(var i in this.players){
            if(this.players[i].alive){
                var inputs = [
                    // this.players[i].nextDirection,
                    this.players[i].nextMin,
                    this.players[i].nextMax,
                    lastNum
                ];
                var res = this.gen[i].compute(inputs);
                // console.log('res', res);
                if(res > 0.5){
                    upCounts++;
                }else{
                    downCounts++;
                }
            }
        }

        console.log({
            ups: upCounts,
            downs: downCounts
        });
    }

    update(){
        var lastNum = this.lastKnownNumber || this.genNextNumber();
        var nextNum = this.genNextNumber();

        var upCounts = 0;
        var downCounts = 0;

        for(var i in this.players){
            if(this.players[i].alive){

                var inputs = [
                    // this.players[i].nextDirection,
                    this.players[i].nextMin,
                    this.players[i].nextMax,
                    lastNum
                ];

                var res = this.gen[i].compute(inputs);
                // console.log('res', res);
                if(res > 0.5){
                    this.players[i].nextUp(lastNum);
                    upCounts++;
                }else{
                    this.players[i].nextDown(lastNum);
                    downCounts++;
                }

                // this.players[i].update();
                if(this.players[i].isDead(nextNum)){
                    this.players[i].alive = false;
                    this.alives--;
                    //console.log(this.alives);
                    Neuvol.networkScore(this.gen[i], this.score);
                    if(this.isItEnd()){
                        console.log('game end');
                        this.start();
                    }
                }
            }
        }

        console.log({
            ups: upCounts,
            downs: downCounts
        });

        this.score = this.score == 0 ? 1 : this.score * 2;
        this.maxScore = (this.score > this.maxScore) ? this.score : this.maxScore;
        // console.log(this);
        this.display();
        if (this.score >= _winScore){
            _win = true;
        }
    }
    
}



Neuvol = new Neuroevolution({
    population:500,
    network:[3, [3], 1],
});

var game = new Game();
game.start();

function updateIt(n){
    for(let i=0; i<n; i++){        
        game.update();
        if (_win){
            console.log('win', i);
            break;
        }
    }
}


