import React from 'react';
import { supabaseNew as supabase } from '../lib/supabase-new';

const TestPage = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Hard-coded values (what we're actually using)
  const actualUrl = 'https://cfwwcxqpyxktikizjjxx.supabase.co';
  const actualKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3djeHFweXhrdGlraXpqanh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDUyOTcsImV4cCI6MjA2MjYyMTI5N30.YUD6Uwxyd38xXs7R60UC-199FE52VYkqOZSXHtrBiH0';

  // Get actual Supabase client URL
  const clientUrl = (supabase as any).supabaseUrl;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Environment Variables Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables (from .env)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VITE_SUPABASE_URL:
              </label>
              <div className="bg-gray-50 p-3 rounded border">
                <code className="text-sm">{supabaseUrl || 'NOT SET'}</code>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VITE_SUPABASE_ANON_KEY (first 50 chars):
              </label>
              <div className="bg-gray-50 p-3 rounded border">
                <code className="text-sm">{supabaseKey?.substring(0, 50) || 'NOT SET'}...</code>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-6 border border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Actually Used Values (Hard-coded)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Actual Supabase URL:
              </label>
              <div className="bg-blue-100 p-3 rounded border border-blue-300">
                <code className="text-sm text-blue-900">{actualUrl}</code>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Supabase Client URL (from client object):
              </label>
              <div className="bg-blue-100 p-3 rounded border border-blue-300">
                <code className="text-sm text-blue-900">{clientUrl || 'Not available'}</code>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Actual Key (first 50 chars):
              </label>
              <div className="bg-blue-100 p-3 rounded border border-blue-300">
                <code className="text-sm text-blue-900">{actualKey.substring(0, 50)}...</code>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Expected Values</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected URL:
              </label>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <code className="text-sm text-green-800">https://cfwwcxqpyxktikizjjxx.supabase.co</code>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Key (first 50 chars):
              </label>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <code className="text-sm text-green-800">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...</code>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg">
            <h3 className="font-semibold">
              ✅ Using Hard-coded Configuration
            </h3>
            <p className="mt-2">
              The app is now using hard-coded Supabase configuration to bypass environment variable issues.
              This should resolve the CORS error you were experiencing.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className={`p-4 rounded-lg ${
            supabaseUrl === 'https://cfwwcxqpyxktikizjjxx.supabase.co'
              ? 'bg-blue-100 border border-blue-400 text-blue-700'
              : 'bg-yellow-100 border border-yellow-400 text-yellow-700'
          }`}>
            <h3 className="font-semibold">
              {supabaseUrl === 'https://cfwwcxqpyxktikizjjxx.supabase.co'
                ? '✅ Environment Variables Working'
                : '⚠️ Environment Variables Not Loading'}
            </h3>
            <p className="mt-2">
              {supabaseUrl === 'https://cfwwcxqpyxktikizjjxx.supabase.co'
                ? 'Environment variables are loaded correctly from .env file.'
                : 'Environment variables are not loading properly, but hard-coded values are being used instead.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
