const express = require("express");
const _ = require("lodash");

const {main} = require("../auto");

const router = express.Router();

router.post('/scrap', (req, res) => {
    const {id, pass} = req.body;
    if (!id || !pass) {
        return res.status(400).send({error: 'Must include ID and Password'});
    }
    main(id, pass).then((result) => {
        res.status(200).send({result})
    }).catch((err) => {
        res.status(400).send({error: 'Id or password incorrect'})
    });;
});

module.exports = router;