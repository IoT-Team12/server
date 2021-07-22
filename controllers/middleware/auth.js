const jwt = require('jsonwebtoken')
const User = require('../../models/User')

const auth = async(req, res, next) => {
    try {
        var cookie = req.headers.cookie;
        console.log(cookie)
        var cookies = cookie.split(';');
        var tmp = cookies[0];
        var tokens = tmp.split('=')
        var token = tokens[1]
        //console.log(token)
        // const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.JWT_KEY)
        const user = await User.findOne({ _id: data._id, 'tokens.token': token })
        if (!user) {
            res.status(401).send({ error: 'Not authorized to access this resource' })
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}

module.exports = auth