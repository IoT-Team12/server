const mongoose = require('mongoose');
const validator = require('validator');
const md5 = require('md5');
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
        username:{
            type: String,
            require: true,
            unique: true,
            trim: true
        },
        password:{
            type: String,
            require: true,
            minLength: 6
        },
        email:{
            type: String,
            require: true,
            unique: true,
            lowercase: true,
            validate: value => {
                if(!validator.isEmail(value)){
                    throw new Error({error: 'Invalid Email'})
                }
            }
        },
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }]
    },
    {
        timestamps: true
    }
    ,{
        collection: 'User'
    }
)

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await md5(user.password)
    }
    next()
})

userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY)
    console.log(token)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}



const userSchemaModel = mongoose.model('user', userSchema);
module.exports = userSchemaModel;
