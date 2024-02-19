function errorHandler(err, req, res, next) {
    if(err.name === 'UnauthorizedError'){
        return res.status(401).json({ success: false, message: "User Not Authenticated" })
    }
    if(err.name === 'ValidationError'){
        return res.status(401).json({ success: false, message: err })
    }
    return res.status(500).json({ success: false, message: err })
}