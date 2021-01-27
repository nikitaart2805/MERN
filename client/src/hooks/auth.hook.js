import {useState, useCallback, useEffect} from 'react'

const storageName = 'userData'

export const useAuth = () => {
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)
  const [userId, setUserId] = useState(null)
  const [AmzToken, setAmzToken] = useState(null)
  const login = useCallback((AmzTok,jwtToken, id) => {
    setToken(jwtToken)
    setUserId(id)
    setAmzToken(AmzTok)
    console.log(AmzToken)
    localStorage.setItem(storageName, JSON.stringify({
      AmzToken: AmzTok,   userId: id, token: jwtToken
    }))
  }, [])


  const logout = useCallback(() => {
    setToken(null)
    setUserId(null)
    setAmzToken(null)
    localStorage.removeItem(storageName)
  }, [])

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(storageName))

    if (data && data.token) {
      login(data.token, data.userId , data.AmzToken )
    }
    setReady(true)
  }, [login])


  return { login, logout, token, userId, ready ,AmzToken }
}