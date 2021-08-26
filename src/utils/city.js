const HKZF_CITY = 'hkzf_city'

const getCity = () => JSON.parse(localStorage.getItem(HKZF_CITY)) || {}

const setCity = value => localStorage.setItem(HKZF_CITY, JSON.stringify(value))

export {getCity, setCity}
