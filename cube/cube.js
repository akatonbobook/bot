const fs = require('fs');

const combination = function(n, k) {
    let c = 1;
    for (let i=n; i>n-k; i--) {
        c *= i;
    }
    for (let i=k; i>1; i--) {
        c = Math.floor(c / i);
    }
    return c;
}

const shuffle = ([...array]) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

class State {
    /**
     * 
     * @param {Array} cp 
     * @param {Array} co 
     * @param {Array} ep 
     * @param {Array} eo 
     */
    constructor(cp, co, ep, eo) {
        this.cp = cp;
        this.co = co;
        this.ep = ep;
        this.eo = eo;
    }

    static moves = {
        "U": new State(
            [3, 0, 1, 2, 4, 5, 6, 7],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 2, 3, 7, 4, 5, 6, 8, 9, 10, 11],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ),
        "D": new State(
            [0, 1, 2, 3, 5, 6, 7, 4],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 8],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ),
        "L": new State(
            [4, 1, 2, 0, 7, 5, 6, 3],
            [2, 0, 0, 1, 1, 0, 0, 2],
            [11, 1, 2, 7, 4, 5, 6, 0, 8, 9, 10, 3],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ),
        "R": new State(
            [0, 2, 6, 3, 4, 1, 5, 7],
            [0, 1, 2, 0, 0, 2, 1, 0],
            [0, 5, 9, 3, 4, 2, 6, 7, 8, 1, 10, 11],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ),
        "F": new State(
            [0, 1, 3, 7, 4, 5, 2, 6],
            [0, 0, 1, 2, 0, 0, 2, 1],
            [0, 1, 6, 10, 4, 5, 3, 7, 8, 9, 2, 11],
            [0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0]
        ),
        "B": new State(
            [1, 5, 2, 3, 0, 4, 6, 7],
            [1, 2, 0, 0, 2, 1, 0, 0],
            [4, 8, 2, 3, 1, 5, 6, 7, 0, 9, 10, 11],
            [1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]
        ),
        "U2": new State(
            [2,3,0,1,4,5,6,7],
            [0,0,0,0,0,0,0,0],
            [0,1,2,3,6,7,4,5,8,9,10,11],
            [0,0,0,0,0,0,0,0,0,0,0,0]
        ),
        "U'": new State(
            [1,2,3,0,4,5,6,7],
            [0,0,0,0,0,0,0,0],
            [0,1,2,3,5,6,7,4,8,9,10,11],
            [0,0,0,0,0,0,0,0,0,0,0,0]
        ),
        "D2": new State(
            [0,1,2,3,6,7,4,5],
            [0,0,0,0,0,0,0,0],
            [0,1,2,3,4,5,6,7,10,11,8,9],
            [0,0,0,0,0,0,0,0,0,0,0,0]
        ),
        "D'": new State(
            [0,1,2,3,7,4,5,6],
            [0,0,0,0,0,0,0,0],
            [0,1,2,3,4,5,6,7,11,8,9,10],
            [0,0,0,0,0,0,0,0,0,0,0,0]
        ),
        "L2": new State(
            [7,1,2,4,3,5,6,0],
            [0,0,0,0,0,0,0,0],
            [3,1,2,0,4,5,6,11,8,9,10,7],
            [0,0,0,0,0,0,0,0,0,0,0,0]
        ),
        "L'": new State(
            [3,1,2,7,0,5,6,4],
            [2,0,0,1,1,0,0,2],
            [7,1,2,11,4,5,6,3,8,9,10,0],
            [0,0,0,0,0,0,0,0,0,0,0,0]
        ),
        "R2": new State(
            [0,6,5,3,4,2,1,7],
            [0,0,0,0,0,0,0,0],
            [0,2,1,3,4,9,6,7,8,5,10,11],
            [0,0,0,0,0,0,0,0,0,0,0,0]
        ),
        "R'": new State(
            [0,5,1,3,4,6,2,7],
            [0,1,2,0,0,2,1,0],
            [0,9,5,3,4,1,6,7,8,2,10,11],
            [0,0,0,0,0,0,0,0,0,0,0,0]
        ),
        "F2": new State(
            [0,1,7,6,4,5,3,2],
            [0,0,0,0,0,0,0,0],
            [0,1,3,2,4,5,10,7,8,9,6,11],
            [0,0,0,0,0,0,0,0,0,0,0,0]
        ),
        "F'": new State(
            [0,1,6,2,4,5,7,3],
            [0,0,1,2,0,0,2,1],
            [0,1,10,6,4,5,2,7,8,9,3,11],
            [0,0,1,1,0,0,1,0,0,0,1,0]
        ),
        "B2": new State(
            [5,4,2,3,1,0,6,7],
            [0,0,0,0,0,0,0,0],
            [1,0,2,3,8,5,6,7,4,9,10,11],
            [0,0,0,0,0,0,0,0,0,0,0,0]
        ),
        "B'": new State(
            [4,0,2,3,5,1,6,7],
            [1,2,0,0,2,1,0,0],
            [8,4,2,3,0,5,6,7,1,9,10,11],
            [1,1,0,0,1,0,0,0,1,0,0,0]
        ),
    };

    static move_names_ph2 = [
        'U', 'U2', "U'", "D", "D2", "D'", "L2", "R2", "F2", "B2"
    ];

    static move_names = [
        'U',  'D',  'L',  'R',
        'F',  'B',  'U2', "U'",
        'D2', "D'", 'L2', "L'",
        'R2', "R'", 'F2', "F'",
        'B2', "B'"
    ];

    static solved_state = new State(
        [0, 1, 2, 3, 4, 5, 6, 7],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    );

    static co_to_index(co) {
        let s = 0;
        for (let i = 0; i < co.length - 1; i++) {
            s *= 3;
            s += co[i];
        }
        return s;
    }

    static index_to_co(index) {
        let co = new Array(8).fill(0);
        let s = 0;
        for (let i = 6; i >= 0; i--) {
            co[i] = index % 3;
            index = Math.floor(index / 3);
            s += co[i];
        }
        co[7] = (3 - s % 3) % 3;
        return co;
    }

    static eo_to_index(eo) {
        let s = 0;
        for (let i = 0; i < eo.length - 1; i++) {
            s *= 2;
            s += eo[i];
        }
        return s;
    }

    static index_to_eo(index) {
        let eo = new Array(12).fill(0);
        let s = 0;
        for (let i = 10; i >= 0; i--) {
            eo[i] = index % 2;
            index = Math.floor(index / 2);
            s += eo[i];
        }
        eo[11] = s % 2;
        return eo;
    }

    static e_combination_to_index(comb) {
        let k = 4;
        let s = 0;
        for (let i = 11; i >= 0; i--) {
            if (comb[i]) {
                s += combination(i, k);
                k--;
            }
        }
        return s;
    }

    static index_to_e_combination(index) {
        let k = 4;
        let comb = new Array(12).fill(0);
        for (let i = 11; i >= 0; i--) {
            let c = combination(i, k)
            if (index >= c) {
                index -= c;
                comb[i] = 1;
                k--;
            }
        }
        return comb;
    }

    static cp_to_index(cp) {
        let s = 0;
        for (let i=0; i<cp.length; i++) {
            s *= 8 - i;
            for (let j=i+1; j<8; j++) {
                if (cp[i] > cp[j]) {
                    s++;
                }
            }
        }
        return s;
    }

    static index_to_cp(index) {
        let cp = new Array(8).fill(0);
        for (let i=6; i>=0; i--) {
            cp[i] = index % (8 - i);
            index = Math.floor(index / (8 - i));
            for (let j=i+1; j<8; j++) {
                if (cp[j] >= cp[i]) {
                    cp[j] += 1;
                }
            }
        }
        return cp;
    }

    static ud_ep_to_index(ep) {
        let s = 0;
        for (let i=0; i<ep.length; i++) {
            s *= 8 - i;
            for (let j=i+1; j<8; j++) {
                if (ep[i] > ep[j]) {
                    s++;
                }
            }
        }
        return s;
    }
    
    static index_to_ud_ep(index) {
        let ep = new Array(8).fill(0);
        for (let i=6; i>=0; i--) {
            ep[i] = index % (8 - i);
            index = Math.floor(index / (8 - i));
            for (let j=i+1; j<8; j++) {
                if (ep[j] >= ep[i]) {
                    ep[j] += 1;
                }
            }
        }
        return ep;
    }

    static e_ep_to_index(eep) {
        let s = 0;
        for (let i=0; i<eep.length; i++) {
            s *= 4 - i;
            for (let j=i+1; j<4; j++) {
                if (eep[i] > eep[j]) {
                    s++;
                }
            }
        }
        return s;
    }
    
    static index_to_e_ep(index) {
        let eep = new Array(4).fill(0);
        for (let i=2; i>=0; i--) {
            eep[i] = index % (4 - i);
            index = Math.floor(index / (4 - i));
            for (let j=i+1; j<4; j++) {
                if (eep[j] >= eep[i]) {
                    eep[j] += 1;
                }
            }
        }
        return eep;
    }

    apply_move(move) {
        const new_cp = move.cp.map(p => this.cp[p]);
        const new_co = move.cp.map((p, i) => (this.co[p]+move.co[i]) % 3);
        const new_ep = move.ep.map(p => this.ep[p]);
        const new_eo = move.ep.map((p, i) => (this.eo[p]+move.eo[i]) % 2);
        return new State(new_cp, new_co, new_ep, new_eo);
    }

    static is_possible(state) {
        let pivot = 0;
        for (const p of state.co) {
            pivot += p;
        }
        pivot %= 3;
        let flip = 0;
        for (const f of state.eo) {
            flip += f;
        }
        flip %= 2;
        let sign = 0;
        const cp = Array.from(state.cp);
        for (let i=0; i<cp.length; i++) {
            if (cp[i] != i) {
                for (let j=i+1; j<cp.length; j++) {
                    if (cp[j] == i) {
                        let tmp = cp[j];
                        cp[j] = cp[i];
                        cp[i] = tmp;
                        sign++;
                        break;
                    }
                }
            }
        }
        const ep = Array.from(state.ep);
        for (let i=0; i<ep.length; i++) {
            if (ep[i] != i) {
                for (let j=i+1; j<ep.length; j++) {
                    if (ep[j] == i) {
                        let tmp = ep[j];
                        ep[j] = ep[i];
                        ep[i] = tmp;
                        sign++;
                        break;
                    }
                }
            }
        }
        sign = sign % 2 == 0 ? 1 : -1;
        // console.log(`sgn=${sign}, pivot=${pivot}, flip=${flip}`);
        return sign == 1 && flip == 0 && pivot == 0;
    }

    static get_e_combination(ep) {
        return ep.map(e => [0, 1, 2, 3].includes(e) ? 1 : 0);
    }

    /**
     * 
     * @param {String} scramble 
     */
    static scramble2state(scramble) {
        let state = this.solved_state;
        for(const move of scramble.split(' ')) {
            let move_state = this.moves[move];
            state = state.apply_move(move_state);
        }
        return state;
    }
}

const { co_move_table, eo_move_table, e_combination_table, co_eec_prune_table, eo_eec_prune_table } = require('./ph1.json');
const { cp_move_table, ud_ep_move_table, e_ep_move_table, cp_eep_prune_table, udep_eep_prune_table } = require('./ph2.json');

class Solver {
    constructor(state) {
        this.initial_state = state;
        this.solution_ph1 = [];
        this.solution_ph2 = [];
    }

    static inv_face = {
        "U": "D",
        "D": "U",
        "L": "R",
        "R": "L",
        "F": "B",
        "B": "F"
    };

    /**
     * 
     * @param {String} prev_move 
     * @param {String} move 
     * @returns 
     */
    is_effective_move(prev_move, move) {
        if (prev_move == null) return true;
        if (prev_move.charAt(0) == move.charAt(0)) {
            return false;
        }
        if (Solver.inv_face[prev_move.charAt(0)] == move.charAt(0)) {
            return prev_move.charAt(0) < move.charAt(0);
        }
        return true;
    }

    depth_limited_search_ph1(depth, co_index, eo_index, e_comb_index) {
        // console.log('ph1 : ' + this.solution_ph1.join(' '));
        if (depth == 0 && co_index == 0 && eo_index == 0 && e_comb_index == 0) {
            return true;
        }
        if (depth == 0) {
            return false;
        }

        if (Math.max(co_eec_prune_table[co_index][e_comb_index], eo_eec_prune_table[eo_index][e_comb_index]) > depth) {
            return false;
        }

        let prev_move = this.solution_ph1.slice(-1)[0] ?? null;

        for (let i=0; i<State.move_names.length; i++){
            let move_name = State.move_names[i];
            if (!this.is_effective_move(prev_move, move_name)) {
                continue;
            }
            this.solution_ph1.push(move_name);
            let next_co_index = co_move_table[co_index][i];
            let next_eo_index = eo_move_table[eo_index][i];
            let next_e_comb_index = e_combination_table[e_comb_index][i];
            if (this.depth_limited_search_ph1(depth-1, next_co_index, next_eo_index, next_e_comb_index)) {
                return true;
            }
            this.solution_ph1.pop();
        };
    }

    depth_limited_search_ph2(depth, cp_index, udep_index, eep_index) {
        // console.log('ph2 : ' + this.solution_ph1.concat(this.solution_ph2).join(" "));
        if (depth == 0 && cp_index == 0 && udep_index == 0 && eep_index == 0) {
            return true;
        }
        if (depth == 0) {
            return false;
        }

        if (Math.max(cp_eep_prune_table[cp_index][eep_index], udep_eep_prune_table[udep_index][eep_index]) > depth) {
            return false;
        }

        let prev_move = this.solution_ph2.slice(-1)[0] ?? (this.solution_ph1.slice(-1)[0] ?? null);

        for (let i=0; i<State.move_names_ph2.length; i++){
            let move_name = State.move_names_ph2[i];
            if (!this.is_effective_move(prev_move, move_name)) {
                continue;
            }
            this.solution_ph2.push(move_name);
            let next_cp_index = cp_move_table[cp_index][i];
            let next_udep_index = ud_ep_move_table[udep_index][i];
            let next_eep_index = e_ep_move_table[eep_index][i];
            if (this.depth_limited_search_ph2(depth-1, next_cp_index, next_udep_index, next_eep_index)) {
                return true;
            }
            this.solution_ph2.pop();
        };
    }

    search() {
        const ph1 = this.search_ph1(20);
        this.g1 = this.initial_state;
        for(const move of this.solution_ph1) {
            let move_state = State.moves[move];
            this.g1 = this.g1.apply_move(move_state);
        }
        const ph2 = this.search_ph2(20);
        this.solution = this.solution_ph1.concat(this.solution_ph2);
        return this.solution.join(' ');
    }

    search_ph1(max_depth) {
        let co_index = State.co_to_index(this.initial_state.co);
        let eo_index = State.eo_to_index(this.initial_state.eo);
        let e_combination = State.get_e_combination(this.initial_state.ep);
        let e_comb_index = State.e_combination_to_index(e_combination);
        for (let d = 0; d <= max_depth; d++) {
            if (this.depth_limited_search_ph1(d, co_index, eo_index, e_comb_index))
                return this.solution_ph1.join(' ');
        }
        return "";
    }

    search_ph2(max_depth) {
        let cp_index = State.cp_to_index(this.g1.cp);
        let udep_index = State.ud_ep_to_index(this.g1.ep.slice(4));
        let eep_index = State.e_ep_to_index(this.g1.ep.slice(0, 4));
        for (let d=0; d<=max_depth; d++) {
            if (this.depth_limited_search_ph2(d, cp_index, udep_index, eep_index)) 
                return this.solution_ph2.join(' ');
        }
        return "";
    }
}

const init_ph1_table = function() {
    const NUM_CO = 2187;
    const NUM_EO = 2048;
    const NUM_E_COMBINATIONS = 495;

    const NUM_MOVES = State.move_names.length;

    const co_move_table = new Array(NUM_CO);
    for (let i=0; i<co_move_table.length; i++)
        co_move_table[i] = new Array(NUM_MOVES).fill(0);
    for (let i=0; i<NUM_CO; i++) {
        let state = new State(
            new Array(8).fill(0),
            State.index_to_co(i),
            new Array(12).fill(0),
            new Array(12).fill(0)
        );
        State.move_names.forEach((move_name, idx) => {
            let new_state = state.apply_move(State.moves[move_name]);
            co_move_table[i][idx] = State.co_to_index(new_state.co);
        });
    }

    const eo_move_table = new Array(NUM_EO);
    for (let i=0; i<eo_move_table.length; i++) 
        eo_move_table[i] = new Array(NUM_MOVES).fill(0);
    for (let i=0; i<NUM_EO; i++) {
        let state = new State(
            new Array(8).fill(0),
            new Array(8).fill(0),
            new Array(12).fill(0),
            State.index_to_eo(i)
        );
        State.move_names.forEach((move_name, idx) => {
            let new_state = state.apply_move(State.moves[move_name]);
            eo_move_table[i][idx] = State.eo_to_index(new_state.eo);
        });
    }

    const e_combination_table = new Array(NUM_E_COMBINATIONS);
    for (let i=0; i<e_combination_table.length; i++)
        e_combination_table[i] = new Array(NUM_MOVES).fill(0);
    for (let i=0; i<NUM_E_COMBINATIONS; i++) {
        let state = new State(
            new Array(8).fill(0),
            new Array(8).fill(0),
            State.index_to_e_combination(i),
            new Array(12).fill(0)
        );
        State.move_names.forEach((move_name, idx) => {
            let new_state = state.apply_move(State.moves[move_name]);
            e_combination_table[i][idx] = State.e_combination_to_index(new_state.ep);
        });
    }

    let distance = 0;
    let num_filled = 1;
    const co_eec_prune_table = new Array(NUM_CO);
    for (let i=0; i<co_eec_prune_table.length; i++)
        co_eec_prune_table[i] = new Array(NUM_E_COMBINATIONS).fill(-1);
    co_eec_prune_table[0][0] = 0;
    while (num_filled != NUM_CO * NUM_E_COMBINATIONS) {
        for (let i_co=0; i_co<NUM_CO; i_co++) {
            for (let i_eec=0; i_eec<NUM_E_COMBINATIONS; i_eec++) {
                if (co_eec_prune_table[i_co][i_eec] == distance) {
                    for (let i_m=0; i_m<NUM_MOVES; i_m++) {
                        let next_co = co_move_table[i_co][i_m];
                        let next_eec = e_combination_table[i_eec][i_m];
                        if (co_eec_prune_table[next_co][next_eec] == -1) {
                            co_eec_prune_table[next_co][next_eec] = distance + 1;
                            num_filled++;
                        }
                    }
                }
            }
        }
        distance++;
    }

    const eo_eec_prune_table = new Array(NUM_EO);
    for (let i=0; i<eo_eec_prune_table.length; i++)
        eo_eec_prune_table[i] = new Array(NUM_E_COMBINATIONS).fill(-1);
    eo_eec_prune_table[0][0] = 0;
    distance = 0;
    num_filled = 1;
    while (num_filled != NUM_EO * NUM_E_COMBINATIONS) {
        for (let i_eo=0; i_eo<NUM_EO; i_eo++) {
            for (let i_eec=0; i_eec<NUM_E_COMBINATIONS; i_eec++) {
                if (eo_eec_prune_table[i_eo][i_eec] == distance) {
                    for (let i_m=0; i_m<NUM_MOVES; i_m++) {
                        let next_eo = eo_move_table[i_eo][i_m];
                        let next_eec = e_combination_table[i_eec][i_m];
                        if (eo_eec_prune_table[next_eo][next_eec] == -1) {
                            eo_eec_prune_table[next_eo][next_eec] = distance + 1;
                            num_filled++;
                        }
                    }
                }
            }
        }
        distance++;
    }

    let json_ph1 = JSON.stringify({
        "co_move_table": co_move_table,
        "eo_move_table": eo_move_table,
        "e_combination_table": e_combination_table,
        "co_eec_prune_table": co_eec_prune_table,
        "eo_eec_prune_table": eo_eec_prune_table
    });
    fs.writeFileSync('cube/ph1.json', json_ph1);
}

const init_ph2_table = function() {
    const NUM_CP = 40320;
    const NUM_UD_EP = 40320;
    const NUM_E_EP = 24;
    const NUM_MOVES_PH2 = State.move_names_ph2.length;

    const cp_move_table = new Array(NUM_CP);
    for (let i=0; i<cp_move_table.length; i++)
        cp_move_table[i] = new Array(NUM_MOVES_PH2).fill(0);
    for (let i=0; i<NUM_CP; i++) {
        let state = new State(
            State.index_to_cp(i),
            new Array(8).fill(0),
            new Array(12).fill(0),
            new Array(12).fill(0)
        );
        State.move_names_ph2.forEach((move_name, idx) => {
            let new_state = state.apply_move(State.moves[move_name]);
            cp_move_table[i][idx] = State.cp_to_index(new_state.cp);
        });
    }
    console.log(`cp move table finished size=${cp_move_table.length}x${cp_move_table[0].length}`);

    const ud_ep_move_table = new Array(NUM_UD_EP);
    for (let i=0; i<ud_ep_move_table.length; i++)
        ud_ep_move_table[i] = new Array(NUM_MOVES_PH2).fill(0);
    for (let i=0; i<NUM_UD_EP; i++) {
        let state = new State(
            new Array(8).fill(0),
            new Array(8).fill(0),
            new Array(4).fill(0).concat(State.index_to_ud_ep(i)),
            new Array(12).fill(0)
        );
        State.move_names_ph2.forEach((move_name, idx) => {
            let new_state = state.apply_move(State.moves[move_name]);
            ud_ep_move_table[i][idx] = State.ud_ep_to_index(new_state.ep.slice(4));
        });
    }
    console.log(`ud ep move table finished size=${ud_ep_move_table.length}x${ud_ep_move_table[0].length}`);

    const e_ep_move_table = new Array(NUM_E_EP);
    for (let i=0; i<e_ep_move_table.length; i++)
        e_ep_move_table[i] = new Array(NUM_MOVES_PH2).fill(0);
    for (let i=0; i<NUM_E_EP; i++) {
        let state = new State(
            new Array(8).fill(0),
            new Array(8).fill(0),
            State.index_to_e_ep(i).concat(new Array(8).fill(0)),
            new Array(12).fill(0)
        );
        State.move_names_ph2.forEach((move_name, idx) => {
            let new_state = state.apply_move(State.moves[move_name]);
            console.log(new_state.ep);
            e_ep_move_table[i][idx] = State.e_ep_to_index(new_state.ep.slice(0, 4));
        });
    }
    console.log(`e ep move table finished size=${e_ep_move_table.length}x${e_ep_move_table[0].length}`);

    let distance = 0;
    let num_filled = 1;
    const cp_eep_prune_table = new Array(NUM_CP);
    for (let i=0; i<cp_eep_prune_table.length; i++)
        cp_eep_prune_table[i] = new Array(NUM_E_EP).fill(-1);

    cp_eep_prune_table[0][0] = 0;
    while (num_filled != NUM_CP * NUM_E_EP) {
        console.log(`cp eep prune table distance ${distance}`);
        for (let i_cp=0; i_cp<NUM_CP; i_cp++) {
            for (let i_eep=0; i_eep<NUM_E_EP; i_eep++) {
                if (cp_eep_prune_table[i_cp][i_eep] == distance) {
                    for (let i_m=0; i_m<NUM_MOVES_PH2; i_m++) {
                        let next_cp = cp_move_table[i_cp][i_m];
                        let next_eep = e_ep_move_table[i_eep][i_m];
                        if (cp_eep_prune_table[next_cp][next_eep] == -1) {
                            cp_eep_prune_table[next_cp][next_eep] = distance + 1;
                            num_filled++;
                            console.log(`cp eep prune table distance ${distance} num_filled ${num_filled}`);
                        }
                    }
                }
            }
        }
        distance++;
    }
    console.log('cp eep prune table finished');

    const udep_eep_prune_table = new Array(NUM_UD_EP);
    for (let i=0; i<udep_eep_prune_table.length; i++)
        udep_eep_prune_table[i] = new Array(NUM_E_EP).fill(-1);
    udep_eep_prune_table[0][0] = 0;
    distance = 0;
    num_filled = 1;
    while (num_filled != NUM_UD_EP * NUM_E_EP) {
        for (let i_udep=0; i_udep<NUM_UD_EP; i_udep++) {
            for (let i_eep=0; i_eep<NUM_E_EP; i_eep++) {
                if (udep_eep_prune_table[i_udep][i_eep] == distance) {
                    for (let i_m=0; i_m<NUM_MOVES_PH2; i_m++) {
                        let next_udep = ud_ep_move_table[i_udep][i_m];
                        let next_eep = e_ep_move_table[i_eep][i_m];
                        if (udep_eep_prune_table[next_udep][next_eep] == -1) {
                            udep_eep_prune_table[next_udep][next_eep] = distance + 1;
                            num_filled++;
                            console.log(`udep eep prune table distance ${distance} num_filled ${num_filled}`);
                        }
                    }
                }
            }
        }
        distance++;
    }
    console.log('udep eep prune table finished');

    
    let json_ph2 = JSON.stringify({
        "cp_move_table": cp_move_table,
        "ud_ep_move_table": ud_ep_move_table,
        "e_ep_move_table": e_ep_move_table,
        "cp_eep_prune_table": cp_eep_prune_table,
        "udep_eep_prune_table": udep_eep_prune_table
    });
    fs.writeFileSync('cube/ph2.json', json_ph2);
}

/**
 * 
 * @param {String} scramble 
 */
const inv_scramble = function(scramble) {
    let scrambles =  scramble.split(' ');
    return scrambles.map(s => {
        if (s.length == 1) {
            return s + "'";
        } else if (s.charAt(1) == "2") {
            return s;
        } else {
            return s.charAt(0);
        }
    })
    .reverse()
    .join(' ');
}

const solve_scramble = function(scramble) {
    try {
        let cube = State.scramble2state(scramble);
        let solver = new Solver(cube);
        return solver.search();
    } catch (err) {
        console.log('スクランブルできません');
        return null;
    }
}

const generate_scramble = function() {
    let cube;
    do {
        cube = new State(
            shuffle([0, 1, 2, 3, 4, 5, 6, 7]),
            State.index_to_co(2000),
            shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
            State.index_to_eo(300)
        );
    } while (!State.is_possible(cube));
    let solver = new Solver(cube);
    let solution = solver.search();
    return inv_scramble(solution);
}

module.exports = {
    solve_scramble,
    generate_scramble,
}