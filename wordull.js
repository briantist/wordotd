// https://stackoverflow.com/a/72732727/3905079
function RNG(seed) {
    var m = 2 ** 35 - 31
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

// https://stackoverflow.com/a/563442/3905079
Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

// https://css-tricks.com/snippets/javascript/get-url-variables/
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}

function getRequestedDate() {
    // https://stackoverflow.com/a/31732581/3905079
    var date = getQueryVariable('date').replace(/-/g, '\/')
    if (date) {
        try {
            d = new Date(date)
            // https://stackoverflow.com/a/1353711/3905079
            if (d instanceof Date && !isNaN(d)) {
                return d
            }
            else {
                return false
            }
        }
        catch {
            return false
        }
    }
    else {
        return false
    }
}

async function getWordList(url = 'https://gist.githubusercontent.com/briantist/f23e2edfcb2d28a2cbb84fef93724f23/raw/6bfa15d263d6d5b63840a8e5b64e04b382fdb079/valid-wordle-words.txt') {
    const seed = 22935094503.601917 // chosen by fair dice roll
    return await fetch(url)
        .then(res => res.text())
        .then(txt => {
            lines = txt.split(/\r?\n/)
            shuffle(lines, seed)
            return lines
        })
}

function getDateInfo(date = new Date()) {
    const chatepoch = 19954 // 2024-08-19
    const offset = date.getTimezoneOffset() * 60 * 1000

    var fullDaysSinceEpoch = Math.floor((date - offset) / 8.64e7)
    var chatindex = fullDaysSinceEpoch - chatepoch
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }

    return {
        'date': date,
        'offset': offset,
        'chatindex': chatindex,
        'dateshow': function (relday = 0, format = undefined, opts = options) {
            return this.date.addDays(relday).toLocaleDateString(format, opts)
        },
        'dateiso': function (relday = 0) {
            return this.dateshow(relday = relday, format = 'sv', opts = {})
        },
    }
}

function setWord(word, id_prefix, reference = document) {
    for (i = 5; i--;)
        reference.querySelector('#' + id_prefix + i).innerText = word.charAt(i)
    reference.querySelector('#definition').href = 'https://en.wiktionary.org/wiki/' + word
}

function setDate(dateinfo, relday = 0, reference = document) {
    reference.querySelector('#date').innerText = dateinfo.dateshow(relday)
    reference.querySelector('#datelink').href += '?date=' + dateinfo.dateiso(relday)
}

async function doFrontPage() {
    var dateinfo = getDateInfo()
    setDate(dateinfo)

    var lines = await getWordList()
    let word = lines[dateinfo.chatindex]
    setWord(word, 'letter')
}

async function doHistoryPage() {
    var date = getRequestedDate('date')
    var dateinfo
    var limit = 0
    console.log(date)
    if (date) {
        dateinfo = getDateInfo(date)
        limit = dateinfo.chatindex
    }
    else {
        dateinfo = getDateInfo()
    }

    var lines = await getWordList()

    var row = document.getElementById('row').cloneNode(true)

    var tbody = document.getElementById('tbody')
    tbody.innerHTML = ''

    for (let i = dateinfo.chatindex; i >= limit; --i) {
        var thisRow = tbody.insertRow()
        thisRow.innerHTML = row.innerHTML
        setDate(dateinfo, relday = -(dateinfo.chatindex - i), reference = thisRow)
        setWord(lines[i], 'letter', thisRow)
    }
}
