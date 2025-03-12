const musik = function(divWidth, divHeight) {
    return (p) => {
        const W = divWidth;
        const H = divHeight;

        const NOTE_WIDTH = W / 10;
        const NOTE_IDS = ["c4", "c#4", "d4", "d#4", "e4", "f4", "f#4", "g4", "g#4", "a4", "a#4", "b4", "c5", "c#5", "d5", "d#5", "e5", "-"];
        const NOTE_OFFSETS = [0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7, 7.5, 8, 8.5, 9];
        let notes = {};

        const TARGET = ["g4", "-", "-", "d4", "g4", "-", "-", "d4", "g4", "d4", "g4", "b4", "d5", "-", "-", "-", "c5", "-", "-", "a4", "c5", "-", "-", "a4", "c5", "a4", "f#4", "a4", "d4", "-", "-", "-"];

        let population = [];
        const POP_COUNT = 1000;
        const C_COUNT = 200;
        const MUTATION = 5;

        let playCounter = 0;
        let playInterval = 10;
        let musicIndex = 0;

        let pauseCounter = 0;
        let pauseDuration = 120;
        let paused = false;

        let synth;

        let startup = true;

        p.setup = function() {
            p.createCanvas(W, H);

            for(let i = 0; i < NOTE_IDS.length - 1; i++) {
                notes[NOTE_IDS[i]] = new Note(
                                                (NOTE_WIDTH * NOTE_OFFSETS[i]),
                                                H * 0.5, 
                                                NOTE_WIDTH * 0.9,
                                                (NOTE_IDS[i].length == 3) ? H * 0.3 : H * 0.5,
                                                "c4", 
                                                (NOTE_IDS[i].length == 3) ? [0,0,0] : [255, 255, 255]
                                            );
            }

            for(let i = 0; i < POP_COUNT; i++) {
                population.push(makeRandomNoteSequence());
            }
        }

        p.mousePressed = function() {
            synth = new Tone.Synth().toDestination();
            startup = false;
        }

        p.draw = function() {
            p.background(52);

            if(startup) {
                p.textSize(20);
                p.textAlign(p.CENTER, p.CENTER);
                p.noStroke();
                p.fill(255);
                p.text("Click to start", W * 0.5, H * 0.5);
            }
            else {

                if(musicIndex < population[0].length) {
                    for(let i = 0; i < NOTE_IDS.length - 1; i++ ){ 
                        let ID = NOTE_IDS[i];
                        if(ID == population[0][musicIndex]) {
                            notes[ID].active = true;
                            synth.triggerAttackRelease(ID, "8n");
                        }
                        else {
                            notes[ID].active = false;
                        }
                    }
                    if(playCounter >= playInterval) {
                        musicIndex += 1;
                        playCounter = 0;
                    }
                    else {
                        playCounter += 1;
                    }
                }
                else {
                    paused = true;
                }

                if(paused) {
                    if(pauseCounter < pauseDuration) {
                        pauseCounter += 1;
                    }
                    else {
                        for(let i = 0; i < 2; i++) {
                            orderPopulation();
                            let children = makeChildren();
                            population = population.slice(0, C_COUNT);
                            population = population.concat(children);
                        }
                        pauseCounter = 0;
                        paused = false;
                        musicIndex = 0;
                    }
                }


                for(let i = 0; i < NOTE_IDS.length - 1; i++) {
                    let ID = NOTE_IDS[i];
                    notes[ID].show();
                }
            }
        }

        const Note = function(x, y, w, h, ID, color) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            this.ID = ID;
            this.color = color;
            this.active = false;

            this.show = function() {
                p.stroke(0);
                p.fill(this.active ? [0, 255, 255] : this.color);
                p.rect(this.x, this.y, this.w, this.h);
            }
        }

        function makeRandomNoteSequence() {
            let seq = [];
            for(let i = 0; i < TARGET.length; i++) {
                seq.push(p.random(NOTE_IDS));
            }
            return seq;
        }

        function getScore(seq) {
            let score = 0;
            for(let i = 0; i < TARGET.length; i++) {
                if(seq[i] == TARGET[i]) {
                    score += 1;
                }
            }
            return score;
        }

        function orderPopulation() {
            population.sort((a, b) => {
                let aScore = getScore(a);
                let bScore = getScore(b);
                return bScore - aScore;
            });
        }

        function chooseParent() {
            let a = p.random(population);
            let b = p.random(population);
            let aScore = getScore(a);
            let bScore = getScore(b);
            return aScore > bScore ? a : b;
        }

        function makeChild() {
            let r = chooseParent();
            let q = chooseParent();
            let c = [];
            for(let i = 0; i < r.length; i++) {
                if(p.floor(p.random(0, 100)) % 2 == 0) {
                    c.push(r[i]);
                }
                else {
                    c.push(q[i]);
                }
            }
            mutationAttempts = p.floor(p.random(1, TARGET.length * 0.25));
            for(let m = 0; m < mutationAttempts; m++) {
                if(p.random(0, 100) < MUTATION) {
                    let i = p.floor(p.random(0, c.length - 1));
                    c[i] = p.random(NOTE_IDS);
                }
            }
            return c;
        }

        function makeChildren() {
            let children = [];
            for(let i = 0; i < POP_COUNT - C_COUNT; i++) {
                children.push(
                    makeChild()
                );
            }
            return children;
        }
    }
}

const SKETCH_DIV = document.getElementById("sk");
const SK_W = SKETCH_DIV.offsetWidth;
const SK_H = SKETCH_DIV.offsetHeight;
new p5(musik(SK_W, SK_H), "sk");