"use clienty";

import { useEffect, useState } from "react";

interface ConnectivityLog {
  timestamp: string;
  intranet: {
    status: string;
  };
  internet: {
    status: string;
    publicIp: string;
  };
  logFormat: string;
}

export default function AdminPanel() {
  const [, setCurrentStatus] = useState<ConnectivityLog | null>(null);
  const [logs, setLogs] = useState<ConnectivityLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const checkConnectivity = async () => {
    try {
      const res = await fetch("/api/connectivity");
      const data: ConnectivityLog = await res.json();
      
      setCurrentStatus(data);
      
      // Add to logs (keep last 50 entries)
      setLogs(prev => {
        const newLogs = [data, ...prev];
        return newLogs.slice(0, 50);
      });
      
    } catch (error) {
      console.error("Failed to check connectivity:", error);
      const errorLog: ConnectivityLog = {
        timestamp: new Date().toLocaleString(),
        intranet: { status: "Error" },
        internet: { status: "Error", publicIp: "NULL" },
        logFormat: `Intranet - Time Stamp: ${new Date().toLocaleString()}, Status: Error | Internet - Status: Error, Public Ip: NULL`
      };
      setCurrentStatus(errorLog);
      setLogs(prev => [errorLog, ...prev.slice(0, 49)]);
    }
  };

  const toggleMonitoring = () => {
    setIsRunning(!isRunning);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      // Initial check
      checkConnectivity();
      // Set interval for every 5 seconds
      interval = setInterval(checkConnectivity, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Connected":
        return "text-green-600 font-semibold";
      case "Not Connected":
        return "text-red-600 font-semibold";
      case "Error":
        return "text-orange-600 font-semibold";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Network Connectivity Monitor - Admin Panel
        </h1>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Monitoring Controls</h2>
            <div className="flex gap-4">
              <button
                onClick={toggleMonitoring}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isRunning
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {isRunning ? "Stop Monitoring" : "Start Monitoring"}
              </button>
              <button
                onClick={clearLogs}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Clear Logs
              </button>
            </div>
          </div>
        </div>

        {/* Current Status */}
        {/* {currentStatus && (
          <div className={`rounded-lg shadow-md p-6 mb-6 border-2 ${getStatusBgColor(currentStatus.intranet.status, currentStatus.internet.status)}`}>
            <h2 className="text-xl font-semibold mb-4">Current Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Intranet Connection</h3>
                <p className={`text-lg ${getStatusColor(currentStatus.intranet.status)}`}>
                  {currentStatus.intranet.status}
                </p>
                <p className="text-sm text-gray-600 mt-1">Target: 172.16.11.168</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Internet Connection</h3>
                <p className={`text-lg ${getStatusColor(currentStatus.internet.status)}`}>
                  {currentStatus.internet.status}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Public IP: <span className="font-mono">{currentStatus.internet.publicIp}</span>
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">Last Updated: {currentStatus.timestamp}</p>
              {currentStatus.internet.status === "Connected" && currentStatus.intranet.status === "Connected" && (
                <div className="mt-2 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <p className="text-yellow-800 font-medium">⚠️ Warning: User has both intranet and internet access</p>
                </div>
              )}
              {currentStatus.internet.status === "Connected" && currentStatus.intranet.status === "Not Connected" && (
                <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-800 font-medium">🚨 Alert: User is using external internet (mobile hotspot/external network)</p>
                </div>
              )}
            </div>
          </div>
        )} */}

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Connection Logs ({logs.length})</h2>
          </div>
          <div className="overflow-x-auto">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No logs yet. Start monitoring to see connection history.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Intranet Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Internet Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Public IP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log, index) => (
                    <tr key={index} className={index === 0 ? "bg-blue-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.timestamp}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatusColor(log.intranet.status)}`}>
                        {log.intranet.status}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatusColor(log.internet.status)}`}>
                        {log.internet.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {log.internet.publicIp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Status Legend */}
        {/* <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Status Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
              <span>Intranet Only (Ideal)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
              <span>Both Connected (Warning)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
              <span>External Internet (Alert)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
              <span>No Connection</span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}