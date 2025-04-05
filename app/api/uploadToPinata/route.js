import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Get all form data parts
    const file = formData.get("file");
    const pinataMetadata = formData.get("pinataMetadata");
    const pinataOptions = formData.get("pinataOptions");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const pinataFormData = new FormData();
    pinataFormData.append("file", file);

    // Preserve the metadata structure from frontend
    if (pinataMetadata) {
      pinataFormData.append("pinataMetadata", pinataMetadata);
    }

    if (pinataOptions) {
      pinataFormData.append("pinataOptions", pinataOptions);
    } else {
      pinataFormData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));
    }

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: pinataFormData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.details || "Pinata upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(
      "https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pinata error: ${await response.text()}`);
    }

    const data = await response.json();

    const activeFiles = data.rows
      .filter((file) => file.date_pinned && !file.date_unpinned)
      .map((file) => ({
        id: file.ipfs_pin_hash,
        name: file.metadata?.name || "Untitled",
        size: file.size,
        date: file.date_pinned,
        url: `https://gateway.pinata.cloud/ipfs/${file.ipfs_pin_hash}`,
        // Extract custom metadata
        encryptedKey: file.metadata?.keyvalues?.encryptedKey,
        publicKey: file.metadata?.keyvalues?.publicKey,
        keyOwner: file.metadata?.keyvalues?.keyOwner,
        encryptionScheme: file.metadata?.keyvalues?.encryptionScheme,
        originalName: file.metadata?.keyvalues?.originalName,
      }));

    return NextResponse.json(activeFiles);
  } catch (error) {
    console.error("List error:", error);
    return NextResponse.json(
      { error: "Failed to list files", details: error.message },
      { status: 500 }
    );
  }
}
