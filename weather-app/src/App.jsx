import { useState, useEffect } from 'react';
import { getWeather } from './api/weatherService';
// Temporarily comment out forecast until we fix the main issue
// import { getForecast } from './api/weatherService';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  // const [forecast, setForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!city.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setWeather(null);
    // setForecast(null);
    
    try {
      const weatherData = await getWeather(city);
      setWeather(weatherData);
      
      // Temporarily commenting out forecast until we fix the main issue
      // const forecastData = await getForecast(city);
      // setForecast(forecastData);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeather(null);
      setError('City not found or network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get weather icon URL
  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  // Format date from timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">Weather Dashboard ☀️</h1>
        
        {/* Search Section */}
        <div className="flex justify-center mb-8 gap-2">
          <input
            type="text"
            placeholder="new york"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={handleKeyPress}
            className="px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow max-w-md"
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            {isLoading ? 'Loading...' : 'Get Weather'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Current Weather Section */}
        {weather && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <img 
                  src={getWeatherIconUrl(weather.weather[0].icon)} 
                  alt={weather.weather[0].description} 
                  className="w-20 h-20"
                />
                <div>
                  <h2 className="text-2xl font-bold">{weather.name}, {weather.sys.country}</h2>
                  <p className="text-gray-600 capitalize">{weather.weather[0].description}</p>
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <div className="text-6xl font-bold">{Math.round(weather.main.temp)}°C</div>
                <div className="text-gray-500">
                  Feels like: {Math.round(weather.main.feels_like)}°C
                </div>
              </div>
            </div>
            
            {/* Weather Details */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Humidity</div>
                <div className="text-xl font-semibold">{weather.main.humidity}%</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Wind</div>
                <div className="text-xl font-semibold">{Math.round(weather.wind.speed * 3.6)} km/h</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Pressure</div>
                <div className="text-xl font-semibold">{weather.main.pressure} hPa</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">Visibility</div>
                <div className="text-xl font-semibold">{weather.visibility / 1000} km</div>
              </div>
            </div>
          </div>
        )}
        
        {/* 7-Day Forecast Section removed for now */}
      </div>
    </div>
  );
}

export default App;