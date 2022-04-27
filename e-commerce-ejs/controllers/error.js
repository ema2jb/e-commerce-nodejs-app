exports.get404 = (req, res)=>{
    //res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
    res.render("404", {pageTitle:"page not found", isAuthenticated:req.session.isLoggedIn})
}

exports.get500 = (req, res)=>{
    //res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
    res.render("500", {pageTitle:"Error", isAuthenticated:req.session.isLoggedIn})
}