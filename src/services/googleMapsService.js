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

      // Get additional keywords from environment or use defaults
      const additionalKeywords = process.env.ADDITIONAL_KEYWORDS 
        ? process.env.ADDITIONAL_KEYWORDS.split(',').map(k => k.trim())
        : [];
      
      // Combine main keyword with additional keywords
      const allKeywords = [keyword, ...additionalKeywords];
      
      console.log(`Searching with ${allKeywords.length} keyword(s)...`);
      
      // Collect all places from all keywords
      const allPlacesMap = new Map(); // Use Map to avoid duplicates based on place_id
      
      for (const searchKeyword of allKeywords) {
        console.log(`\n🔍 Searching for: "${searchKeyword}"`);
        const places = await this.searchWithPagination(locationCoords, radius, searchKeyword);
        
        // Add to map to avoid duplicates
        places.forEach(place => {
          if (!allPlacesMap.has(place.place_id)) {
            allPlacesMap.set(place.place_id, place);
          }
        });
        
        console.log(`  ✓ Found ${places.length} results for "${searchKeyword}"`);
      }
      
      const allPlaces = Array.from(allPlacesMap.values());
      console.log(`\n📊 Total unique companies found: ${allPlaces.length}`);
      
      // Get detailed information for each place
      const companies = [];
      for (const place of allPlaces) {
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
   * Search places with pagination support
   * @param {Object} locationCoords - Coordinates {lat, lng}
   * @param {number} radius - Search radius in meters
   * @param {string} keyword - Search keyword
   * @returns {Promise<Array>} Array of places
   */
  async searchWithPagination(locationCoords, radius, keyword) {
    const allPlaces = [];
    let nextPageToken = null;
    let pageCount = 0;
    const maxPages = 3; // Google Places API allows up to 3 pages (60 results total per query)

    do {
      try {
        const params = {
          location: locationCoords,
          radius: radius,
          keyword: keyword,
          key: this.apiKey,
        };

        // Add pagetoken if we have one (for subsequent pages)
        if (nextPageToken) {
          params.pagetoken = nextPageToken;
          // Google requires a short delay before using next_page_token
          await delay(2000);
        }

        const searchResponse = await this.client.placesNearby({ params });
        const places = searchResponse.data.results || [];
        
        allPlaces.push(...places);
        pageCount++;
        
        // Check if there are more results
        nextPageToken = searchResponse.data.next_page_token || null;
        
        if (nextPageToken) {
          console.log(`    Page ${pageCount} complete, fetching next page...`);
        }
        
      } catch (error) {
        console.error(`Error fetching page ${pageCount + 1}:`, error.message);
        break;
      }
    } while (nextPageToken && pageCount < maxPages);

    return allPlaces;
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
