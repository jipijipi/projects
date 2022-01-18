const fs = require('fs');

const users = JSON.parse(fs.readFileSync(`${__dirname}/../starter/dev-data/data/users.json`));



exports.getAllusers = (req, res) => {

    res.status(500).json({
        status: 'error',
        message: 'not implemented for all users'
    })

}
exports.getUser = (req, res) => {

    res.status(500).json({
        status: 'error',
        message: `not implemented for ID ${req.params['id']}`,
    })

}

exports.addUser = (req, res) => {

    res.status(500).json({
        status: 'error',
        message: 'not implemented'
    })

}

exports.deleteUser = (req, res) => {

    res.status(500).json({
        status: 'error',
        message: 'not implemented'
    })

}
exports.updateUser = (req, res) => {

    res.status(500).json({
        status: 'error',
        message: 'not implemented'
    })

}