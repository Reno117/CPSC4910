"use client";

import { useState } from "react";
import { searchEbay } from "@/app/actions/sponsor/catalog/search-ebay";
import EbayProductCard from "./ebay-product-card";

interface EbaySearchFormProps {
  isAdmin: boolean;
  sponsorId?: string | null;
  sponsors?: Array<{ id: string; name: string }>;
}

export default function EbaySearchForm({ isAdmin, sponsorId, sponsors }: EbaySearchFormProps) {
  const [query, setQuery] = useState("");
  const [selectedSponsorId, setSelectedSponsorId] = useState(sponsorId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError("");
    setResults([]);

    if (!query.trim()) {
      setError("Please enter a search term");
      return;
    }

    if (isAdmin && !selectedSponsorId) {
      setError("Please select a sponsor");
      return;
    }

    setLoading(true);

    try {
      const response = await searchEbay(query);
      
      if (response.success) {
        setResults(response.products);
        
        if (response.products.length === 0) {
          setError("No products found. Try searching for 'book', 'camera', or 'watch' (sandbox has limited inventory)");
        }
      } else {
        setError(response.error || "Search failed");
      }
    } catch (err: any) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdded = (itemId: string) => {
    // Remove product from results after adding
    setResults(prev => prev.filter(p => p.itemId !== itemId));
  };

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        {/* Admin: Sponsor Selector */}
        {isAdmin && sponsors && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Select Sponsor
            </label>
            <select
              value={selectedSponsorId}
              onChange={(e) => setSelectedSponsorId(e.target.value)}
              required
              className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose Sponsor --</option>
              {sponsors.map((sponsor) => (
                <option key={sponsor.id} value={sponsor.id}>
                  {sponsor.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Search eBay Products
          </label>
          <div className="flex gap-2 max-w-2xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try: book, camera, watch"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-2">Searching eBay...</p>
        </div>
      )}

      {/* Search Results */}
      {!loading && results.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Found {results.length} products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((product) => (
              <EbayProductCard
                key={product.itemId}
                product={product}
                sponsorId={selectedSponsorId}
                onAdded={handleProductAdded}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && results.length === 0 && query && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No results found</p>
          <p className="text-sm mt-2">Try different search terms like 'book', 'camera', or 'watch'</p>
        </div>
      )}
    </div>
  );
}