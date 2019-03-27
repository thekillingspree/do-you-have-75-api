const express = require("express");
const _ = require("lodash");

const {main} = require("../auto");

const router = express.Router();

router.post('/scrap', (req, res) => {
    const {id, pass} = req.body;
    main(id, pass).then((result) => {
        res.status(200).send({result})
    }).catch((err) => {
        res.status(200).send({error: 'Id or password incorrect'})
    });;
});

module.exports = router;