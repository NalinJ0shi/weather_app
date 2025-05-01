import axios from 'axios';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export const getWeather = async (city) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.message);
    // Propagate the error to be handled by the component
    throw error;
  }
};

export const getForecast = async (city) => {
  try {
    // First get coordinates from city name
    const weatherData = await getWeather(city);
    const { lat, lon } = weatherData.coord;
    
    // Then use coordinates to get One Call API data (includes forecast)
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${API_KEY}&units=metric`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Forecast API Error:", error.message);
    // Propagate the error to be handled by the component
    throw error;
  }
};