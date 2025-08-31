const axios = require('axios');
const config = require('../config').default;

class GoogleMapsService {
  constructor() {
    this.apiKey = config.google.mapsApiKey;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
    
    // Emergency service types for India
    this.emergencyTypes = {
      hospital: 'hospital',
      pharmacy: 'pharmacy',
      ambulance: 'car_repair', // Using car_repair as proxy for ambulance services
      police: 'police',
      fire: 'fire_station'
    };
    
    // Major hospital chains in India
    this.majorHospitals = [
      'Apollo Hospitals',
      'Fortis Healthcare',
      'Max Healthcare',
      'Manipal Hospitals',
      'Narayana Health',
      'Kokilaben Dhirubhai Ambani Hospital',
      'Tata Memorial Hospital',
      'All India Institute of Medical Sciences',
      'Safdarjung Hospital',
      'Ram Manohar Lohia Hospital'
    ];
  }

  async findNearbyHospitals(latitude, longitude, radius = 10000, type = 'hospital') {
    try {
      const url = `${this.baseUrl}/place/nearbysearch/json`;
      const params = {
        location: `${latitude},${longitude}`,
        radius: radius,
        type: type,
        key: this.apiKey,
        keyword: 'hospital emergency medical'
      };

      const response = await axios.get(url, { params });
      
      if (response.data.status === 'OK') {
        const hospitals = response.data.results.map(place => this.formatHospitalData(place));
        
        // Sort by rating and distance
        hospitals.sort((a, b) => {
          if (a.rating !== b.rating) {
            return b.rating - a.rating;
          }
          return a.distance - b.distance;
        });

        return {
          success: true,
          hospitals: hospitals.slice(0, 10), // Return top 10
          totalFound: response.data.results.length
        };
      } else {
        throw new Error(`Google Maps API Error: ${response.data.status}`);
      }

    } catch (error) {
      console.error('Google Maps Service Error:', error);
      return {
        success: false,
        error: error.message,
        hospitals: this.getFallbackHospitals(latitude, longitude)
      };
    }
  }

  async findEmergencyServices(latitude, longitude, radius = 15000) {
    try {
      const services = {};
      
      // Find hospitals
      const hospitals = await this.findNearbyHospitals(latitude, longitude, radius, 'hospital');
      services.hospitals = hospitals.success ? hospitals.hospitals : [];
      
      // Find pharmacies
      const pharmacies = await this.findNearbyHospitals(latitude, longitude, radius, 'pharmacy');
      services.pharmacies = pharmacies.success ? pharmacies.hospitals : [];
      
      // Find police stations
      const police = await this.findNearbyHospitals(latitude, longitude, radius, 'police');
      services.police = police.success ? police.hospitals : [];
      
      // Find fire stations
      const fire = await this.findNearbyHospitals(latitude, longitude, radius, 'fire_station');
      services.fire = fire.success ? fire.hospitals : [];

      return {
        success: true,
        services,
        emergencyContacts: this.getEmergencyContacts()
      };

    } catch (error) {
      console.error('Emergency Services Error:', error);
      return {
        success: false,
        error: error.message,
        services: this.getFallbackEmergencyServices(latitude, longitude)
      };
    }
  }

  async getHospitalDetails(placeId) {
    try {
      const url = `${this.baseUrl}/place/details/json`;
      const params = {
        place_id: placeId,
        fields: 'name,formatted_address,formatted_phone_number,website,opening_hours,rating,reviews,photos,geometry',
        key: this.apiKey
      };

      const response = await axios.get(url, { params });
      
      if (response.data.status === 'OK') {
        return {
          success: true,
          details: this.formatDetailedHospitalData(response.data.result)
        };
      } else {
        throw new Error(`Google Maps API Error: ${response.data.status}`);
      }

    } catch (error) {
      console.error('Hospital Details Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getDirections(origin, destination, mode = 'driving') {
    try {
      const url = `${this.baseUrl}/directions/json`;
      const params = {
        origin: origin,
        destination: destination,
        mode: mode,
        key: this.apiKey
      };

      const response = await axios.get(url, { params });
      
      if (response.data.status === 'OK') {
        const route = response.data.routes[0];
        const leg = route.legs[0];
        
        return {
          success: true,
          distance: leg.distance.text,
          duration: leg.duration.text,
          steps: leg.steps.map(step => ({
            instruction: step.html_instructions,
            distance: step.distance.text,
            duration: step.duration.text
          })),
          polyline: route.overview_polyline.points
        };
      } else {
        throw new Error(`Directions API Error: ${response.data.status}`);
      }

    } catch (error) {
      console.error('Directions Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async geocodeAddress(address) {
    try {
      const url = `${this.baseUrl}/geocode/json`;
      const params = {
        address: address,
        key: this.apiKey
      };

      const response = await axios.get(url, { params });
      
      if (response.data.status === 'OK') {
        const result = response.data.results[0];
        const location = result.geometry.location;
        
        return {
          success: true,
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: result.formatted_address,
          components: result.address_components
        };
      } else {
        throw new Error(`Geocoding API Error: ${response.data.status}`);
      }

    } catch (error) {
      console.error('Geocoding Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  formatHospitalData(place) {
    const distance = place.distance || 0;
    
    return {
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      location: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng
      },
      rating: place.rating || 0,
      totalRatings: place.user_ratings_total || 0,
      distance: distance,
      distanceText: this.formatDistance(distance),
      types: place.types,
      openNow: place.opening_hours ? place.opening_hours.open_now : null,
      photos: place.photos ? place.photos.slice(0, 3) : [],
      phone: place.formatted_phone_number || null,
      website: place.website || null,
      isMajorChain: this.majorHospitals.some(hospital => 
        place.name.toLowerCase().includes(hospital.toLowerCase())
      ),
      emergencyServices: this.hasEmergencyServices(place.types),
      specialties: this.extractSpecialties(place.types)
    };
  }

  formatDetailedHospitalData(place) {
    return {
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      website: place.website,
      rating: place.rating || 0,
      totalRatings: place.user_ratings_total || 0,
      openingHours: place.opening_hours ? place.opening_hours.weekday_text : [],
      reviews: place.reviews ? place.reviews.slice(0, 5) : [],
      photos: place.photos || [],
      location: place.geometry.location,
      isMajorChain: this.majorHospitals.some(hospital => 
        place.name.toLowerCase().includes(hospital.toLowerCase())
      )
    };
  }

  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }

  hasEmergencyServices(types) {
    const emergencyKeywords = ['hospital', 'emergency', 'urgent', 'trauma'];
    return types.some(type => 
      emergencyKeywords.some(keyword => type.includes(keyword))
    );
  }

  extractSpecialties(types) {
    const specialties = [];
    
    if (types.includes('hospital')) {
      specialties.push('General Hospital');
    }
    if (types.includes('health')) {
      specialties.push('Healthcare');
    }
    if (types.includes('medical')) {
      specialties.push('Medical Center');
    }
    
    return specialties;
  }

  getEmergencyContacts() {
    return {
      ambulance: '102',
      police: '100',
      fire: '101',
      emergency: '108',
      womenHelpline: '1091',
      childHelpline: '1098',
      seniorCitizenHelpline: '14567',
      mentalHealthHelpline: '1800-599-0019',
      covidHelpline: '1075'
    };
  }

  getFallbackHospitals(latitude, longitude) {
    // Fallback data for major cities in India
    const fallbackHospitals = [
      {
        id: 'fallback_1',
        name: 'Apollo Hospitals',
        address: '154 Bannerghatta Road, Bangalore, Karnataka',
        location: { latitude: 12.9716, longitude: 77.5946 },
        rating: 4.5,
        distance: 2500,
        distanceText: '2.5km',
        phone: '+91-80-2630-4050',
        emergencyServices: true,
        isMajorChain: true
      },
      {
        id: 'fallback_2',
        name: 'Fortis Hospital',
        address: '154 Bannerghatta Road, Bangalore, Karnataka',
        location: { latitude: 12.9716, longitude: 77.5946 },
        rating: 4.3,
        distance: 4100,
        distanceText: '4.1km',
        phone: '+91-80-6621-4444',
        emergencyServices: true,
        isMajorChain: true
      }
    ];

    // Calculate approximate distances
    return fallbackHospitals.map(hospital => ({
      ...hospital,
      distance: this.calculateDistance(latitude, longitude, hospital.location.latitude, hospital.location.longitude),
      distanceText: this.formatDistance(this.calculateDistance(latitude, longitude, hospital.location.latitude, hospital.location.longitude))
    }));
  }

  getFallbackEmergencyServices(latitude, longitude) {
    return {
      hospitals: this.getFallbackHospitals(latitude, longitude),
      pharmacies: [],
      police: [],
      fire: []
    };
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async getHospitalWaitTimes(hospitalId) {
    // Mock implementation - in real app, this would integrate with hospital systems
    return {
      emergency: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
      general: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
      specialty: Math.floor(Math.random() * 180) + 60 // 60-240 minutes
    };
  }

  async getHospitalSpecialties(hospitalId) {
    // Mock implementation - in real app, this would come from hospital database
    const specialties = [
      'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
      'Oncology', 'Emergency Medicine', 'General Surgery',
      'Internal Medicine', 'Gynecology', 'Dermatology'
    ];
    
    return specialties.slice(0, Math.floor(Math.random() * 5) + 3);
  }
}

module.exports = new GoogleMapsService();
