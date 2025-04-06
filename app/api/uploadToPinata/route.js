import { NextResponse } from "next/server";

// Helper function to validate wallet address
const isValidEthAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const file = formData.get("file");
    const pinataMetadata = formData.get("pinataMetadata");
    const pinataOptions = formData.get("pinataOptions");

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" }, 
        { status: 400 }
      );
    }

    // Validate metadata contains required fields
    if (pinataMetadata) {
      const metadata = JSON.parse(pinataMetadata);
      if (!metadata.keyvalues?.keyOwner || !isValidEthAddress(metadata.keyvalues.keyOwner)) {
        return NextResponse.json(
          { error: "Invalid or missing keyOwner in metadata" },
          { status: 400 }
        );
      }
    }

    const pinataFormData = new FormData();
    pinataFormData.append("file", file);
    pinataFormData.append("pinataOptions", 
      pinataOptions || JSON.stringify({ cidVersion: 1 })
    );

    if (pinataMetadata) {
      pinataFormData.append("pinataMetadata", pinataMetadata);
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
      console.error("Pinata error:", data);
      return NextResponse.json(
        { error: data.error?.details || "Pinata upload failed" },
        { status: response.status }
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    // Validate wallet address if provided
    if (wallet && !isValidEthAddress(wallet)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    const pinataUrl = new URL("https://api.pinata.cloud/data/pinList");
    pinataUrl.searchParams.append("status", "pinned");
    pinataUrl.searchParams.append("pageLimit", "1000");
    
    if (wallet) {
      pinataUrl.searchParams.append(
        "metadata[keyvalues][keyOwner]",
        `{"value":"${wallet}","op":"eq"}`
      );
    }

    const response = await fetch(pinataUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Pinata error: ${await response.text()}`);
    }

    const data = await response.json();

    const activeFiles = data.rows.map((file) => ({
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
      mimeType: file.metadata?.keyvalues?.mimeType,
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
