//Подключени библиотек
const {Router} =require('express')
const User = require('../models/User')
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
          const frc = ""
          const SN = ""
          const area = ""
          const refreshtoken = ""
          const areas = []
          const SelectedArea = []
          const SelectedAreaName = []
          const time = 0
        const user = new User({email,password: hashedPassword ,amztoken,frc,SN,area,refreshtoken,areas,SelectedArea,SelectedAreaName,time}) //создаем пользователя
        await user.save() // сохраняем в базе
        res.status(201).json({ message: 'Пользоватеь создан'}) // результат в случае успеха
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

          const errors = validationResult(req) // забираем все ошибки валидации
          if (!errors.isEmpty()) { // в случае ошибки заканчиваем функцию и выводим приведенный массив ошибок и сообшение
              return res.status(400).json({
                  errors: errors.array(),
                  message: 'Uncorect Email'
              })
          }
          const {email, password} = req.body
          const user = await User.findOne({email})
          if (!user) {
              return res.status(400).json({message: 'Пользователь не найден '})
          }
          const isMatch = await bcrypt.compare(password, user.password)
          if (!isMatch) {
              return res.status(400).json({message: 'Неверный пароль'})
          }
          UserID = user.id
          PrevFrc = await User.findById(UserID, function (err, docs) {
              FRC = docs
              return FRC
          })
          let frc = PrevFrc.frc
          let serial = PrevFrc.SN
          var date = new Date();
          var current_time = date.getTime();
          let base_time = PrevFrc.time
          let time_difference = current_time - base_time
          let optionalamztoken = PrevFrc.amztoken
          let optionalrefreshtoken = PrevFrc.refreshtoken
          console.log("assd" + optionalrefreshtoken)
          const token = jwt.sign(
              {userId: user.id},
              config.get('jwtSecret'),
              {expiresIn: '1h'}
          )
          if (time_difference > 46400000) {
              const TemporaryTokens =
                  await axios.post('https://api.amazon.com/auth/register', {
                      requested_extensions: ["device_info", "customer_info"],
                      cookies: {
                          "website_cookies": [],
                          "domain": ".amazon.com"
                      },
                      registration_data: {
                          "domain": "Device",
                          "app_version": "0.0",
                          "device_type": `A3NWHXTQ4EBCZS`,
                          "os_version": "14.0.1",
                          "device_serial": `${serial}`,
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
                      "user_context_map": {
                          "frc": `${frc}`
                      },
                      requested_token_type: ["bearer", "mac_dms", "website_cookies"]
                  })
                      .then(res => {
                          const SignToken = res.data.response.success.tokens.bearer.access_token;
                          const REFRESH = res.data.response.success.tokens.bearer.refresh_token;
                          return ([SignToken, REFRESH]);
                      })
              let AmzToken = TemporaryTokens[0]
              const refreshtoken = TemporaryTokens[1]
              const area =
                  await axios.get('https://flex-capacity-na.amazon.com/eligibleServiceAreas', {
                      headers: {
                          "Accept": ":application/json",
                          "x-amz-access-token": `${AmzToken}`
                      }
                  })
                      .then(res => {
                          const AREA = res.data.serviceAreaIds[0];
                          return (AREA);
                      })

              const Areas =
                  await axios.get('https://flex-capacity-na.amazon.com/pooledServiceAreasForProvider', {
                      headers: {
                          "Accept": ":application/json",
                          "x-amz-access-token": `${AmzToken}`
                      }
                  }).then(res => {
                      const Gnidos = res.data.serviceAreaPoolList;
                      return (Gnidos);
                  })




              await User.update({"email": email}, {
                  $set: {
                      "time":current_time,
                      "amztoken": AmzToken,
                      "area": area,
                      "refreshtoken": refreshtoken,
                      "areas" :Areas
                  }
              })
              // const amz = User({amztoken}) //создаем пользователя
              // await amz.save()
              // console.log(AmzToken)
              res.json({Areas,AmzToken, token, userId: user.id})
          }
          else {

           let AmzToken =  await  axios
               .post('https://api.amazon.com/auth/token', {
                   "source_token": `${optionalrefreshtoken}`,
                   "source_token_type" : "refresh_token",
                   "requested_token_type": "access_token",
                   "app_name": "com.amazon.rabbit"
               }, {
                   headers: {

                       "Content-Type":"application/json"




                   }

               })
                  .then(res => {
                      const refreshtoken = res.data.access_token;
                      return (refreshtoken);
                  })
              const Areas =
                  await axios.get('https://flex-capacity-na.amazon.com/pooledServiceAreasForProvider', {
                      headers: {
                          "Accept": ":application/json",
                          "x-amz-access-token": `${AmzToken}`
                      }
                  }).then(res => {
                      const Gnidos = res.data.serviceAreaPoolList;


                      return (Gnidos)
                  })



              await User.update({"email": email}, {
                  $set: {
                      "amztoken": `${AmzToken}`,
                      "refreshtoken": `${optionalrefreshtoken}`
                  }
              })

              res.json({token : token, userId: user.id, AmzToken, Areas})
          }
      }



      catch (e) {
        console.log(e)
        res.status(500).json({messege: 'Something goings wron'})
      }
    })

module.exports = router