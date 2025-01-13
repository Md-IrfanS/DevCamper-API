const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt =require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],        
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]     
    },
    role: {
        type: String,
        enum: ['user','publisher', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        select: false,
        minLength: 6
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,    
},{
    timestamps: true
});


// Encrypt password using bcryptjs
UserSchema.pre('save', async function(){
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
});


// Sign JWT and return 
UserSchema.methods.getSignedJWTToken = function (){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
};


// Match user entered password to hash password in database
UserSchema.methods.matchPassword = async function (enteredPassword){
    return await bcryptjs.compare(enteredPassword, this.password)
};


const UserModel = mongoose.model('user', UserSchema);
module.exports = UserModel;