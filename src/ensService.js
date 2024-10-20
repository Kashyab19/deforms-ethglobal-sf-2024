import { ethers } from 'ethers';

// Mock storage for our fake ENS and RNS registrations
const mockENSRegistry = new Map();
const mockRNSRegistry = new Map();

// Function to get an Ethereum provider
const getProvider = () => {
  try {
    // Try to connect to Mainnet
    return new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/c7e053b04a7e465388c166c779634866');
  } catch (error) {
    console.warn('Failed to connect to Mainnet, falling back to mock provider');
    // Return a mock provider
    return {
      lookupAddress: () => Promise.resolve(null),
      resolveName: () => Promise.resolve(null)
    };
  }
};

// Function to get a Rootstock provider
const getRootstockProvider = () => {
  try {
    // Connect to Rootstock testnet
    return new ethers.JsonRpcProvider('https://rpc.testnet.rootstock.io/eRrAbzc5vDZQzrXYcG0i5j1rvxk3HT-T');
  } catch (error) {
    console.warn('Failed to connect to Rootstock testnet, falling back to mock provider');
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

export async function registerRNS(address, name) {
  // This function will only use the mock registry
  return new Promise((resolve) => {
    setTimeout(() => {
      const fullName = name + '.rsk';
      if (mockRNSRegistry.has(fullName)) {
        console.log('This RNS name is already taken');
        resolve(false);
      } else {
        mockRNSRegistry.set(fullName, address);
        mockRNSRegistry.set(address, fullName);
        console.log(`Registered ${fullName} for address ${address}`);
        resolve(true);
      }
    }, 1000); // Simulate network delay
  });
}

export async function getName(address) {
  const ethProvider = getProvider();
  const rskProvider = getRootstockProvider();

  try {
    // Try to resolve from the actual ENS
    const ensName = await ethProvider.lookupAddress(address);
    if (ensName) {
      console.log(`Retrieved actual ENS name ${ensName} for address ${address}`);
      return { name: ensName, type: 'ENS' };
    }

    // Try to resolve from the actual RNS
    const rnsName = await rskProvider.lookupAddress(address);
    if (rnsName) {
      console.log(`Retrieved actual RNS name ${rnsName} for address ${address}`);
      return { name: rnsName, type: 'RNS' };
    }
  } catch (error) {
    console.warn('Error looking up actual name, falling back to mock registry:', error);
  }

  // If not found in actual registries or there was an error, check mock registries
  return new Promise((resolve) => {
    setTimeout(() => {
      const ensName = mockENSRegistry.get(address);
      const rnsName = mockRNSRegistry.get(address);
      if (ensName) {
        console.log(`Retrieved mock ENS name ${ensName} for address ${address}`);
        resolve({ name: ensName, type: 'ENS' });
      } else if (rnsName) {
        console.log(`Retrieved mock RNS name ${rnsName} for address ${address}`);
        resolve({ name: rnsName, type: 'RNS' });
      } else {
        console.log(`No name found for address ${address}`);
        resolve({ name: null, type: null });
      }
    }, 500); // Simulate network delay
  });
}

export async function isNameAvailable(name) {
  const ethProvider = getProvider();
  const rskProvider = getRootstockProvider();

  try {
    // Check availability in actual ENS
    const ensAddress = await ethProvider.resolveName(name + '.eth');
    if (ensAddress) {
      console.log(`Name ${name}.eth is not available in actual ENS`);
      return false;
    }

    // Check availability in actual RNS
    const rnsAddress = await rskProvider.resolveName(name + '.rsk');
    if (rnsAddress) {
      console.log(`Name ${name}.rsk is not available in actual RNS`);
      return false;
    }
  } catch (error) {
    console.warn('Error checking actual name availability, falling back to mock registry:', error);
  }

  // If not found in actual registries or there was an error, check mock registries
  return new Promise((resolve) => {
    setTimeout(() => {
      const ensName = name + '.eth';
      const rnsName = name + '.rsk';
      const isAvailable = !mockENSRegistry.has(ensName) && !mockRNSRegistry.has(rnsName);
      console.log(`Name ${name} is ${isAvailable ? 'available' : 'not available'} in mock registries`);
      resolve(isAvailable);
    }, 500);
  });
}

export async function verifyNameOwnership(address, name) {
  const { name: resolvedName, type } = await getName(address);
  
  if (!resolvedName) {
    console.log(`No name found for address ${address}`);
    return false;
  }

  const match = resolvedName.toLowerCase() === name.toLowerCase();
  console.log(`Name ownership verification for ${address}: ${match ? 'Verified' : 'Failed'}`);
  return match;
}
