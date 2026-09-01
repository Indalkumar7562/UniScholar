import React, { useState, useEffect } from 'react';
import { schemeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SchemeComparisonPage = () => {
  const { user } = useAuth();
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('eligible');
  const [expandedScheme, setExpandedScheme] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchComparison();
  }, [user]);

  const fetchComparison = async () => {
    try {
      setLoading(true);
      const response = await schemeAPI.compareAndRank();
      setComparisonData(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load scheme comparison');
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-700 font-medium">Analyzing schemes for your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">⚠️ Error Loading Comparison</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchComparison}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!comparisonData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 font-medium">No data available</p>
        </div>
      </div>
    );
  }

  const { profile, summary, ranked } = comparisonData;
  const allSchemes = [
    ...ranked.directlyEligible,
    ...ranked.partiallyMatched,
    ...ranked.lowMatched,
  ];

  const SchemeCard = ({ scheme, tier }) => {
    const isExpanded = expandedScheme === scheme._id;
    const tiers = {
      'Directly Eligible': 'bg-green-50 border-green-300',
      'Partially Matched': 'bg-yellow-50 border-yellow-300',
      'Low Match - Future Target': 'bg-gray-50 border-gray-300',
    };
    const tierColors = {
      'Directly Eligible': 'bg-green-100 text-green-800',
      'Partially Matched': 'bg-yellow-100 text-yellow-800',
      'Low Match - Future Target': 'bg-gray-100 text-gray-800',
    };
    const matchScoreColor = 
      scheme.matchScore >= 80 ? 'text-green-600' :
      scheme.matchScore >= 50 ? 'text-yellow-600' :
      'text-red-600';

    return (
      <div key={scheme._id} className={`border-l-4 p-4 mb-3 rounded cursor-pointer transition hover:shadow-md ${tiers[tier]}`}>
        <div onClick={() => setExpandedScheme(isExpanded ? null : scheme._id)} className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-gray-800 flex-1">{scheme.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tierColors[tier]}`}>
                {tier}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{scheme.description}</p>
            <div className="flex flex-wrap gap-4 text-xs font-mono mb-1">
              <span className="text-indigo-600 font-bold">{scheme.amount}</span>
              <span className="text-gray-500">{scheme.ministry}</span>
              <span className="text-emerald-600 font-bold">
                Last Date: {scheme.applicationDeadline ? new Date(scheme.applicationDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '30 Sep 2026'}
              </span>
            </div>
          </div>
          <div className={`text-right ml-4 ${matchScoreColor}`}>
            <div className="text-2xl font-bold">{scheme.matchScore}%</div>
            <div className="text-xs text-gray-600 font-semibold">Profile Match</div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-300 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">✅ Matched Criteria ({scheme.matchedCriteria?.length || 0})</h4>
                <ul className="space-y-1">
                  {scheme.matchedCriteria?.slice(0, 3).map((c, i) => (
                    <li key={i} className="text-gray-700">• {c}</li>
                  ))}
                  {scheme.matchedCriteria?.length > 3 && (
                    <li className="text-gray-500 italic">+ {scheme.matchedCriteria.length - 3} more</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-2">❌ Missing Criteria ({scheme.missingCriteria?.length || 0})</h4>
                <ul className="space-y-1">
                  {scheme.missingCriteria?.slice(0, 3).map((c, i) => (
                    <li key={i} className="text-gray-700">• {c}</li>
                  ))}
                  {scheme.missingCriteria?.length > 3 && (
                    <li className="text-gray-500 italic">+ {scheme.missingCriteria.length - 3} more</li>
                  )}
                </ul>
              </div>
            </div>

            {scheme.missingDocuments?.length > 0 && (
              <div className="mt-3">
                <h4 className="font-semibold text-orange-700 mb-2">📄 Missing Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {scheme.missingDocuments.map((doc, i) => (
                    <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {scheme.suggestions?.length > 0 && (
              <div className="mt-3">
                <h4 className="font-semibold text-blue-700 mb-2">💡 Suggestions</h4>
                <ul className="space-y-1">
                  {scheme.suggestions.slice(0, 2).map((s, i) => (
                    <li key={i} className="text-gray-700 text-xs">• {s}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <a
                href={scheme.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded text-center text-sm hover:bg-indigo-700 transition"
              >
                Apply Now
              </a>
              <button
                className="px-3 py-2 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition"
                onClick={() => setExpandedScheme(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎓 Your Personalized Scheme Comparison</h1>
          <p className="text-gray-600">Based on your profile, here are all {summary.totalSchemes} available scholarships ranked by compatibility</p>

          {/* Profile Summary */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-gray-600">Age</div>
              <div className="font-bold text-lg text-blue-700">{profile.age} years</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="text-gray-600">Category</div>
              <div className="font-bold text-blue-700">{profile.category}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-gray-600">Education</div>
              <div className="font-bold text-blue-700">{profile.educationLevel}</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <div className="text-gray-600">Income</div>
              <div className="font-bold text-blue-700">₹{(profile.annualFamilyIncome / 100000).toFixed(1)}L</div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500 text-white rounded-lg p-4 shadow-lg">
            <div className="text-3xl font-bold">{summary.directlyEligible}</div>
            <div className="text-sm opacity-90">Directly Eligible</div>
          </div>
          <div className="bg-yellow-500 text-white rounded-lg p-4 shadow-lg">
            <div className="text-3xl font-bold">{summary.partiallyMatched}</div>
            <div className="text-sm opacity-90">Partially Matched</div>
          </div>
          <div className="bg-gray-500 text-white rounded-lg p-4 shadow-lg">
            <div className="text-3xl font-bold">{summary.lowMatched}</div>
            <div className="text-sm opacity-90">Future Targets</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg shadow-lg">
          <div className="flex border-b">
            {[
              { key: 'eligible', label: `✅ Directly Eligible (${summary.directlyEligible})`, color: 'border-green-500' },
              { key: 'partial', label: `⚠️ Partially Matched (${summary.partiallyMatched})`, color: 'border-yellow-500' },
              { key: 'low', label: `📌 Future Targets (${summary.lowMatched})`, color: 'border-gray-500' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === tab.key
                    ? `${tab.color} text-gray-800 bg-gray-50`
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'eligible' && (
              <div>
                {ranked.directlyEligible.length > 0 ? (
                  ranked.directlyEligible.map(s => <SchemeCard key={s._id} scheme={s} tier="Directly Eligible" />)
                ) : (
                  <p className="text-gray-600 text-center py-8">No directly eligible schemes found. Work on improving your profile!</p>
                )}
              </div>
            )}
            {activeTab === 'partial' && (
              <div>
                {ranked.partiallyMatched.length > 0 ? (
                  ranked.partiallyMatched.map(s => <SchemeCard key={s._id} scheme={s} tier="Partially Matched" />)
                ) : (
                  <p className="text-gray-600 text-center py-8">No partially matched schemes found.</p>
                )}
              </div>
            )}
            {activeTab === 'low' && (
              <div>
                {ranked.lowMatched.length > 0 ? (
                  ranked.lowMatched.map(s => <SchemeCard key={s._id} scheme={s} tier="Low Match - Future Target" />)
                ) : (
                  <p className="text-gray-600 text-center py-8">No schemes found in this category.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-6 bg-white rounded-lg shadow p-4 text-center">
          <p className="text-gray-600 mb-3">Want to improve your eligibility?</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="/profile" className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
              Update Profile
            </a>
            <a href="/schemes" className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition">
              Browse All Schemes
            </a>
            <button
              onClick={fetchComparison}
              className="px-6 py-2 bg-blue-400 text-white rounded hover:bg-blue-500 transition"
            >
              Refresh Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeComparisonPage;
