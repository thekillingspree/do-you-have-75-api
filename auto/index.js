var puppeteer = require('puppeteer');
var subjects = require('../subject.json')
const main = (id, pass) => {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setViewport({ width: 1366, height: 768});
            await page.goto("https://www.icloudemserp.com/tpct/");
            const result = await login({browser, page}, id, pass);
            if (result) 
                resolve(result);
            else    
                reject();
        } catch (e) {
            reject();
        }
    });
}

const getAttendance = async (page) => {
    // const main = await page.frames().find(frame => frame.name() == "main");
    await page.goto("https://www.icloudemserp.com/corecampus/student/attendance/subwise_attendace_new.php");
    try {
        const trs = await page.$$("#searchfrom > table.table.table-bordered.table.responsive > tbody > tr");
        const result = [];
        let avg = 0;
        for (let i = 1; i < trs.length - 1; i++) {
            let attendance = await trs[i].$eval("td:nth-child(6)", td => td.innerText);
            attendance = Number(attendance);
            const sub = await trs[i].$eval("td:nth-child(3)", td => td.innerText);
            const count = await trs[i].$eval("td:nth-child(5)", td => td.innerText.split('/'));
            const current = Number(count[0]);
            const total = Number(count[1]);
            result.push({sub, attendance, count: {current, total}})
            avg += attendance;
        }
        const summaryElement = trs[trs.length - 1];
        const summary = await summaryElement.$eval("td:nth-child(2)", td => {
            const txt = td.innerText.split('/');
            const current = Number(txt[0]);
            const total = Number(txt[1]);
            const per = (current / total) * 100;
            return {
                current,
                total,
                per
            }
        });
        return {result, avg: (avg / (trs.length - 2)), summary}
    } catch(e) {
        console.log(e);
    }
}

const getRecentAssignments = async (page, count=5, stream="", subject="") => {
    try {
        await page.goto("https://www.icloudemserp.com/corecampus/student/assignments/myassignments.php")
        const assignmentTable = await page.$('body > table > tbody > tr > td:nth-child(2) > table.table.table-bordered')
        let assignmentRows = await assignmentTable.$$eval("tbody > tr", (elements) => {
            elements = elements.filter(e => e.getAttribute("bgcolor"))
            elements = elements.map(e => {

                let reference =  e.querySelector("td:nth-child(8) > font > a");
                let assignmentFile =  e.querySelector("td:nth-child(7) > font > a");
                reference = reference ? reference.href : assignmentFile ? assignmentFile.href : "No File"

                return {
                    subject: e.querySelector("td:nth-child(3) > a").innerText,
                    name: e.querySelector("td:nth-child(4)").innerText,
                    due: e.querySelector("td:nth-child(2)").innerText,
                    reference
                }
            })
            return elements
        });
        if (stream && subjects[stream] && subject) {
            
            const subKey = findSubject(stream, subject)
            console.log(stream, subKey)
            if (subKey.length > 0)
                assignmentRows = assignmentRows.filter(assignment => subKey.includes(assignment.subject))
            else
                return []
        }
        return assignmentRows.slice(0, count)
    } catch(e) {
        throw new Error(e)
    }
}

const findSubject = (stream, subject) => {
    const results = []
    for (const key in subjects[stream]) {
        const element = subjects[stream][key];
        console.log(element)
        console.log(element, subject)
        for (const s of element) {
            if (s.includes(subject) || subject.includes(s)) 
                results.push(key)
        }
    }
    return results;
}

const getStudentInfo = async (page) => {
    try {
        await page.goto("https://www.icloudemserp.com/corecampus/student/myprofile/myprofile.php")
        
        const student = await page.$eval('#home > div.row', row => {
            const name = row.querySelector('div:nth-child(2) > h4 > span.middle').innerText;
            const sem = row.querySelector('div:nth-child(3) > div.profile-user-info > div:nth-child(9) > div.profile-info-value > span').innerText;
            const stream = row.querySelector('div:nth-child(3) > div.profile-user-info > div:nth-child(8) > div.profile-info-value > span').innerText;
            const dob = row.querySelector('div:nth-child(2) > div.profile-user-info > div:nth-child(5) > div.profile-info-value > span').innerText;
            return {
                name,
                sem,
                stream,
                dob
            }
        })
         
        return student

    } catch(e) {
        throw new Error(e)
    }

}


const login = async ({browser, page}, id, pass) => {
    try {
        await page.evaluate((id, pass) => {
            
            const usid = document.getElementsByName("userid")[0];
            const pwd = document.getElementsByName("pass_word")[0];
            const bid = document.getElementsByName("branchid")[1];
            const form = document.getElementsByTagName("form")[0];
            usid.value = id;
            pwd.value = pass;
            bid.value = 17;
            form.submit();
        }, id, pass);
        await page.waitForNavigation({waitUntil: 'load', timeout: 4000});
        return {browser, page}
    } catch(e) {
        console.log(e);
        throw new Error('Unable to Login')
    }
} 

module.exports = {main, getAttendance, getRecentAssignments, getStudentInfo}