const express = require("express");
const router =  express.Router();
const {Product} = require('../models/product');
const { Category } = require("../models/category");
const mongoose = require("mongoose");
const multer = require('multer');
const { FILE } = require("dns");
// http://localhost:4000/api/v1/products

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'

}

//DISK STORAGE FOR IMAGE 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid Image type')
        if(isValid){
            uploadError = null
        }

      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        
    const filename = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${filename}-${Date.now()}.${extension}`)
    }
  })
  
  const uploadOptions = multer({ storage: storage })



router.get(`/`, async (req, res) =>{
    let filter = {};
    if(req.query.categories){
        filter =  {category: req.query.categories.split(',')}
    }
    const productList = await Product.find(filter).populate('category');
    if (!productList){
        res.status(500).json({success: false, message: "Products Could Not be Fetched"});
    }
    res.send(productList);
}) 

router.get('/:_id', async (req, res)=>{
    const product = await Product.findById(req.params._id).populate('category');
    if (!product){
        res.status(400).json({success: false, message: "Product was not found"});
    }
    res.status(200).send(product);
})

router.post(`/`, uploadOptions.single('image'), async (req, res) =>{
    const category = await Category.findById(req.body.category)
    if (!category){
        res.status(400).json({success: false, message: "Invalid Category"})
    }
    const file = req.file;
    if (!file){
        res.status(400).json({success: false, message: "No Imagefile in request"})
    } 

    const fileName  = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })
    await product.save();
    try{
        if (product){
            res.status(201).send(product)
        }
        if(!product){
            res.status(400).json({ message: "Product could not be created", success: false})
        }
    }catch(err){
        res.status(500).json({ error: err, success: false })
    }
  })

router.put('/:_id', async (req, res)=>{
    if(!mongoose.isValidObjectId(req.params._id)){
        res.status(400).json({success: false, message: "Invalid Product ID"})
    }
    const category = await Category.findById(req.body.category)
    if (!category){
        res.status(400).json({success: false, message: "Invalid Category"})
    }
    const productcheck = await Product.findById(req.params.id);
    if(!productcheck){
        res.status(400).json({success: false, message: "Invalid Product"})
    }

    const file = req.file;
    let imagePath;
    if (file){
        const fileName  = req.file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
        imagePath
    }else{
        imagePath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params._id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagePath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        }, {new: true})

    if (!updatedProduct){
        return res.status(500).send('The Product could not be Updated')
    }
    res.send(updatedProduct);
})

router.delete('/:_id', async (req,res)=>{
    const product = await findByIdAndDelete(req.params._id)
    try{
        if (!product){
            res.status(404).json({ success: false, message: "Product was not found"})
        }
        res.status(200).json({ success: true, message: "Product was Deleted"})
    }catch(err){
        res.status(400).json({ success: false, error: err})
    }
})
router.get('/get/count', async (req, res)=>{
    const productCount = await Product.countDocuments({})
    if (!productCount){
        res.status(404).json({ success: false, message: "Product was not found"})
    }
    res.status(200).send({
        count: productCount
    })
})

router.get('/get/featured/:count', async (req, res)=>{
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true}).limit(+count);  
    try{if (!products){
        res.status(404).json({ success: false, message: "Product was not found"})
    }
    res.status(200).send(products)
    }catch(err){
        res.status(500).json({ success: false, error: err})
    }
})

router.put('/gallery-images/:_id', uploadOptions.array('images', 10), async (req, res)=>{
    if(!mongoose.isValidObjectId(req.params._id)){
        res.status(400).json({success: false, message: "Invalid Product ID"})
    }
    
    const files = req.files
    let imagePaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;

    if (files){
        files.map(file =>{
            imagePaths.push(`${basePath}${file.fileName}`);
        })
    }
    
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagePaths
        },
        {new: true}
    )
    if (!product){
        return res.status(500).send('The Product could not be Updated')
    }
    res.send(product);
})

module.exports = router;