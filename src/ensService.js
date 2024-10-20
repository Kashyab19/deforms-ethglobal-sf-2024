import { ethers } from 'ethers';

// Mock storage for our fake ENS registrations
const mockENSRegistry = new Map();

// Function to get an Ethereum provider
const getProvider = () => {
  try {
    // Try to connect to Mainnet
    return new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/c7e053b04a7e465388c166c779634866');
  } catch (error) {
    console.warn('Failed to connect to Mainnet, falling back to mock provider');
    // Return a mock provider
    return {
      lookupAddress: () => Promise.resolve(null),
      resolveName: () => Promise.resolve(null)
    };
  }
};

export async function registerENS(address, name) {
  // This function will only use the mock registry
  return new Promise((resolve) => {
    setTimeout(() => {
      const fullName = name + '.eth';
      if (mockENSRegistry.has(fullName)) {
        console.log('This ENS name is already taken');
        resolve(false);
      } else {
        mockENSRegistry.set(fullName, address);
        mockENSRegistry.set(address, fullName);
        console.log(`Registered ${fullName} for address ${address}`);
        resolve(true);
      }
    }, 1000); // Simulate network delay
  });
}

export async function getENSName(address) {
  const provider = getProvider();
  try {
    // Try to resolve from the actual ENS
    const actualName = await provider.lookupAddress(address);
    if (actualName) {
      console.log(`Retrieved actual ENS name ${actualName} for address ${address}`);
      return actualName;
    }
  } catch (error) {
    console.warn('Error looking up actual ENS name, falling back to mock registry:', error);
  }

  // If not found in actual ENS or there was an error, check mock registry
  return new Promise((resolve) => {
    setTimeout(() => {
      const name = mockENSRegistry.get(address);
      console.log(`Retrieved mock name ${name} for address ${address}`);
      resolve(name || null);
    }, 500); // Simulate network delay
  });
}

export async function isENSNameAvailable(name) {
  // This function will only use the mock registry
  return new Promise((resolve) => {
    setTimeout(() => {
      const fullName = name + '.eth';
      const isAvailable = !mockENSRegistry.has(fullName);
      console.log(`Name ${fullName} is ${isAvailable ? 'available' : 'not available'} in mock registry`);
      resolve(isAvailable);
    }, 500);
  });
}
