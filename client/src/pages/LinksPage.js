
import React, {useCallback, useContext, useEffect, useState} from 'react'
import {useHttp} from '../hooks/http.hook'
import {AuthContext} from '../context/AuthContext'
import {Loader} from '../components/Loader'
import { useHistory } from 'react-router-dom';


export const LinksPage = () => {
  const history = useHistory()
  const [areas, setareas] = useState([])
  const {loading, request} = useHttp()
  const {token} = useContext(AuthContext)





  const fetchLinks = useCallback(async () => {
    try {
      const fetched = await request('/api/flex/areas', 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setareas(fetched.lolo)
    } catch (e) {}
  }, [token, request])



  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  if (loading) {
    return <Loader/>
  }

let SelectedAreas = []
let SelectedAreaName = []


  async function toggleTodo(serviceAreaId,serviceAreaName) {
    SelectedAreas.push(serviceAreaId)
    SelectedAreaName.push(serviceAreaName)
  }

  async function Saver () {
  await request('/api/flex/IDtransfer', 'POST', {SelectedAreas , SelectedAreaName}, {
      Authorization: `Bearer ${token}`
    })
    history.goBack()
  }





  return (
      <>
        <form action="#">
          {areas.map((item , onChange ) => {
            return(
                <p>
                  <label  value={item.serviceAreaId}>
                    <input onChange={ () => toggleTodo(item.serviceAreaId ,item.serviceAreaName)} type="checkbox"/>

                    <span >{item.serviceAreaName}</span>

                  </label>
                </p>

            )
          }) }
        </form>
        <button
            className="btn blue darken-4"
            style={{marginRight: 10}}
            id="link"
            type="text"


            onClick={Saver }> Save Areas</button>

      </>

  )
}
