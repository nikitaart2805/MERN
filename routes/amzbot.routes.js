const {Router} = require('express')
const config = require('config')
const User = require('../models/User')
const auth = require('../middleware/auth.middleware')
const axios = require('axios')
const now = require('performance-now')
const router = Router()
let norm1 = "22";
let norm2 = "11be7ee1-1c35-47ed-85b6-376fff6b6966";
let norm3 = "a1e95b9a-9f11-476d-9af8-41677b64c255";
let status = true
async function time () {


}


router.post('/Offer', auth, async (req,res) => {
  try {

    UserID = req.user.userId
    // console.log(UserID)

    User.findById(UserID, function (err, docs) {
        const OurToken = docs.amztoken
        const area   = docs.area
        console.log(area)

        // console.log(status)

      function intervalFunc() {


          var start = now()

          axios
              .post('https://flex-capacity-na.amazon.com/GetOffersForProviderPost', {
                  "apiVersion": "V2",
                  "serviceAreaIds":[`${area}`]
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
                  // console.log(res.data.offerList)
                  for (var Offersnumers = 0; Offersnumers < res.data.offerList.length; Offersnumers++) {
                      offerId = res.data.offerList[Offersnumers].offerId;
                      Area = res.data.offerList[Offersnumers].serviceAreaId;
                      // console.log("Количество офферов =  " + res.data.offerList.length);
                      // console.log("Номер оффера   " + res.data.offerList[Offersnumers].offerId);

                      console.log("Эрия номер   " + res.data.offerList[Offersnumers].serviceAreaId);

                      if (Area == norm1 || Area == norm2 || Area == norm3) {
                          try {
                          axios
                              .post('https://flex-capacity-na.amazon.com/AcceptOffer', {
                                  "offerId": `${offerId}`
                              }, {
                                  headers: {

                                      "x-amz-access-token": `${OurToken}`,


                                      "User-Agent": "iOS/13.6.1(iPhone Darwin) Model/iPhone Platform/iPhone12,5 RabbitiOS/2.66.5"

                                  }

                              })} catch(error){
                              console.log("IA SOSY" + error)
                              return null

                          };
                          console.log("finall")
                      }
                  }
              })

          // .catch((error) => {
          //         console.error(error)
          //     }
          // )
          // console.log(status)
          if (status == false) {
                status = true
              clearInterval(refreshIntervalId);
          }

          var end = now()
          console.log((start - end).toFixed(6))


      }

        var refreshIntervalId =  setInterval(intervalFunc, 300);
        router.post('' +
            '/stop', async () => {
            status = false

        })



    });
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }

})



module.exports = router