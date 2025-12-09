import { NextRequest, NextResponse } from 'next/server';

// Proxy GCS video content to client
// This avoids CORS issues and keeps GCS credentials server-side

async function getAccessToken(): Promise<string> {
  const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!serviceAccountJson) {
    throw new Error('Google Cloud credentials not configured');
  }

  const credentials = JSON.parse(serviceAccountJson);

  // Generate JWT
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    sub: credentials.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/devstorage.read_only',
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signatureInput = `${headerB64}.${payloadB64}`;

  // Convert PEM to ArrayBuffer
  const b64Key = credentials.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  const binaryKey = atob(b64Key);
  const keyBytes = new Uint8Array(binaryKey.length);
  for (let i = 0; i < binaryKey.length; i++) {
    keyBytes[i] = binaryKey.charCodeAt(i);
  }

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    encoder.encode(signatureInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${signatureInput}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    throw new Error('Failed to get access token');
  }

  return tokenData.access_token;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gcsUri = searchParams.get('uri');

  if (!gcsUri) {
    return NextResponse.json(
      { error: 'GCS URI required' },
      { status: 400 }
    );
  }

  // Validate GCS URI format
  const match = gcsUri.match(/^gs:\/\/([^\/]+)\/(.+)$/);
  if (!match) {
    return NextResponse.json(
      { error: 'Invalid GCS URI format' },
      { status: 400 }
    );
  }

  const [, bucket, object] = match;

  try {
    const accessToken = await getAccessToken();
    const encodedObject = encodeURIComponent(object);

    // Fetch video from GCS
    const gcsResponse = await fetch(
      `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodedObject}?alt=media`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!gcsResponse.ok) {
      const errorText = await gcsResponse.text();
      console.error('GCS fetch error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch video from storage' },
        { status: gcsResponse.status }
      );
    }

    // Get content type
    const contentType = gcsResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = gcsResponse.headers.get('content-length');

    // Stream the video response
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    };

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    return new NextResponse(gcsResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Video proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to proxy video', details: errorMessage },
      { status: 500 }
    );
  }
}
