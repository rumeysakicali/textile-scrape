const { Client } = require('@googlemaps/google-maps-services-js');
const { delay } = require('../utils/helpers');

class GoogleMapsService {
  constructor() {
    this.client = new Client({});
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is not set in environment variables');
    }
  }

  /**
   * Search for textile companies using Google Places API
   * @returns {Promise<Array>} Array of company information
   */
  async searchTextileCompanies() {
    try {
      const location = process.env.SEARCH_LOCATION || 'Istanbul, Turkey';
      const keyword = process.env.SEARCH_KEYWORD || 'textile fabric company';
      const radiusEnv = process.env.SEARCH_RADIUS || '50000';
      const radius = Number(radiusEnv);
      
      if (isNaN(radius) || radius <= 0) {
        throw new Error(`Invalid SEARCH_RADIUS: ${radiusEnv}. Must be a positive number.`);
      }

      console.log(`Searching for: ${keyword}`);
      console.log(`Location: ${location}`);
      console.log(`Radius: ${radius} meters`);

      // First, get coordinates for the location
      const geocodeResponse = await this.client.geocode({
        params: {
          address: location,
          key: this.apiKey,
        },
      });

      if (!geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
        throw new Error(`Could not geocode location: ${location}`);
      }

      const locationCoords = geocodeResponse.data.results[0].geometry.location;
      console.log(`Coordinates: ${locationCoords.lat}, ${locationCoords.lng}\n`);

      // Search for places
      const searchResponse = await this.client.placesNearby({
        params: {
          location: locationCoords,
          radius: radius,
          keyword: keyword,
          key: this.apiKey,
        },
      });

      const places = searchResponse.data.results || [];
      
      // Get detailed information for each place
      const companies = [];
      for (const place of places) {
        try {
          const details = await this.getPlaceDetails(place.place_id);
          companies.push({
            name: place.name,
            place_id: place.place_id,
            address: place.vicinity,
            location: place.geometry.location,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            business_status: place.business_status,
            types: place.types,
            ...details,
          });
          
          // Delay to avoid rate limiting (200ms between requests)
          await delay(200);
        } catch (error) {
          console.error(`Error getting details for ${place.name}:`, error.message);
        }
      }

      return companies;
    } catch (error) {
      console.error('Error searching textile companies:', error.message);
      throw error;
    }
  }

  /**
   * Get detailed information about a place
   * @param {string} placeId - Google Place ID
   * @returns {Promise<Object>} Place details
   */
  async getPlaceDetails(placeId) {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'name',
            'formatted_address',
            'formatted_phone_number',
            'international_phone_number',
            'website',
            'opening_hours',
            'business_status',
            'rating',
            'user_ratings_total',
          ],
          key: this.apiKey,
        },
      });

      const result = response.data.result || {};
      
      return {
        formatted_address: result.formatted_address,
        phone: result.formatted_phone_number || result.international_phone_number,
        website: result.website,
        opening_hours: result.opening_hours,
      };
    } catch (error) {
      console.error(`Error getting place details for ${placeId}:`, error.message);
      return {};
    }
  }
}

module.exports = new GoogleMapsService();
