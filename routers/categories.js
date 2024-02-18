const express = require('express');
const router = express.Router();
const {Category} = require('../models/category');

router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if (!categoryList){
        res.status(500).json({success: false})
    }
    res.status(200).send(categoryList);
})

router.get(`/:_id`, async (req, res) =>{
    const category = await Category.findById(req.params._id);

    if (!category){
        res.status(500).json({success: false, message: "Category was not found"})
    }
    res.status(200).send(category);
})


router.post('/', async (req, res)=>{
    const category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color

    })
    await category.save();
    if(!category){
    return res.status(404).send('Category cannot be created')}
    res.send(category);
})
router.put('/:_id', async (req, res)=>{
    const category = await Category.findByIdAndUpdate(
        req.params._id, 
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        }, {new: true})
        if (!category){
            res.status(500).json({success: false, message: "Category was not found"});
        }
        res.status(200).send(category);

})
 
router.delete('/:_id', async(req, res)=>{

    const category = await Category.findByIdAndDelete(req.params._id);
    try{    
        if(category){
            return res.status(200).json({success: true, message: "category is deleted"})
        }
        else {
            return res.status(404).json({success: false, message: "category is not found"})
        }}
    catch(err){
        return res.status(400).json({success: false, error: err})
    }
})


module.exports = router;
