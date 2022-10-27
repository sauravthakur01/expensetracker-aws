const Razorpay = require('razorpay');
const Order = require('../models/order');

require('dotenv').config()

exports.purchasepremium = (req,res,next)=>{
    try {
        var instance = new Razorpay({key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET});
        var options = {
            amount: 10000,
            currency: "INR",
            receipt: 'xyz'
        };

        instance.orders.create(options, (err, order) => {
            if(err){
                throw new Error(err);
            }
            res.json({order, key_id: instance.key_id});
            // req.user.createOrder({orderid: order.id, status: 'PENDING'}).then(()=>{
            //     res.json({order, key_id: instance.key_id});
            // }).catch(err=>{
            //     throw new Error(err);
            // })
            
        });
    } catch (err) {
        res.status(403).json({ message: 'Sometghing went wrong', error: err})
    }
}

exports.updateTransactionStatus = async(req,res,next)=>{
    try {
        const {razorpay_payment_id , razorpay_order_id , razorpay_signature} = req.body ;

        await req.user.createOrder({
            paymentId:razorpay_payment_id,
            orderId:razorpay_order_id,
            signature:razorpay_signature,
            status:"successful"
        })

        Order.findAll({where: {orderId: razorpay_order_id}})
        .then((order) => {
            if(order[0].status == "successful") {
                req.user.update({ispremiumuser: true})
                res.status(200).json({message: "Successfully Saved"});
            }
        })
        .catch(err => {throw new Error(err)});

        // Order.findOne({where : {orderid : razorpay_order_id  }}).then(order=>{
        //     order.update({ paymentid: razorpay_payment_id , signature:razorpay_signature , status: 'SUCCESSFUL'}).then(()=>{
        //         req.user.update({ispremiumuser : true})
        //         return res.status(202).json({sucess: true, message: "Transaction Successful"});
        //     }).catch((err)=>{
        //         throw new Error(err);
        //     })
        // }).catch(err=>{
        //     throw new Error(err);
        // })
    } catch (error) {
        res.status(403).json({ errpr: err, message: 'Sometghing went wrong' })
    }
}
