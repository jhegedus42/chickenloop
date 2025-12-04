import Link from 'next/link';
import { getCountryNameFromCode } from '@/lib/countryUtils';

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    logo?: string;
    address?: {
      city?: string;
      country?: string;
    };
    jobCount?: number;
  };
}

export default function CompanyCard({ company }: CompanyCardProps) {
  // Format location/country
  const locationParts = [];
  if (company.address?.city) {
    locationParts.push(company.address.city);
  }
  if (company.address?.country) {
    const countryName = getCountryNameFromCode(company.address.country);
    locationParts.push(countryName || company.address.country);
  }
  const locationText = locationParts.length > 0 
    ? locationParts.join(', ') 
    : 'Location not specified';

  return (
    <Link
      href={`/companies/${company.id}`}
      className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer block overflow-hidden transform hover:-translate-y-1"
    >
      {/* Company Logo */}
      <div className="w-full h-36 sm:h-40 bg-gray-50 flex items-center justify-center p-6 border-b border-gray-100">
        {company.logo ? (
          <img
            src={company.logo}
            alt={company.name}
            className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="text-gray-400 text-sm text-center">
            <div className="text-3xl mb-2">🏢</div>
            <div>No Logo</div>
          </div>
        )}
      </div>

      {/* Company Info */}
      <div className="p-5 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {company.name}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-3 flex items-center">
          <span className="mr-1.5">📍</span>
          <span className="line-clamp-1">{locationText}</span>
        </p>
        {company.jobCount && company.jobCount > 0 && (
          <p className="text-sm text-blue-600 font-medium">
            {company.jobCount} {company.jobCount === 1 ? 'active job' : 'active jobs'}
          </p>
        )}
      </div>
    </Link>
  );
}

