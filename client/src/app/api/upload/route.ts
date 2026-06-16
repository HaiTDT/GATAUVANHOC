import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.IMGBB_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'IMGBB_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Chuyển file thành dạng Base64 để gửi ổn định hơn qua API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    const params = new URLSearchParams();
    params.append('image', base64Image);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to upload image to ImgBB');
    }

    return NextResponse.json({ url: data.data.url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
