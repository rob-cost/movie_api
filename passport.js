const passport = require ('passport'),
    LocalStrategy = require ('passport-local').Strategy,
    Models = require ('./models.js'),
    passportJWT = require ('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

passport.use (
    new LocalStrategy (
        {
            usernameField: 'Username',
            passwordField: 'Password',
        },
        async (username, password, callback) => {
            console.log (`${username} ${password}`);
            try {
            const userName = new RegExp(`^${username}$`, 'i');
            const user = await Users.findOne({Username: userName})

            console.log("User found:" + user);

                if (!user) {
                    console.log (`Incorrect username`);
                    return callback (null, false, {
                        message: 'Incorrect username',
                    });
                }
                const isValid = await user.validatePassword(password);

                console.log("Password match result: " + isValid)

                if (!isValid) {
                    console.log('Incorrect password');
                    return callback(null, false, {message: 'Incorrect password'});
                }
                console.log('Finished');
                return callback (null, user);
            }
            catch (error) {
                    console.log(error);
                    return callback (error);
                }
            })
        
    )


passport.use (
    new JWTStrategy (
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'your_jwt_secret'
        },
        async (jwtPayload, callback) => {
            return await Users.findById(jwtPayload._id)
            .then ((user) => {
                return callback(null, user);
            })
            .catch((error) => {
                return callback (error)
            });
        }
    )
)