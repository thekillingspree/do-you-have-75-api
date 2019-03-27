var puppeteer = require('puppeteer');

const main = (id, pass) => {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({headless: true});
            const page = await browser.newPage();
            await page.setViewport({ width: 1366, height: 768});
            await page.goto("https://www.icloudemserp.com/tpct/");
            await login(page, id, pass);
            const result = await goToAttendance(page);
            resolve(result);
            await page.screenshot({path: `attendance.png`});
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
        for (let i = 1; i < trs.length; i++) {
            let attendance = await trs[i].$eval("td:nth-child(5)", td => td.innerText);
            attendance = Number(attendance);
            const sub = await trs[i].$eval("td:nth-child(3)", td => td.innerText);
            result.push({sub, attendance})
            avg += attendance;
        }
        return {result, avg: (avg / (trs.length - 1))}
    } catch(e) {
        console.log(e);
    }
}

const login = async (page, id, pass) => {
    console.log("Logging in");
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
        await page.waitForNavigation({waitUntil: 'load', timeout: 10000});
        console.log("Logged In.");
    } catch(e) {
        console.log(e);
    }
} 

module.exports = {main}