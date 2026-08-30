import { useState, useRef } from 'react';
import { api } from '../services/api';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function BulkUpload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setFileError('');
    if (selectedFile) {
      const isCsv = selectedFile.name.toLowerCase().endsWith('.csv') ||
                    selectedFile.type === 'text/csv' ||
                    selectedFile.type === 'application/vnd.ms-excel' ||
                    selectedFile.type === 'text/plain';
      if (isCsv) {
        setFile(selectedFile);
        setResults(null);
        setShowResults(false);
      } else {
        setFileError('Please select a valid .csv spreadsheet file');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResults(null);
    setFileError('');

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const { data } = await api.post('/prices/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResults(data);
      setShowResults(true);

      if (onSuccess) {
        onSuccess();
      }

      // Reset file input
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Bulk upload error:', error);
      setResults({
        success: false,
        message: error.response?.data?.error || 'Upload failed',
        processed: 0,
        errors: [error.message]
      });
      setShowResults(true);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'crop_name,market_name,price\nMaize,Kigali Central,350\nBeans,Muhanga Market,1200\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'price_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <Upload className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Bulk Price Upload</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload CSV File
          </label>
          <input
            id="csvFile"
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv,application/vnd.ms-excel"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {fileError ? (
            <p className="mt-1 text-sm text-red-600 font-medium">{fileError}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              CSV format: crop_name, market_name, price
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={downloadTemplate}
            className="flex w-full items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors sm:w-auto"
          >
            <FileText size={16} />
            <span>Download Template</span>
          </button>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex w-full items-center justify-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:w-auto"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Upload Prices</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showResults && results && (
        <div className="mt-6 p-4 rounded-lg border">
          {results.success ? (
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800">Upload Successful!</h4>
                <p className="text-sm text-green-700 mt-1">
                  {results.message}
                </p>
                {results.processed > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ {results.processed} prices uploaded successfully
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800">Upload Failed</h4>
                <p className="text-sm text-red-700 mt-1">
                  {results.message}
                </p>
                {results.errors && results.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-700">Errors:</p>
                    <ul className="text-sm text-red-600 mt-1 list-disc list-inside">
                      {results.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800">CSV Format Requirements</h4>
            <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
              <li>First row: headers (crop_name, market_name, price)</li>
              <li>Crop and market names must exist in the system</li>
              <li>Price must be a positive number</li>
              <li>Maximum 100 rows per upload</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
