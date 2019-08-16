var puppeteer = require('puppeteer');

const main = (id, pass) => {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setViewport({ width: 1366, height: 768});
            await page.goto("https://www.icloudemserp.com/tpct/");
            const result = await login(page, id, pass);
            console.log(result);
            if (result) 
                resolve(result);
            else    
                reject();
            await browser.close();
        } catch (e) {
            reject();
        }
    });
}

const goToAttendance = async (page) => {
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

const login = async (page, id, pass) => {
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
        await page.waitForNavigation({waitUntil: 'load', timeout: 5000});
        const result = await goToAttendance(page);
        return result;
    } catch(e) {
        console.log(e);
        return false;
    }
} 

module.exports = {main}