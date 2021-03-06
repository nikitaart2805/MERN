const {Router} = require('express')
const config = require('config')
const User = require('../models/User')
const auth = require('../middleware/auth.middleware')
const axios = require('axios')
const now = require('performance-now')
var io = require('../app');
const router = Router()

let status = true
let OfferStatus ="Not searching"
let interval ;


// io.on("connection", (socket) => {
//     console.log("New client connected");
//     if (interval) {
//         clearInterval(interval);
//     }

//     interval = setInterval(() => getApiAndEmit(socket), 1000);
//     socket.on("disconnect", () => {
//         console.log("Client disconnected");
//         clearInterval(interval);
//     });
// });
//
// const getApiAndEmit = socket => {
//     const response = new Date();
//     // Emitting a new message. Will be consumed by the client
//     socket.emit("FromAPI", response);
// };



router.post('/IDtransfer', auth, async (req,res) => {
  let UserID = req.user.userId

 User.findById(UserID, async function (err, docs) {

        const email = docs.email

     let SelectedArea =req.body.SelectedAreas
     let SelectedAreaName =req.body.SelectedAreaName

     await  User.update({"email": email}, {
         $set: {
             "SelectedArea": SelectedArea,
             "SelectedAreaName": SelectedAreaName
         }
     })
     res.status(200).json({message: 'Cool'})

    })


})


router.post('/Offer', auth, async (req,res) => {
  try {

    UserID = req.user.userId
    // console.log(UserID)

    User.findById(UserID, function (err, docs) {
        const OurToken = docs.amztoken
        const area   = docs.area
        const AreaFoeSearching = docs.SelectedArea

        let Offer_status = "Searching ........."
        let missed_block = ''

        // console.log(status)

      function intervalFunc() {

          OfferStatus = "Searching started"
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

                      if (Area == AreaFoeSearching[0] || Area == AreaFoeSearching[1] || Area == AreaFoeSearching[2]) {
                          axios
                              .post('https://flex-capacity-na.amazon.com/AcceptOffer', {
                                  "offerId": `${offerId}`
                              }, {
                                  headers: {

                                      "x-amz-access-token": `${OurToken}`,


                                      "User-Agent": "iOS/13.6.1(iPhone Darwin) Model/iPhone Platform/iPhone12,5 RabbitiOS/2.66.5"

                                  }

                              }).catch(error=>{
                              Offer_status = "Missed Block"
                              console.log(Offer_status)

                          });


                          Offer_status = "Accepted"
                          console.log(Offer_status)
                      }
                  }
              })

              .catch(error=>{
                 status = error.response.status
                 if (status === 400){
                     OfferStatus = "Too hot"

                     clearInterval(refreshIntervalId);
                 }

              })
          // console.log(status)
          if (status == false) {
              OfferStatus ="Not searching"
                status = true
              clearInterval(refreshIntervalId);
          }

          var end = now()
          console.log((start - end).toFixed(6))


      }

        var refreshIntervalId =  setInterval(intervalFunc, 300);
        router.post('/stop', async (req,res) => {

            try {

                status = false
                res.json ({ status })
            } catch (e) {
                res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
            }
        })




        res.json ({ Offer_status , missed_block})
    });

  }

  catch (e) {
        console.log('LOLOdf')
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }

})




io.on("connection", (socket) => {
    console.log("New client connected");
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 1000);
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        clearInterval(interval);
    });
});

const getApiAndEmit = socket => {


    // Emitting a new message. Will be consumed by the client
    socket.
    emit("FromAPI", OfferStatus);
};







router.get('/areas', auth, async (req,res) => {
    UserID = req.user.userId


User.findById(UserID, function (err, docs) {
        const OurToken = docs.amztoken
    const lolo = docs.areas


    let AreaNames =docs.SelectedAreaName
    // for (var Offersnumers = 0; Offersnumers < 30; Offersnumers++) {
    //     const areaid = docs.areas[Offersnumers].serviceAreaId
    //     const areaname = docs.areas[Offersnumers].serviceAreaName
    //     AreaID.push(areaid)
    //     AreaNames.push(areaname)
    //
    //
    // }

     res.json({lolo , AreaNames})
    })


    })


module.exports = router