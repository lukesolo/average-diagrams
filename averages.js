setTimeout(() => {
    const seq = new Sequence([
        [1, 3],
        [100],
        [2],
        [50],
        [10],
        [120],
        [35],
        [200],
    ])

    writeNumbers(seq)

    const golden = 0.62

    console.log('median')
    run(seq, medianAlg.bind(null, 4))
    console.log('sma + median')
    run(seq, sma.bind(null, median, 4))
    console.log('wma + median')
    run(seq, wma.bind(null, median, 4))
    console.log('ema(golden) + median')
    run(seq, ema.bind(null, median, golden))
    console.log('ema2(golden) + median')
    run(seq, emap.bind(null, median, 2, golden))
    console.log('ema3(golden) + median')
    run(seq, emap.bind(null, median, 3, golden))
}, 0)

function writeNumbers(seq) {
    const text = seq.blocks.map(vs => vs.join(' ')).join('\n')
    const elem = document.getElementById('numbers')
    elem.value = text
}

function readNumbers() {
    const elem = document.getElementById('numbers')
    const text = elem.value
    
    const strings = text.split('\n').map(str => str.trim()).filter(x => x)
    const blocks = strings.map(str =>
        str.split(' ').filter(x => x).map(str => parseInt(str)).filter(x => x))

    const seq = new Sequence(blocks)
    console.log('parsed:', seq.toString());
    
    return seq
}

function run(seq, alg) {
    for (let i = 1; i < seq.blocks.length; i++) {
        const bcPart = seq.until(i)
        const com = alg(bcPart)
        const intCom = com | 0
        console.log(intCom, bcPart.toString())
    }
}

function median(values) {
    const arr = values.slice()
    arr.sort((a, b) => a - b)
	return arr[arr.length / 2 | 0]
}

function medianAlg(size, seq) {
    const arr = [].concat(...seq.last(size))
    return median(arr)
}

function sma(avg, size, seq) {
    const arr = seq.last(size).map(avg)
    const sum = arr.reduce((c, acc) => acc + c)
    return sum / arr.length
}

function wma(avg, size, seq) {
    const arr = seq.last(size).map(avg)
    const n = arr.length
    if (n === 1) {
        return arr[0]
    }

    let sum = 0
    for (let i = 0; i < n - 1; i++) {
        sum += (n - i) * arr[n - i - 1]
    }
    return sum * 2 / (n * (n + 1))
}

function ema(avg, a, seq) {
    const arr = seq.blocks.slice().map(avg)

    return arr.reduce((current, result, i) =>
        i === 0 ? current : a * current + (1 - a) * result)
}

// p - порядок
function emap(avg, p, a, seq) {
    if (p === 1) {
        return ema(avg, a, seq)
    }

    const arr = seq.blocks.slice().map(avg)
    if (arr.length === 1) {
        return arr[0]
    }

    const first = a * emap(avg, p - 1, a, seq)
    const second = (1 - a) * emap(avg, p, a, seq.until(arr.length - 1))
    return first + second
}

function Sequence(arr) {
    this.blocks = arr
}

Sequence.prototype.toString = function() {
    return this.blocks.map(vs => vs.join(' ')).join(' | ')
}

Sequence.prototype.until = function(until) {
    return new Sequence(this.blocks.slice(0, until))
}

Sequence.prototype.last = function(n) {
    return this.blocks.slice(-n)
}
