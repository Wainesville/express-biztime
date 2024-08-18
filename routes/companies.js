const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError");
const db = require("../db");

let router = new express.Router();

router.get("/", async function (req, res, next){
    try{
        const result = await db.query(
            `SELECT code, name
             FROM companies
             ORDER BY name`
        );
        return res.json({"companies": results.rows});
    }

    catch(e){
        return next(e);
    }
});


router.get("/:code", async function (req,res,next){
    try{
        let code = req.params.code;

        const compResult = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code = $1`,
            [code]
        );

        if (compResults.rows.length === 0){
            throw new ExpressError(`Company Does Not Exsist: ${code}`, 404)
        }

        const company = compResults.rows[0];
        const invoices = invResults.rows;


        company.invoices = invoices.map(inv => inv.id);

        return res.json({"company": company});

    }
    catch(e){
        return next(e);
    }
});


router.post("/", async function (req, res, next){
    try{
        let {name, description} = req.body;
        let code = slugify(name, {lower: true});

        const results = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1 $2 $3)
            RETURNING code, name, description`,
            [code, name, description]);
        
        return res.status(201).json({"company": result.rows[0]});
    }

    catch(e){
        return next(e);
    }
});

router.put("/:code", async function (req, res, next) {
    try{
        let {name, desciption} = req.body;
        let code = req.params.code;

        const result = await db.query(
            `UPDATE companies
            SET name = $1, description = $2
            WHERE code = $3
            RETURNING code, name, description`,
            [name, description, code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`No company exsists; ${code}`, 404)
        }else{
            return res.json({"company": results.rows[0]});
        }
    }

    catch(e){
        return(e)
    }
});

router.delete("./:code", async function (req, res, next){
    try{
        let code = req.params.code;

        const result = await db.query(
            `DELETE FROM companies
            WHERE code =$1
            RETURNING id`,
            [code]);

            if(results.rows.length == 0){
                throw new ExpressError(`Company Does Not Exsist: ${code}`, 404)
            } else {
                return res.json({"status": "deleted"});
            }
    }

    catch(e){
        return next(e);
    }
});

module.exports = router;

