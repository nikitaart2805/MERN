const {Router} = require('express')
const config = require('config')
const User = require('../models/user')
const auth = require('../middleware/auth.middleware')
const axios = require('axios')
const now = require('performance-now')
const router = Router()
let norm1 = "e6f6690b-89fd-41db-b8f8-30c1861f67d";
let norm2 = "45ba0762-d282-445a-8901-9f62363eaac5";
let norm3 = "a1e95b9a-9f11-476d-9af8-41677b64c255";
let status = 0 ;
let time = function interClean (){
  router.post('/stop', auth, async (req, res) => {
    console.log('хуй')


  })}
time()
router.post('/Offer', auth, async (req, res) => {
  try {

    UserID = req.user.userId
    console.log(UserID)

    User.findById(UserID, function (err, docs) {
      const OurToken = docs.amztoken

      function intervalFunc() {
        var start = now()
        axios
            .post('https://flex-capacity-na.amazon.com/GetOffersForProviderPost', {
              "apiVersion": "V2",
              "serviceAreaIds": ["fb0a94fe-a1b8-448e-bd95-9f3d91615574"]
            }, {
              headers: {
                "Accept": ":application/json",
                "x-amz-access-token": `${OurToken}`,
                "Accept-Encoding": "[gzip],[deflate],[br]",
                "Connection": "keep-alive",
                "Accept-Language": "en-US",
                "User-Agent": "iOS/13.6.1(iPhone Darwin) Model/iPhone Platform/iPhone12,5 RabbitiOS/2.66.5",
                "Content-Type": "application/json"
              }
            })
            .then((res) => {
              // rate = res.data.offerList[0].rateInfo.projectedTips
              //     offerlist = res.data
             console.log(res.data.offerList)
              for (var Offersnumers = 0; Offersnumers < res.data.offerList.length; Offersnumers++) {
                offerId = res.data.offerList[Offersnumers].offerId;
                Area = res.data.offerList[Offersnumers].serviceAreaId;
                console.log("Количество офферов =  " + res.data.offerList.length);
                console.log("Номер оффера   " + res.data.offerList[Offersnumers].offerId);

                console.log("Эрия номер   " + res.data.offerList[Offersnumers].serviceAreaId);

                if (Area == norm1 || Area == norm2 || Area == norm3) {
                  axios
                      .post('https://flex-capacity-na.amazon.com/AcceptOffer', {
                        "offerId": `${offerId}`
                      }, {
                        headers: {

                          "x-amz-access-token": `${OurToken}`,


                          "User-Agent": "iOS/13.6.1(iPhone Darwin) Model/iPhone Platform/iPhone12,5 RabbitiOS/2.66.5"

                        }

                      })
                  console.log("finally")
                }
              }
            })

        // .catch((error) => {
        //         console.error(error)
        //     }
        // )


        var end = now()
        console.log((start-end).toFixed(6))

      }


      var refreshIntervalId =  setInterval(intervalFunc, 300);


    });
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})



module.exports = router