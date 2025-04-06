import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";

// WalletConnect provider options
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: process.env.NEXT_PUBLIC_INFURA_ID, // Get one from infura.io
    },
  },
};

// Detect if we're in a mobile environment
export const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
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
    // Check if we're in mobile PWA
    if (isMobile() && isPWA() && !window.ethereum) {
      // Redirect to MetaMask mobile app
      window.location.href = `https://metamask.app.link/dapp/${window.location.host}`;
      return null;
    }

    // Standard browser with MetaMask
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      return { provider, signer, address };
    }

    // Fallback to WalletConnect for other cases
    const Web3Modal = (await import("web3modal")).default;
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
      providerOptions,
    });

    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
  } catch (error) {
    console.error("Wallet connection error:", error);
    throw error;
  }
};
