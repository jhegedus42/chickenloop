'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Convert lat/lng to x/y coordinates on a world map (simple Mercator projection)
const latLngToXY = (lat: number, lng: number, mapWidth: number, mapHeight: number) => {
  // Normalize longitude to 0-360 range
  const normalizedLng = ((lng + 180) % 360 + 360) % 360;
  
  // Convert to x coordinate (0 to mapWidth)
  const x = (normalizedLng / 360) * mapWidth;
  
  // Convert latitude to y coordinate (Mercator projection)
  const latRad = (lat * Math.PI) / 180;
  const mercatorY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const normalizedLat = (mercatorY / Math.PI + 1) / 2;
  const y = (1 - normalizedLat) * mapHeight; // Invert y-axis
  
  return { x, y };
};

export default function MapPreview() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapDimensions, setMapDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        const data = await response.json();
        setCompanies(data.companies || []);
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();

    // Update map dimensions on resize
    const updateDimensions = () => {
      const container = document.getElementById('map-preview-container');
      if (container) {
        setMapDimensions({
          width: container.offsetWidth,
          height: Math.max(400, container.offsetWidth * 0.5), // Maintain aspect ratio
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Filter companies with valid coordinates
  const companiesWithCoords = companies.filter(
    (company) =>
      company.coordinates &&
      company.coordinates.latitude !== undefined &&
      company.coordinates.longitude !== undefined &&
      !isNaN(company.coordinates.latitude) &&
      !isNaN(company.coordinates.longitude)
  );

  return (
    <section className="bg-gray-50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Explore Companies on Map</h2>
          <Link
            href="/map"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap"
          >
            Explore on map
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Loading map...</p>
          </div>
        ) : (
          <div
            id="map-preview-container"
            className="relative w-full bg-gradient-to-br from-blue-100 via-cyan-50 to-teal-100 rounded-xl overflow-hidden shadow-lg border border-gray-200"
            style={{ minHeight: '400px', aspectRatio: '2/1' }}
          >
            {/* Static World Map Background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2U2ZjJmYSIvPjxwYXRoIGQ9Ik0wIDIwMCBRMTAwIDE1MCAyMDAgMjAwIFQ0MDAgMjAwIFQ2MDAgMjAwIFQ4MDAgMjAwIiBzdHJva2U9IiM5Y2FmYWYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] bg-cover bg-center opacity-30"></div>
            
            {/* Simple world map pattern */}
            <svg
              className="absolute inset-0 w-full h-full opacity-20"
              viewBox="0 0 800 400"
              preserveAspectRatio="none"
            >
              {/* Continents outline (simplified) */}
              <path
                d="M 100 150 Q 150 120 200 150 T 300 150 T 400 150 T 500 150 T 600 150 T 700 150"
                stroke="#4a90e2"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 150 200 Q 200 180 250 200 T 350 200 T 450 200"
                stroke="#4a90e2"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 200 250 Q 250 230 300 250 T 400 250 T 500 250"
                stroke="#4a90e2"
                strokeWidth="2"
                fill="none"
              />
            </svg>

            {/* Company location pins */}
            {companiesWithCoords.map((company) => {
              const { x, y } = latLngToXY(
                company.coordinates!.latitude,
                company.coordinates!.longitude,
                mapDimensions.width,
                mapDimensions.height
              );

              return (
                <div
                  key={company.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{
                    left: `${(x / mapDimensions.width) * 100}%`,
                    top: `${(y / mapDimensions.height) * 100}%`,
                  }}
                  title={company.name}
                >
                  {/* Pin dot */}
                  <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  {/* Pin shadow */}
                  <div className="absolute top-1 left-1 w-3 h-3 bg-red-700 rounded-full opacity-50 -z-10"></div>
                </div>
              );
            })}

            {/* Overlay gradient for better visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none"></div>

            {/* Info text */}
            {companiesWithCoords.length > 0 && (
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{companiesWithCoords.length}</span> companies on map
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

