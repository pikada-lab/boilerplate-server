var QRCode = require("qrcode");
var speakeasy = require("speakeasy");
// var secret = speakeasy.generateSecret();
// const two_factor_temp_secret = secret.base32;
// var url = speakeasy.otpauthURL({ secret: secret.ascii, label: 'Fake-MM (info@fake-mm.ru)', algorithm: 'sha512' });

// // Генерим код 
// console.log("two_factor_temp_secret",two_factor_temp_secret);
// QRCode.toDataURL(url, function (err, data_url) {
//   console.log(data_url);
// });

// Проверяем код
var userToken = "302325"; // То что вводит пользователь из приложения
const base32secret = "HFYCSMKYHN2VCVTVM42VG3DTOE3CS3BDEFSCKILEKRGSI2LCFBUQ"; // то что сгенерил secret.base32
var verified = speakeasy.totp.verify({
  secret: base32secret,
  encoding: "base32",
  token: userToken
});
console.log(verified ? "Авторизовать" : "Не авторизовывать");
