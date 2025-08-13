import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const timestamp = new Date().toLocaleString();
  
  // Check Intranet connectivity
  let intranetStatus = "Not Connected";
  try {
    await axios.get("http://172.16.11.168/", { 
      timeout: 3000,
      headers: {
        'User-Agent': 'Intranet-Checker'
      }
    });
    intranetStatus = "Connected";
  } catch (error) {
    intranetStatus = "Not Connected";
  }

  // Check Internet connectivity and get public IP
  let internetStatus = "Not Connected";
  let publicIp = "NULL";
  
  try {
    // First check if we can reach internet
    const ipResponse = await axios.get("https://api.ipify.org?format=json", { 
      timeout: 5000,
      headers: {
        'User-Agent': 'Internet-Checker'
      }
    });
    
    if (ipResponse.data && ipResponse.data.ip) {
      internetStatus = "Connected";
      publicIp = ipResponse.data.ip;
      
      // Additional check: verify it's not an intranet IP being used
      const ip = ipResponse.data.ip;
      const isPrivateIP = (
        ip.startsWith('192.168.') ||
        ip.startsWith('10.') ||
        (ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31) ||
        ip.startsWith('127.')
      );
      
      // If someone is using mobile hotspot or external internet
      if (!isPrivateIP) {
        // This means they're using internet outside intranet
        internetStatus = "Connected";
      }
    }
  } catch (error) {
    internetStatus = "Not Connected";
    publicIp = "NULL";
  }

  const logEntry = {
    timestamp,
    intranet: {
      status: intranetStatus,
    },
    internet: {
      status: internetStatus,
      publicIp: publicIp
    },
    logFormat: `Intranet - Time Stamp: ${timestamp}, Status: ${intranetStatus} | Internet - Status: ${internetStatus}, Public Ip: ${publicIp}`
  };

  return NextResponse.json(logEntry);
}