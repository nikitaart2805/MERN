//Подключени библиотек
const {Router} =require('express')
const User = require('../models/user')
const AMZ = require('../models/grabber')
const jwt = require('jsonwebtoken')
const router   = Router()
const config = require('config')
const bcrypt= require('bcryptjs')
const{check,validationResult} = require('express-validator')
const axios = require('axios')


//  /api/auth
router.post(    //обработка запроса пост
    '/register',
    [
      check('email', 'uncorrect email').isEmail(), // Проверка соответствия эмейла и пароля
      check('password', 'Minimum 6 charackters')
          .isLength ({min:6})
    ],

    async (req,res) =>{  //начало выполнения функции
      try {
        const  errors = validationResult(req) // забираем все ошибки валидации
        if (!errors.isEmpty()){ // в случае ошибки заканчиваем функцию и выводим приведенный массив ошибок и сообшение
          return res.status(400).json({
            errors : errors.array(),
            message: 'Uncorect Email!'
          })
        }
        const {email,password} = req.body    // забираем данные с фронта и присваеваем переменным
        const candidate = await User.findOne({ email}) // создаем кандидата для проверки существования имейла
        if (candidate){ //проверяем сушествование имейла
          return res.status(400).json({ message: 'Такой пользователь существует'}) // закрываем функцию в случае сущуствования
        }
        const  hashedPassword = await bcrypt.hash(password,12) // шифруем пароль
        const amztoken = ""
        const user = new User({email,password: hashedPassword ,amztoken}) //создаем пользователя
        await user.save() // сохраняем в базе
        res.status(201).json({ message: 'Пользователь создан'}) // результат в случае успеха
      }
      catch (e) {
        res.status(500).json({messege: 'Something going wrong'})
      }
    })

router.post(
    '/login',
    [
      check('email' ,'Введите корректный имейл').normalizeEmail().isEmail(),
      check('password', 'Ввелите пароль').exists()
    ],
    async (req,res) =>{// начало создания функции для логина

      try {

        const  errors = validationResult(req) // забираем все ошибки валидации
        if (!errors.isEmpty()){ // в случае ошибки заканчиваем функцию и выводим приведенный массив ошибок и сообшение
          return res.status(400).json({
            errors : errors.array(),
            message: 'Uncorect Email'
          })
        }
        const {email, password} =req.body
        const user = await User.findOne({email})
        if(!user){
          return res.status(400).json({ message: 'Пользователь не найден '})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
          return res.status(400).json({ message: 'Неверный пароль'})
        }
        const token = jwt.sign(
            { userId:user.id },
            config.get('jwtSecret'),
            { expiresIn: '1h'}

        )
        const AmzToken =
            await  axios.post('https://api.amazon.com/auth/register', {
              requested_extensions: ["device_info", "customer_info"],
              cookies: {
                "website_cookies": [],
                "domain": ".amazon.com"
              },
              registration_data: {
                "domain": "Device",
                "app_version": "0.0",
                "device_type": "A3NWHXTQ4EBCZS",
                "os_version": "14.0.1",
                "device_serial": "F1ED2EFB94B54EC1952621A0AB7228D9",
                "device_model": "iPhone",
                "app_name": "Amazon Flex",
                "software_version": "1"
              },
              auth_data: {
                user_id_password: {
                  "user_id": `${email}`,
                  "password": `${password}`
                }
              },
              user_context_map: {
                "frc": "AE6+q2dGLMpcIuEZgxnwylYwVkavmtW9uWhN7XRtDRT07bYzC0DU1siOez10kDY9jgZK4j0kV5HMe\\/9hBVIE8z+tp4HkJENXX2MD+YUhDjtzk42mtFkCwCHdyAE5uYwDXOmb4plcDoAt6AN8p\\/BS+wlgihieEoBvzobLmnMKY9KDGZHPyhb\\/TRs0rh0jEe+ImK2fPAx1lb58vQirhZYDTQlmvoKyezYYlbT2Yclikz30rmHCXj95CEqop0ysf1FwHko14f5RmXuiRjpCec8pHzM6ymAuYaJwdiMsWzQnn+wqvR\\/7BVaqQRlEghGpezCFxclNnpZZlCgp8snsNHKgEKd1lAJpw5ebZ\\/KNZuYprBRGCpBypggrKpMrUTPh6X3EgXQ4I2zGa8mbMwpYO+5K9SQ6k1SbAd3nAg=="               },
              requested_token_type: ["bearer", "mac_dms", "website_cookies"]
            })
                .then(res => {
                  const SignToken = res.data.response.success.tokens.bearer.access_token;

                  return (SignToken);
                })
          console.log(AmzToken)
        await User.update({"email":email},{ $set: { "amztoken": AmzToken } })
        // const amz = User({amztoken}) //создаем пользователя
        // await amz.save()
        // console.log(AmzToken)
        res.json({ AmzToken, token , userId: user.id })
      }
      catch (e) {
        console.log(e)
        res.status(500).json({messege: 'Something going wrong'})
      }
    })

module.exports = router
