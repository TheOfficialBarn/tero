import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const pinataFormData = new FormData();
    pinataFormData.append("file", file);

    const metadata = JSON.stringify({ name: file.name });
    pinataFormData.append("pinataMetadata", metadata);

    const options = JSON.stringify({ cidVersion: 1 });
    pinataFormData.append("pinataOptions", options);

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: pinataFormData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Pinata upload failed" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const response = await fetch('https://api.pinata.cloud/data/pinList?status=pinned', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`
      }
    });

    if (!response.ok) {
      throw new Error(`Pinata error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Filter only currently pinned files
    const activeFiles = data.rows.filter(file => 
      file.date_pinned && // Has pin date
      !file.date_unpinned // Not unpinned
    ).map(file => ({
      id: file.ipfs_pin_hash,
      name: file.metadata?.name || 'Untitled',
      size: file.size,
      date: file.date_pinned,
      url: `https://gateway.pinata.cloud/ipfs/${file.ipfs_pin_hash}`
    }));

    return NextResponse.json(activeFiles);
    
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json(
      { error: 'Failed to list files', details: error.message },
      { status: 500 }
    );
  }
}
