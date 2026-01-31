export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: 'File too large. Maximum size is 50MB' 
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ 
      error: 'Too many files. Maximum is 10 files per upload' 
    });
  }

  if (err.code === 'LIMIT_PART_COUNT') {
    return res.status(400).json({ 
      error: 'Too many parts in the request' 
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
}

export function validateSessionId(req, res, next) {
  const { sessionId } = req.params;
  
  if (!sessionId || !/^[A-Z0-9]{6}$/.test(sessionId)) {
    return res.status(400).json({
      error: 'Invalid session ID format'
    });
  }

  next();
}
