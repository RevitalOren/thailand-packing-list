// Health check API for Vercel deployment
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ 
      success: true, 
      message: 'Thailand Packing List API is running on Vercel', 
      timestamp: new Date().toISOString() 
    });
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}