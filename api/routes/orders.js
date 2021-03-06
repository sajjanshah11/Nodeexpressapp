const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');

const product = require('../models/product');

router.get('/', (req, res, next) => {
    Order.find()
        .populate('product','name')
        .select('product quantity _id')
        .exec()
        .then(docs => {
            console.log(docs),
                res.status(200).json({
                    count: docs.length,
                    orders: docs.map(doc => {
                        return {
                            _id: doc.id,
                            product: doc.product,
                            quantity: doc.quantity,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/orders/' + doc._id
                            }

                        }
                    })
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
});

router.post('/', (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: 'product not found'
                })
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                product: req.body.productId,
                quantity: req.body.quantity
            });
            return order
                .save()
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/' + result._id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
});


router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId)
        .populate('product')
        .exec()
        .then(order => {
            if(!order){
                res.status(404).json({
                    message: 'order not found'
                });
            }
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders'
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
});


router.delete('/:orderId', (req, res, next) => {
    Order.remove({ _id: req.params.orderId })
        .exec()
        .then(order => {
                res.status(200).json({
                message: 'Order Deleted',
                request: {
                    type: 'POST',
                    url: "http://localhost:3000/orders/",
                    body: { productId: "Id", quantity: "Number" }
                }
            })
        })
        .catch(err => {
            res.status()
        })

});

module.exports = router;