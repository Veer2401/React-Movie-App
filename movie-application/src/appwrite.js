import { Client, Databases,ID,Query } from "appwrite";
import { enforceHttpsInProduction } from './utils/env.js';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

// Get endpoint from environment variable, enforce HTTPS in production
const getAppwriteEndpoint = () => {
  const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
  
  // Use utility function to enforce HTTPS in production
  return enforceHttpsInProduction(endpoint, 'https://cloud.appwrite.io/v1');
};

const client = new Client()
    .setEndpoint(getAppwriteEndpoint())
    .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, {
            queries: [
                Query.equal('searchTerm', searchTerm),
                //Query.equal('movieId', movie.id)
            ]
        })
        if(result.documents.length > 0){
            const doc = result.documents[0];

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, data, {
                count: doc.searchCount + 1,
            })
        } else{
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            })
        }
    } catch(error) {
        console.error('Error updating search count:', error);
    }
    
}