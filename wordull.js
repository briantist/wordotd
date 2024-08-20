// https://stackoverflow.com/a/72732727/3905079
function RNG(seed) {
    var m = 2**35 - 31
    var a = 185852
    var s = seed % m
    return function () {
        return (s = s * a % m) / m
    }
}

// https://stackoverflow.com/a/2450976/3905079
function shuffle(array, seed) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(RNG(seed)() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
}

function doThing() {
    const seed = 22935094503.601917 // chosen by fair dice roll
    const chatepoch = 19954 // 2024-08-19
    const date = new Date()
    const offset = date.getTimezoneOffset() * 60 * 1000

    var fullDaysSinceEpoch = Math.floor((date - offset) / 8.64e7)
    var chatindex = fullDaysSinceEpoch - chatepoch
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
    let dateshow = date.toLocaleDateString(undefined, options)
    document.getElementById('date').innerText = dateshow
    let url = 'https://gist.githubusercontent.com/briantist/f23e2edfcb2d28a2cbb84fef93724f23/raw/6bfa15d263d6d5b63840a8e5b64e04b382fdb079/valid-wordle-words.txt'
    fetch(url)
        .then(res => res.text())
        .then(txt => {
            let lines = txt.split(/\r?\n/)
            shuffle(lines, seed)
            let word = lines[chatindex]
            console.log("~" + word)
            for(i=5; i--;)
                document.getElementById('letter' + i).innerText = word.charAt(i)
        })
}
