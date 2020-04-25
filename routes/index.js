const express = require("express");
const _ = require("lodash");
const CryptoJS = require("crypto-js");
const {
    main, 
    getAttendance, 
    getRecentAssignments,
    getStudentInfo
} = require("../auto");

const router = express.Router();

const decryptMiddleWare = (req, res, next) => {
    let {id, pass} = req.body
    if (!id || !pass) {
        return res.status(400).send({error: 'Must include ID and Password'});
    }
    pass = CryptoJS.AES.decrypt(pass, process.env.SECRET).toString(CryptoJS.enc.Utf8)
    req.body.pass = pass
    next()
}

router.post('/verify', decryptMiddleWare, async (req, res) => {
    const {id, pass} = req.body;
    try {
        const {page, browser} = await main(id, pass)
        const result = await getStudentInfo(page)
        await browser.close();
        return res.status(200).send({result})
    } catch(e) {
        console.log(e)
        res.status(400).send({error: 'Id or password incorrect'})
    }
})

router.post('/attendance', decryptMiddleWare, async (req, res) => {
    const {id, pass} = req.body;
    try {
        const {page, browser} = await main(id, pass)
        const result = await getAttendance(page)
        res.status(200).send({result})
        await browser.close();
    } catch(e) {
        console.log(e)
        res.status(400).send({error: 'Id or password incorrect'})
    }
});

router.post('/scrap', async (req, res) => {
    const {id, pass} = req.body;
    try {
        const {page, browser} = await main(id, pass)
        const result = await getAttendance(page)
        res.status(200).send({result})
        await browser.close();
    } catch(e) {
        console.log(e)
        res.status(400).send({error: 'Id or password incorrect'})
    }
});

router.post('/assignments', decryptMiddleWare, async (req, res) => {
    const {id, pass} = req.body;
    const {count, subject, stream} = req.query
    try {
        const {page, browser} = await main(id, pass)
        const result = await getRecentAssignments(page, count, stream, subject)
        res.status(200).send({result})
        await browser.close();
    } catch(e) {
        console.log(e)
        res.status(400).send({error: 'Id or password incorrect'})
    }
});

router.post('/student', decryptMiddleWare, async (req, res) => {
    const {id, pass} = req.body;
    try {
        const {page, browser} = await main(id, pass)
        const result = await getStudentInfo(page)
        res.status(200).send({result})
        await browser.close();
    } catch(e) {
        console.log(e)
        res.status(400).send({error: 'Id or password incorrect'})
    }
})


module.exports = router;