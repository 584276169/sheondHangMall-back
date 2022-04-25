const jwt = require('jsonwebtoken');	//引入jwt包
let secret="shucai";
let encrypt = (data, time) => {
 

  return jwt.sign(data, secret, { expiresIn: time });
}


let decrypt = (token) => {

  try {
    let data = jwt.verify(token, secret);
    return {
      id: data.id,
      token: true
    }
  } catch (err) {
    return {
      id: err,
      token: false
    }
  }
}

module.exports = {	
  encrypt,
  decrypt
}