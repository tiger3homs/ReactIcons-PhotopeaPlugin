import { Handler } from '@netlify/functions';
import * as Fa6 from 'react-icons/fa6';
import * as Md from 'react-icons/md';
import * as Ai from 'react-icons/ai';
import * as Bi from 'react-icons/bi';
import * as Hi from 'react-icons/hi';
import * as Lu from 'react-icons/lu';

const libraries: Record<string, any> = {
  fa6: Fa6,
  md: Md,
  ai: Ai,
  bi: Bi,
  hi: Hi,
  lu: Lu,
};

export const handler: Handler = async (event) => {
  const query = event.queryStringParameters?.q?.toLowerCase() || '';
  const libraryId = event.queryStringParameters?.lib || 'all';
  
  const results: any[] = [];
  
  const searchInLib = (libId: string, lib: any) => {
    Object.keys(lib).forEach(name => {
      if (name.toLowerCase().includes(query)) {
        results.push({
          id: `${libId}-${name}`,
          name,
          library: libId,
        });
      }
    });
  };

  if (libraryId === 'all') {
    Object.entries(libraries).forEach(([id, lib]) => searchInLib(id, lib));
  } else if (libraries[libraryId]) {
    searchInLib(libraryId, libraries[libraryId]);
  }

  // Limit results for performance
  const limitedResults = results.slice(0, 100);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      results: limitedResults,
      total: results.length,
    }),
  };
};
