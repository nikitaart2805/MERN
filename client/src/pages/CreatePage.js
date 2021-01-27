import React, {useContext, useEffect, useState} from 'react'
import {useHttp} from '../hooks/http.hook'
import {AuthContext} from '../context/AuthContext'
import {useHistory} from 'react-router-dom'

export const CreatePage = () => {
  const history = useHistory()
  const auth = useContext(AuthContext)
  const {request} = useHttp()
  const [amztoken, SetAmztoken] = useState('')

  useEffect(() => {
    window.M.updateTextFields()
  }, [])

  const pressHandler = async event => {


    try {
      const data = await request('/api/flex/Offer', 'POST', {from: amztoken}, {

        Authorization: `Bearer ${auth.token}`

      })


    } catch (e) {}

  };
  const pressStop = async event => {


    try {
      const data = await request('/api/flex/stop', 'POST', {from: amztoken}, {

        Authorization: `Bearer ${auth.token}`

      })


    } catch (e) {}

  };

  return (
      <div className="row">
        <div className="col s8 offset-s2" style={{paddingTop: '2rem'}}>
          <div className="input-field">
            <button
                className="btn red darken-4"
                style={{marginRight: 10}}
                id="link"
                type="text"


                onClick={pressHandler}> Get Offer</button>
            <button
                className="btn red darken-4"
                style={{marginRight: 10}}
                id="link"
                type="text"


                onClick={pressStop}> Stop</button>

          </div>
        </div>
      </div>
  )
}
