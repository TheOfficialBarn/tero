import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";

// WalletConnect provider options
// lib/wallet.js
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
      // Add explicit RPC configuration
      rpc: {
        1: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`,
        5: `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`,
        11155111: `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`,
      },
    },
  },
};
// Detect if we're in a mobile environment
export const isMobile = () => {
  // Check for mobile devices (iPhone, iPad, iPod, Android)
  const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Check for MacBooks (MacOS and MacBook keyword in user agent)
  const isMacBook =
    /Macintosh|Mac OS X/i.test(navigator.userAgent) &&
    /MacBook/i.test(navigator.userAgent);

  return isMobileDevice || isMacBook;
};

// Detect if we're in a PWA
export const isPWA = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone ||
    document.referrer.includes("android-app://")
  );
};

// Unified wallet connection
export const connectWallet = async () => {
  try {
    if (isMobile() && isPWA() && !window.ethereum) {
      window.location.href = `https://metamask.app.link/dapp/${window.location.host}`;
      return null;
    }

    // Check for MetaMask presence directly
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      return { provider, signer, address };
    }

    // Proceed with WalletConnect if MetaMask is not available
    if (!process.env.NEXT_PUBLIC_INFURA_ID) {
      throw new Error("Infura ID not configured");
    }

    const Web3Modal = (await import("web3modal")).default;
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
      providerOptions,
    });
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);

    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    return { provider, signer, address };
  } catch (error) {
    console.error("Connection error:", error);
    throw new Error(`Wallet connection failed: ${error.message}`);
  }
};


