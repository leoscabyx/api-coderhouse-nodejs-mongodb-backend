function getViewRegister (req, res) {
    res.render('register', { page: 'Registro' })
}

function redirectViewLogin (req, res) {
    res.redirect('/login')
}

function getViewRegisterFail (req, res) {
    res.render('register-error', { page: 'Fail Register' })
}

function getViewLogin (req, res) {
    res.render('login', { page: 'Login'})
}

function redirectViewInicio (req, res) {
    res.redirect('/')
}

function getViewLoginFail (req, res) {
    res.render('login-error', { page: 'Fail Login' })
}

function getViewLogout (req, res) {
    if(req.user){
        const username = req.user.username
        req.session.destroy(err => {
          if (err) {
            res.json({ status: 'Logout ERROR', body: err })
          } else {
            res.render('logout', { page: 'Logout', username: username })
          }
        })
    }else{
        res.redirect('/login')
    }
}

export {
    getViewRegister,
    redirectViewLogin,
    getViewRegisterFail,
    getViewLogin,
    redirectViewInicio,
    getViewLoginFail,
    getViewLogout
}
