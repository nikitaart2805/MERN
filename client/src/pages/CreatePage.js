
import React, {useCallback, useContext, useEffect, useState} from 'react'
import {useHttp} from '../hooks/http.hook'
import {AuthContext} from '../context/AuthContext'
import {Loader} from '../components/Loader'
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:5000";

export const CreatePage = () => {
  const [areas, setareas] = useState([])
    const [response, setResponse] = useState("");
  const {loading, request} = useHttp()
  const {token} = useContext(AuthContext)

  const pressHandler = async event => {


    try {
 await request('/api/flex/Offer', 'POST', {}, {

        Authorization: `Bearer ${token}`

      })


    } catch (e) {}

  };
  const pressStop = async event => {


    try {
       await request('/api/flex/stop', 'POST', {}, {

        Authorization: `Bearer ${token}`

      })


    } catch (e) {}

  };





  const fetchLinks = useCallback(async () => {
    try {
      const fetched = await request('/api/flex/areas', 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setareas(fetched.AreaNames)
    } catch (e) {}
  }, [token, request])

    const fetchStatus = useCallback(async () => {
        try {
            const SerchingStatus = await request('/api/flex/Offer', 'GET', null, {
                Authorization: `Bearer ${token}`
            })

        } catch (e) {}
    }, [token, request])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])
    useEffect(() => {
        const socket = socketIOClient(ENDPOINT);
        socket.on("FromAPI", data => {
            setResponse(data);
        });
    }, []);
  if (loading) {
    return <Loader/>
  }













  return (
      <>
          {areas.map((item ) => {
              return(
                  <ul className="collection">
                      <li className="collection-item" >{item} </li>

                  </ul>


              )
          }) }
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
          <p>
              <time dateTime={response}>{response}</time>
          </p>
  </>

  )
}
